const async = require('async');
const _ = require('lodash');
const nodeFetch = require('node-fetch');
const AbortController = require('abort-controller');
const { backOff } = require('exponential-backoff');

const {
	getClusterData,
	getClusterColumnNames,
	getClusterFieldMetadataBatch,
	getTableSchemaColumnsForDdlFallback,
	getViewNamesCommand,
} = require('./pythonScriptGeneratorHelper');
const { prepareNamesForInsertionIntoScalaCode, removeParentheses } = require('./utils');
const { generateSamplesScript } = require('../../forward_engineering/sampleGeneration/sampleGenerationService');
const { batchProcessFile } = require('./fileHelper');
const {
	COMMAND_EXECUTION_STATUS,
	REQUEST_TIMEOUT_MESSAGE,
	FIELD_METADATA_COLUMN_BATCH_SIZE,
	SPARK_LANGUAGE,
} = require('../../shared/constants');
const { prepareName } = require('../../shared/general');
const BATCH_SIZE = 5000;

const COMMAND_EXECUTION_MAX_DELAY = 3000;

let activeContexts = {};

const fetch = (query, options, attempts = 10) => {
	let { timeout, logger, ...fetchOptions } = options || {};
	let controller = createAbortController(timeout);

	fetchOptions = {
		...fetchOptions,
		signal: controller.signal,
	};

	return nodeFetch(query, fetchOptions)
		.then(response => {
			controller.clear();

			return response;
		})
		.catch(error => {
			controller.clear();

			if (['ENOTFOUND', 'ECONNRESET'].includes(error?.code) && attempts) {
				logger.log(
					'info',
					{ message: 'Failed to connect server: ' + error.message, code: error.code, attempts },
					'Execute request',
				);

				return new Promise((resolve, reject) => {
					setTimeout(() => {
						fetch(query, options, attempts - 1).then(resolve, reject);
					}, 1000);
				});
			} else if (error.type === 'aborted') {
				throw new Error(REQUEST_TIMEOUT_MESSAGE);
			} else {
				throw error;
			}
		});
};

const createAbortController = timeout => {
	if (!timeout) {
		return { signal: undefined, clear() {} };
	}
	let controller = new AbortController();

	const timer = setTimeout(() => {
		controller.abort();
	}, timeout);

	return {
		signal: controller.signal,
		clear() {
			clearTimeout(timer);
		},
	};
};

const destroyActiveContext = () => {
	let result = Promise.resolve();
	if (activeContexts.scala) {
		result = destroyContext(activeContexts.scala.connectionInfo, activeContexts.scala.id);
	}
	if (activeContexts.sql) {
		result = destroyContext(activeContexts.sql.connectionInfo, activeContexts.sql.id);
	}

	activeContexts = {};

	return result;
};

/**

 * @param {Object} params - property bag
 * @param {Object} params.connectionInfo
 * @param {Array<Object>} params.samples
 * @param {Object} params.entityJsonSchema
 * @param {Object} params.logger
 *
 * @returns {Promise<any>}
 */
const sendSampleBatch = ({ connectionInfo, samples, entityJsonSchema, logger }) => {
	const script = generateSamplesScript(entityJsonSchema, samples);
	return executeCommand({ connectionInfo, command: script, logger });
};

/**
 * @param lineNumber {number}
 * @return {boolean}
 * */
const shouldLogStep = lineNumber => {
	if (lineNumber < 1000) {
		return lineNumber % 100 === 0;
	}
	return lineNumber % 1000 === 0;
};

/**
 * @return {(lineIndex: number, amountOfLines: number) => void}
 * */
const logProgressOfSendingSampleBatches = logger => (lineIndex, amountOfLines) => {
	if (!shouldLogStep(lineIndex)) {
		return;
	}

	const progress = Number(lineIndex / amountOfLines);

	const message =
		lineIndex === 0
			? `Start inserting data`
			: `Inserted ${lineIndex} lines out of ${amountOfLines}, progress ${progress.toFixed(2)}%`;

	logger.log('info', { message }, 'SEND_SAMPLE_BATCHES');
	logger.progress({ message });
};

const sendSampleBatches = async ({ connectionInfo, logger }) => {
	const { entitiesData } = connectionInfo;

	for (const entityData of Object.values(entitiesData)) {
		const { filePath, jsonSchema } = entityData;
		// Not pushing the sample displayed on the DML screen because it's a part of "Create table" script

		await batchProcessFile({
			filePath,
			batchSize: BATCH_SIZE,
			parseLine: line => JSON.parse(line),
			batchHandler: batch => {
				return sendSampleBatch({ connectionInfo, samples: batch, entityJsonSchema: jsonSchema, logger });
			},
			logProgress: logProgressOfSendingSampleBatches(logger),
		});
	}
};

const fetchApplyToInstance = async (connectionInfo, logger) => {
	const progress = message => {
		logger.log('info', message, 'Applying to instance');
		logger.progress({ message });
	};

	progress({ message: `Applying script: \n ${connectionInfo.script}` });

	await Promise.race([
		executeCommand({ connectionInfo, command: connectionInfo.script, logger }).then(() => {
			return sendSampleBatches({ connectionInfo, logger });
		}),
		new Promise(() =>
			setTimeout(() => {
				throw new Error('Timeout exceeded for script\n' + connectionInfo.script);
			}, connectionInfo.applyToInstanceQueryRequestTimeout || 120000),
		),
	]);
};

const getSampleDocSize = async ({ connectionInfo, dbName, tableName, recordSamplingSettings, logger }) => {
	if (recordSamplingSettings.active === 'absolute') {
		return Number(recordSamplingSettings.absolute.value);
	}

	const countResult = await executeCommand({
		connectionInfo,
		command: `SELECT COUNT(*) FROM \`${dbName}\`.\`${tableName}\``,
		logger,
	});

	const count = _.get(countResult, '[0][0]', 0);
	const limit = Math.ceil((count * recordSamplingSettings.relative.value) / 100);

	logger.log('info', { message: `Found ${count} records`, dbName, tableName }, 'Getting documents');

	return Math.min(limit, recordSamplingSettings.maxValue);
};

const fetchDocuments = async ({ connectionInfo, dbName, tableName, fields, recordSamplingSettings, logger }) => {
	try {
		const limit = await getSampleDocSize({ connectionInfo, recordSamplingSettings, dbName, tableName, logger });

		if (limit <= 0) {
			return [];
		}

		const columnsToSelect = fields.map(field => field.name);
		const columnsToSelectString = columnsToSelect.map(fieldName => `\`${fieldName}\``).join(', ');
		const sqlQuery = `SELECT ${columnsToSelectString} FROM \`${dbName}\`.\`${tableName}\` LIMIT ${limit}`;
		const documentsResult = await executeCommand({ connectionInfo, command: sqlQuery, logger });

		logger.log('info', { message: `Execute query: ${sqlQuery}`, dbName, tableName }, 'Getting documents');

		return documentsResult.map(result =>
			columnsToSelect.reduce(
				(document, colName, index) => ({
					...document,
					[colName]: result[index],
				}),
				{},
			),
		);
	} catch (e) {
		logger.log('error', { message: e.message, stack: e.stack, dbName, tableName }, 'Getting documents');

		return [];
	}
};

const fetchEntitySchema = async ({ connectionInfo, dbName, entityName, logger }) => {
	try {
		const sqlQuery = `DESC \`${dbName}\`.\`${entityName}\``;
		const schemaResult = await executeCommand({ connectionInfo, command: sqlQuery, logger });

		logger.log('info', { message: `Execute query: ${sqlQuery}`, dbName, entityName }, 'Getting schema');

		const truncatedColumns = schemaResult
			.map(([name, dataType], i) => (/more fields>*$/.test(dataType) ? [name, i] : null))
			.filter(Boolean);

		if (truncatedColumns.length) {
			await truncatedColumns.reduce(async (prev, [columnName, position]) => {
				await prev;
				const DATA_TYPE_COLUMN = 1;
				const DATA_TYPE_ROW = 1;
				const result = await executeCommand({
					connectionInfo,
					command: `${sqlQuery} \`${columnName}\``,
					logger,
				});
				schemaResult[position][DATA_TYPE_COLUMN] = result[DATA_TYPE_ROW][DATA_TYPE_COLUMN];
			}, Promise.resolve());
		}

		return schemaResult;
	} catch (e) {
		logger.log('error', { message: e.message, stack: e.stack, dbName, entityName }, 'Getting schema');

		throw {
			type: 'warning',
			code: 'VIEW_SCHEMA_ERROR',
			dbName,
			entityName,
		};
	}
};

const getDescribeColumnRowsFromDesc = viewSchema => {
	if (!Array.isArray(viewSchema)) {
		return [];
	}

	const columnRows = [];

	for (const row of viewSchema) {
		const columnName = row?.[0];
		if (typeof columnName !== 'string') {
			continue;
		}

		const trimmedName = columnName.trim();
		if (!trimmedName || trimmedName.startsWith('#')) {
			break;
		}

		columnRows.push(row);
	}

	return columnRows;
};

const mapSparkSchemaColumnsToDescribeRows = columns => {
	if (!Array.isArray(columns)) {
		return [];
	}

	return columns.map(({ name, colType }) => [name, colType]);
};

const fetchViewSchema = async ({ connectionInfo, dbName, entityName, catalogName, logger }) => {
	const fullName = buildSparkTableFullNameForPython({
		schemaName: prepareName(dbName),
		tableName: prepareName(entityName),
		catalogName: prepareName(catalogName || connectionInfo.catalogName),
	});

	try {
		const command = getTableSchemaColumnsForDdlFallback({ fullName });
		const raw = await executeCommand({
			connectionInfo,
			command,
			language: SPARK_LANGUAGE.python,
			logger,
		});
		const columns = JSON.parse(coercePythonNotebookOutput(raw));

		logger.log(
			'info',
			{ message: `View schema from spark.table(${fullName})`, dbName, entityName },
			'Getting view schema',
		);

		return mapSparkSchemaColumnsToDescribeRows(columns);
	} catch (pythonError) {
		logger.log(
			'info',
			{ message: pythonError.message, dbName, entityName },
			'fetchViewSchema Python failed; falling back to DESC',
		);

		const descRows = await fetchEntitySchema({ connectionInfo, dbName, entityName, logger });
		return getDescribeColumnRowsFromDesc(descRows);
	}
};

const fetchSample = async ({ connectionInfo, dbName, entityName, logger }) => {
	try {
		const sqlQuery = `SELECT * FROM \`${dbName}\`.\`${entityName}\` LIMIT 1`;
		const schemaResult = await executeCommand({ connectionInfo, command: sqlQuery, logger });

		logger.log('info', { message: `Execute query: ${sqlQuery}`, dbName, entityName }, 'Fetching sample');

		return schemaResult;
	} catch (e) {
		logger.log('error', { message: e.message, stack: e.stack, dbName, entityName }, 'Fetching sample');

		return [];
	}
};

const fetchClusterProperties = async connectionInfo => {
	const query = connectionInfo.host + `/api/2.0/clusters/get?cluster_id=${connectionInfo.clusterId}`;
	const options = getRequestOptions(connectionInfo);
	return await fetch(query, options)
		.then(response => response.json())
		.then(body => {
			if (body.error_code) {
				throw {
					message: body.message,
					code: body.error_code,
				};
			}

			return body;
		});
};

const useCatalog = async ({ connectionInfo, logger }) => {
	const command = `USE CATALOG '${connectionInfo.catalogName}';`;
	await executeCommand({ connectionInfo, command, logger });
};

const fetchClusterCatalogNames = async ({ connectionInfo, logger }) => {
	const result = await executeCommand({ connectionInfo, command: 'SHOW CATALOGS', logger });
	return _.flattenDeep(result);
};

const fetchClusterDatabasesNames = async ({ connectionInfo, logger }) => {
	const result = await executeCommand({ connectionInfo, command: 'SHOW DATABASES', logger });
	return _.flattenDeep(result);
};

const fetchDatabaseViewsNames = ({ dbName, connectionInfo, logger }) =>
	executeCommand({ connectionInfo, command: `SHOW VIEWS IN \`${dbName}\``, logger });

const fetchDatabaseViewsNamesViaPython = ({ dbName, connectionInfo, logger }) =>
	executeCommand({
		connectionInfo,
		command: getViewNamesCommand({ dbName }),
		language: SPARK_LANGUAGE.python,
		logger,
	});

const fetchClusterTablesNames = ({ dbName, connectionInfo, logger }) =>
	executeCommand({ connectionInfo, command: `SHOW TABLES IN \`${dbName}\``, logger });

const fetchClusterData = async (
	connectionInfo,
	collectionsNames,
	databasesNames,
	isManagedLocationSupports,
	logger,
) => {
	const databasesPropertiesResult = await async.mapLimit(databasesNames, 40, async dbName => {
		logger.log('info', '', `Start describe schema: ${dbName} `);

		const dbInfoResult = await executeCommand({
			connectionInfo,
			command: `DESCRIBE DATABASE EXTENDED \`${dbName}\``,
			logger,
		});

		logger.log('info', '', `Schema: ${dbName} successfully described`);

		const dbProperties = dbInfoResult.reduce((dbProperties, row) => {
			const key = row[0];
			const value = row[1];

			switch (key) {
				case 'Location': {
					const propertyName = isManagedLocationSupports ? 'managedLocation' : 'location';
					return { ...dbProperties, [propertyName]: value };
				}
				case 'Comment':
					return { ...dbProperties, description: value };
				case 'Properties':
					return { ...dbProperties, dbProperties: convertDbProperties(value) };
				case 'Catalog Name':
					return { ...dbProperties, catalogName: value };
				default:
					return dbProperties;
			}
		}, {});

		return { dbName, dbProperties };
	});

	const databasesProperties = databasesPropertiesResult.reduce(
		(properties, { dbName, dbProperties }) => ({ ...properties, [dbName]: dbProperties }),
		{},
	);

	const databasesTablesInfo = await fetchFieldMetadata(databasesNames, collectionsNames, connectionInfo, logger);

	return databasesNames.reduce(
		(clusterData, dbName) => ({
			...clusterData,
			[dbName]: {
				dbTables: _.get(databasesTablesInfo, dbName, []),
				dbProperties: _.get(databasesProperties, dbName, {}),
			},
		}),
		{},
	);
};

/**
 * @param {unknown} raw
 * @return {string}
 */
const coercePythonNotebookOutput = raw => {
	if (raw == null) {
		return '';
	}

	if (typeof raw === 'string') {
		return raw.trim();
	}

	if (Array.isArray(raw)) {
		const mapSubArrays = row => row.map(content => String(content ?? '')).join('');

		return raw.map(row => (Array.isArray(row) ? mapSubArrays(row) : String(row ?? ''))).join('\n');
	}

	if (typeof raw === 'object') {
		if (raw.data != null) {
			return String(raw.data).trim();
		}
		try {
			return JSON.stringify(raw);
		} catch {
			return '';
		}
	}

	return String(raw).trim();
};

/**
 * @param {unknown} err
 * @return {string}
 */
const stringifyErrorMessage = err => {
	if (err == null) {
		return '';
	}
	if (typeof err === 'string') {
		return err;
	}
	if (typeof err === 'object' && err.message != null) {
		return String(err.message);
	}
	try {
		return JSON.stringify(err);
	} catch {
		return String(err);
	}
};

const isNotebookOutputTruncation = str => /\*\*\* WARNING:.*output/i.test(str);

/**
 * @param {string} message
 * @return {boolean}
 */
const isOutputLimitExceeded = message =>
	/results too large/i.test(message) ||
	/max output size exceeded/i.test(message) ||
	/skipped \d* bytes of output/i.test(message);

const chunkColumnNames = (names, size) => {
	const out = [];
	for (let i = 0; i < names.length; i += size) {
		out.push(names.slice(i, i + size));
	}
	return out;
};

const mergeTableFieldBatches = partials =>
	partials.reduce(
		(acc, partial) => ({
			name: partial.name,
			nullableMap: { ...acc.nullableMap, ...partial.nullableMap },
			indexes: { ...acc.indexes, ...partial.indexes },
		}),
		{ name: '', nullableMap: {}, indexes: {} },
	);

/**
 * @param {Object} params - property bag
 * @param {Record<string, Array<{ name: string, columns: string[] }>>} params.columnPlan
 * @param {Object} params.connectionInfo
 * @param {Object} params.logger
 * @returns {Promise<Record<string, object[]>>}
 */
const fetchClusterFieldMetadataInBatches = async ({ columnPlan, connectionInfo, logger }) => {
	const tasks = [];

	for (const dbName of Object.keys(columnPlan)) {
		for (const table of columnPlan[dbName]) {
			const batches = chunkColumnNames(table.columns, FIELD_METADATA_COLUMN_BATCH_SIZE);
			const batchList = batches.length ? batches : [[]];

			for (const batch of batchList) {
				tasks.push({ dbName, tableName: table.name, batch });
			}
		}
	}

	const rows = await async.mapLimit(tasks, 10, async ({ dbName, tableName, batch }) => {
		const columnsJson = JSON.stringify(batch);
		const command = getClusterFieldMetadataBatch({ dbName, tableName, columnsJson });
		const out = await executeCommand({ connectionInfo, command, language: SPARK_LANGUAGE.python, logger });
		const parsed = JSON.parse(coercePythonNotebookOutput(out));
		return { dbName, tableName, table: parsed };
	});

	const byTable = new Map();

	const keySeparator = '_';

	for (const row of rows) {
		const key = `${row.dbName}${keySeparator}${row.tableName}`;
		if (!byTable.has(key)) {
			byTable.set(key, []);
		}
		byTable.get(key).push(row.table);
	}

	const clusterData = {};

	for (const dbName of Object.keys(columnPlan)) {
		clusterData[dbName] = columnPlan[dbName].map(({ name }) => {
			const key = `${dbName}${keySeparator}${name}`;
			const parts = byTable.get(key) || [];
			return mergeTableFieldBatches(parts);
		});
	}

	return clusterData;
};

const fetchFieldMetadataBatched = async (namesJoined, connectionInfo, logger, previousData = {}) => {
	const columnListCommand = getClusterColumnNames(namesJoined);

	logger.log(
		'info',
		'',
		`Start retrieving tables info (batched): \nDatabases: ${namesJoined.databasesNames} \nTables: ${namesJoined.tablesNames}`,
	);

	const namesRaw = await executeCommand({
		connectionInfo,
		command: columnListCommand,
		language: SPARK_LANGUAGE.python,
		logger,
	});

	const namesStr = coercePythonNotebookOutput(namesRaw);

	if (isNotebookOutputTruncation(namesStr)) {
		throw new Error('Databricks truncated the column name list. Try reverse-engineering fewer tables at once.');
	}

	let columnPlan;

	try {
		columnPlan = JSON.parse(namesStr);
	} catch (error) {
		logger.log('error', { error }, `Column list parse failed. Snippet: ${namesStr.slice(0, 1500)}`);
		throw error;
	}

	const clusterData = await fetchClusterFieldMetadataInBatches({ columnPlan, connectionInfo, logger });

	logger.log('info', '', 'Finished retrieving table field metadata (batched).');

	return mergeChunksOfData(previousData, clusterData);
};

const fetchFieldMetadata = async (databasesNames, collectionsNames, connectionInfo, logger, previousData = {}) => {
	const { tableNames, dbNames } = prepareNamesForInsertionIntoScalaCode(databasesNames, collectionsNames);

	const tableNamesJoined = tableNames.join(', ');
	const dbNamesJoined = dbNames.join(', ');

	const namesJoined = {
		tablesNames: tableNamesJoined,
		databasesNames: dbNamesJoined,
	};

	try {
		const getFullClusterInfoCommand = getClusterData(namesJoined);

		logger.log(
			'info',
			'',
			`Start retrieving tables info: \nDatabases: ${dbNames.join(', ')} \nTables: ${tableNames.join(', ')}`,
		);

		const rawOutput = await executeCommand({
			connectionInfo,
			command: getFullClusterInfoCommand,
			language: SPARK_LANGUAGE.python,
			logger,
		});

		const str = coercePythonNotebookOutput(rawOutput);

		if (isNotebookOutputTruncation(str)) {
			logger.log('info', '', 'Cluster field metadata output truncated; using batched retrieval.');
			return fetchFieldMetadataBatched(namesJoined, connectionInfo, logger, previousData);
		}

		try {
			const parsed = JSON.parse(str);
			logger.log('info', '', 'Finished retrieving table field metadata (single command).');

			return mergeChunksOfData(previousData, parsed);
		} catch (parseError) {
			logger.log(
				'warning',
				{ error: parseError },
				'Single-pass metadata JSON parse failed; using batched retrieval.',
			);

			return fetchFieldMetadataBatched(namesJoined, connectionInfo, logger, previousData);
		}
	} catch (error) {
		const msg = stringifyErrorMessage(error);
		if (isOutputLimitExceeded(msg)) {
			logger.log(
				'info',
				{ message: msg.slice(0, 300) },
				'Single-pass cluster metadata failed; using batched retrieval.',
			);
			return fetchFieldMetadataBatched(namesJoined, connectionInfo, logger, previousData);
		}
		throw error;
	}
};

const mergeChunksOfData = (leftObj, rightObj) => {
	return _.mergeWith(leftObj, rightObj, (objValue, srcValue) => {
		if (Array.isArray(objValue) && Array.isArray(srcValue)) {
			return objValue.concat(srcValue);
		}
	});
};

/**
 * @param {string} entityName - `` `default`.`my_table` ``
 * @return {{ schemaName: string, tableName: string } | null}
 */
const parseEntityBacktickParts = entityName => {
	const parts = new RegExp(/`([^`]+)`\.`([^`]+)`/).exec(String(entityName));
	return parts ? { schemaName: parts[1], tableName: parts[2] } : null;
};

/**
 * Python notebook context does not inherit USE CATALOG from the SQL context; qualify with catalog when present.
 * @param {Object} params - property bag
 * @param {string} params.schemaName
 * @param {string} params.tableName
 * @param {string} [params.catalogName]
 * @return {string}
 */
const buildSparkTableFullNameForPython = ({ schemaName, tableName, catalogName } = {}) => {
	if (catalogName) {
		return `${catalogName}.${schemaName}.${tableName}`;
	}
	return `${schemaName}.${tableName}`;
};

/**
 * @param {string} entityName
 * @param {Array<{ name: string, colType: string }>} columns
 * @return {string}
 */
const buildMinimalCreateTableFromSchema = (entityName, columns) => {
	if (!columns.length) {
		return '';
	}

	const lines = columns
		.map(column => {
			return `  \`${String(column.name).replaceAll('`', '')}\` ${column.colType}`;
		})
		.join(',\n');

	return `CREATE TABLE ${entityName} (\n${lines}\n)\nUSING DELTA`;
};

const fetchCreateStatementRequest = async (entityName, connectionInfo, logger, ddlOptions = {}) => {
	try {
		const result = await executeCommand({ connectionInfo, command: `SHOW CREATE TABLE ${entityName};`, logger });
		return _.get(result, '[0][0]', '');
	} catch (error) {
		const msg = stringifyErrorMessage(error);

		if (!isOutputLimitExceeded(msg)) {
			logger.log('error', error, `Error during retrieve create table DDL statement. Table name: ${entityName}`);
			return '';
		}

		logger.log(
			'info',
			{ message: msg.slice(0, 500) },
			`SHOW CREATE TABLE result too large for ${entityName}; building minimal DDL from Spark schema.`,
		);

		const parts = parseEntityBacktickParts(entityName);

		if (!parts) {
			logger.log('warning', { entityName }, 'Cannot parse schema/table for DDL fallback.');
			return '';
		}

		const catalogForFqn = ddlOptions.resolvedCatalogName || connectionInfo.catalogName;

		const fullName = buildSparkTableFullNameForPython({
			schemaName: parts.schemaName,
			tableName: parts.tableName,
			catalogName: prepareName(catalogForFqn),
		});

		try {
			const script = getTableSchemaColumnsForDdlFallback({ fullName });
			const raw = await executeCommand({
				connectionInfo,
				command: script,
				language: SPARK_LANGUAGE.python,
				logger,
			});
			const columns = JSON.parse(coercePythonNotebookOutput(raw));
			return buildMinimalCreateTableFromSchema(entityName, columns);
		} catch (fallbackError) {
			logger.log('error', fallbackError, `DDL fallback failed for ${entityName}`);
			return '';
		}
	}
};

const getRequestOptions = connectionInfo => {
	const headers = {
		Authorization: 'Bearer ' + connectionInfo.accessToken,
	};

	return {
		method: 'GET',
		headers: headers,
		timeout: connectionInfo.queryRequestTimeout,
		logger: connectionInfo.logger || { log: () => {} },
	};
};

const postRequestOptions = (connectionInfo, body) => {
	const headers = {
		'Content-Type': 'application/json',
		Authorization: 'Bearer ' + connectionInfo.accessToken,
	};

	return {
		method: 'POST',
		timeout: connectionInfo.queryRequestTimeout,
		logger: connectionInfo.logger || { log: () => {} },
		headers,
		body,
	};
};

const createContext = (connectionInfo, language) => {
	if (activeContexts[language]) {
		return Promise.resolve(activeContexts[language].id);
	}
	const query = connectionInfo.host + '/api/1.2/contexts/create';
	const body = JSON.stringify({
		language,
		clusterId: connectionInfo.clusterId,
	});
	const options = postRequestOptions(connectionInfo, body);

	return fetch(query, options)
		.then(async response => {
			if (response.ok) {
				return response.text();
			}
			const description = await response.json();
			throw {
				message: `${response.statusText}\n${JSON.stringify(description)}`,
				code: response.status,
				description,
			};
		})
		.then(body => {
			body = JSON.parse(body);
			activeContexts[language] = {
				id: body.id,
				connectionInfo,
			};
			return activeContexts[language].id;
		});
};

const destroyContext = (connectionInfo, contextId) => {
	const query = connectionInfo.host + '/api/1.2/contexts/destroy';
	const body = JSON.stringify({
		contextId: contextId,
		clusterId: connectionInfo.clusterId,
	});
	const options = postRequestOptions(connectionInfo, body);
	return fetch(query, options)
		.then(async response => {
			const responseBody = await response.text();
			if (response.ok) {
				return responseBody;
			}
			throw {
				message: response.statusText,
				code: response.status,
				description: body,
				responseBody,
			};
		})
		.then(body => {
			return JSON.parse(body);
		});
};

const runCommand = ({ connectionInfo, contextId, command, language, logger }) => {
	const { clusterId } = connectionInfo;
	const query = connectionInfo.host + '/api/1.2/commands/execute';

	const commandOptions = JSON.stringify({
		language,
		clusterId,
		contextId,
		command,
	});

	const options = postRequestOptions(connectionInfo, commandOptions);

	const notFinishedJob = err =>
		[COMMAND_EXECUTION_STATUS.QUEUED, COMMAND_EXECUTION_STATUS.RUNNING].includes(err?.message);

	return fetch(query, options)
		.then(async response => {
			const responseBody = await response.text();
			if (response.ok) {
				return responseBody;
			}
			throw {
				message: response.statusText,
				code: response.status,
				description: commandOptions,
				responseBody,
			};
		})
		.then(body => {
			const { id: commandId } = JSON.parse(body);

			const query = new URL(connectionInfo.host + '/api/1.2/commands/status');

			const params = {
				clusterId,
				contextId,
				commandId,
			};

			query.search = new URLSearchParams(params).toString();

			const options = getRequestOptions(connectionInfo);
			const request = () => getCommandExecutionResult({ query, options, commandOptions });

			const extraAttempts = 3;
			// The number of allowed requests within the preconfigured timeout (from global RE `queryRequestTimeout` option)
			const numOfAttempts = Math.round(options.timeout / COMMAND_EXECUTION_MAX_DELAY) + extraAttempts;

			const retry = (err, attemptNum) => {
				if (attemptNum === numOfAttempts) {
					logger.log('info', `max retries (${numOfAttempts}) exceeded`, 'API command progress');
					return false;
				}

				if (notFinishedJob(err)) {
					// log each 10 iteration
					if (attemptNum % 10 === 0) {
						const message = `Command ID: ${commandId}, status: ${err.message}, retry count: ${attemptNum}`;
						logger.log('info', message, 'API command progress');
					}

					return true;
				}
			};

			return backOff(request, {
				// the job, usually, not available immediately
				delayFirstAttempt: true,
				maxDelay: COMMAND_EXECUTION_MAX_DELAY,
				numOfAttempts,
				retry,
			});
		})
		.catch(err => {
			if (notFinishedJob(err)) {
				throw new Error(REQUEST_TIMEOUT_MESSAGE);
			}

			throw err;
		});
};

const getSqlSparkConfig = config => {
	return Object.keys(config)
		.map(key => {
			return `SET ${key} = ${config[key]};`;
		})
		.join('\n');
};

const getPythonSparkConfig = config => {
	return Object.keys(config)
		.map(key => {
			return `spark.conf.set("${key}", "${config[key]}")`;
		})
		.join('\n');
};

const executeCommand = ({ connectionInfo, command, language = SPARK_LANGUAGE.sql, logger }) => {
	return createContext(connectionInfo, language).then(async contextId => {
		const payload = {
			connectionInfo,
			contextId,
			language,
			logger,
		};

		if (connectionInfo.sparkConfig && Object.keys(connectionInfo.sparkConfig).length) {
			let sparkConfig;

			if (language === SPARK_LANGUAGE.sql) {
				sparkConfig = getSqlSparkConfig(connectionInfo.sparkConfig);
			} else if (language === SPARK_LANGUAGE.python) {
				sparkConfig = getPythonSparkConfig(connectionInfo.sparkConfig);
			}

			if (sparkConfig) {
				await runCommand({ ...payload, command: sparkConfig });
			}
		}

		return await runCommand({ ...payload, command });
	});
};

const getCommandExecutionErrorDetail = body => {
	const error = body?.results;
	if (error) {
		const parts = [error.data, error.cause].filter(v => v != null && String(v).length).map(String);
		if (parts.length) {
			return parts.join(' | ');
		}
	}
	try {
		const s = JSON.stringify(body);
		return s.length > 4000 ? `${s.slice(0, 4000)}…` : s;
	} catch {
		return 'Command execution failed';
	}
};

const getCommandExecutionResult = ({ query, options, commandOptions }) => {
	return fetch(query, options)
		.then(async response => {
			const responseBody = await response.text();
			if (response.ok) {
				return responseBody;
			}
			throw {
				message: response.statusText,
				code: response.status,
				description: commandOptions,
				responseBody,
			};
		})
		.then(body => {
			body = JSON.parse(body);

			if (body.status === COMMAND_EXECUTION_STATUS.FINISHED && body.results !== null) {
				if (body.results.resultType === 'error') {
					throw {
						message: body.results.data || body.results.cause,
						code: '',
						description: commandOptions,
					};
				}
				return body.results.data;
			}

			if (body.status === COMMAND_EXECUTION_STATUS.ERROR) {
				throw {
					message: getCommandExecutionErrorDetail(body),
					code: '',
					description: commandOptions,
				};
			}

			// Should be handled correctly by `backOff` mechanism with the retry
			throw new Error(body.status);
		});
};

const convertDbPropertyValue = value => {
	const isNumber = value => !_.isNaN(_.toNumber(value));
	const isBoolean = value => _.toLower(value) === 'false' || _.toLower(value) === 'true';
	const convertToBoolean = value => {
		switch (_.toLower(value)) {
			case 'true':
				return true;
			case 'false':
				return false;
		}
	};

	if (isNumber(value)) {
		return _.toNumber(value);
	} else if (isBoolean(value)) {
		return convertToBoolean(value);
	} else {
		return `'${value}'`;
	}
};

const splitStatementsByBrackets = statements => {
	let result = [];
	let startIndex = 0;
	let skippedBrackets = 0;
	_.range(statements.length).forEach(index => {
		const symbol = statements.charAt(index);
		if (symbol === '(' && startIndex) {
			skippedBrackets++;
		} else if (symbol === '(') {
			startIndex = index + 1;
		} else if (symbol === ')' && skippedBrackets) {
			skippedBrackets--;
		} else if (symbol === ')') {
			const statement = statements.slice(startIndex, index);
			result = result.concat(statement);
			startIndex = 0;
			skippedBrackets = 0;
		}
	});

	return result;
};

const convertDbProperties = (dbProperties = '') => {
	return splitStatementsByBrackets(removeParentheses(dbProperties))
		.map(keyValueString => {
			const splitterIndex = keyValueString.indexOf(',');
			const keyword = keyValueString.slice(0, splitterIndex);
			const value = keyValueString.slice(splitterIndex + 1, keyValueString.length);
			return `'${keyword}'=${convertDbPropertyValue(value)}`;
		})
		.join(',\n');
};

const getFetchForUnityTags =
	({ connectionInfo, logger }) =>
	async command => {
		try {
			return await executeCommand({ connectionInfo, command, logger });
		} catch (error) {
			logger.log('error', error, 'Error during retrieve tags');

			return [];
		}
	};

const fetchTagsForUnityCatalogs = async (connectionInfo, logger) => {
	try {
		const fetchUnityTagsForSingleLevel = getFetchForUnityTags({ connectionInfo, logger });

		const catalogTagsQuery = 'SELECT * FROM system.information_schema.catalog_tags;';
		const schemaTagsQuery = 'SELECT * FROM system.information_schema.schema_tags;';
		const tableTagsQuery = 'SELECT * FROM system.information_schema.table_tags;';
		const columnTagsQuery = 'SELECT * FROM system.information_schema.column_tags;';

		const catalogTags = await fetchUnityTagsForSingleLevel(catalogTagsQuery);
		const schemaTags = await fetchUnityTagsForSingleLevel(schemaTagsQuery);
		const tableTags = await fetchUnityTagsForSingleLevel(tableTagsQuery);
		const columnTags = await fetchUnityTagsForSingleLevel(columnTagsQuery);

		return {
			catalogTags,
			schemaTags,
			tableTags,
			columnTags,
		};
	} catch (error) {
		logger.log('error', error, 'Error during retrieve tags');
		return {};
	}
};

module.exports = {
	fetchClusterProperties,
	fetchApplyToInstance,
	fetchDocuments,
	destroyActiveContext,
	fetchClusterData,
	fetchCreateStatementRequest,
	fetchClusterCatalogNames,
	fetchClusterDatabasesNames,
	fetchDatabaseViewsNames,
	fetchClusterTablesNames,
	fetchDatabaseViewsNamesViaPython,
	fetchEntitySchema,
	fetchViewSchema,
	useCatalog,
	fetchSample,
	fetchTagsForUnityCatalogs,
};
