'use strict';
const nodeFetch = require('node-fetch');
const AbortController = require('abort-controller');
const { dependencies } = require('../appDependencies');
const { getClusterData, getViewNamesCommand } = require('./pythonScriptGeneratorHelper');
const { prepareNamesForInsertionIntoScalaCode, removeParentheses } = require('./utils');

const JSON_OBJECTS_DELIMITER = '}, {';

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
				throw new Error(
					'Request timeout exceeded, please try again or increase query request timeout in Tools > Options > Reverse-Engineering',
				);
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

const fetchApplyToInstance = async (connectionInfo, logger) => {
	const progress = message => {
		logger.log('info', message, 'Applying to instance');
		logger.progress(message);
	};

	progress({ message: `Applying script: \n ${connectionInfo.script}` });

	await Promise.race([
		executeCommand(connectionInfo, connectionInfo.script, 'sql'),
		new Promise((_r, rej) =>
			setTimeout(() => {
				throw new Error('Timeout exceeded for script\n' + script);
			}, connectionInfo.applyToInstanceQueryRequestTimeout || 120000),
		),
	]);
};

const getSampleDocSize = async ({ connectionInfo, dbName, tableName, recordSamplingSettings, logger }) => {
	if (recordSamplingSettings.active === 'absolute') {
		return Number(recordSamplingSettings.absolute.value);
	}

	const countResult = await executeCommand(
		connectionInfo,
		`SELECT COUNT(*) FROM \`${dbName}\`.\`${tableName}\``,
		'sql',
	);
	const count = dependencies.lodash.get(countResult, '[0][0]', 0);
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
		const documentsResult = await executeCommand(connectionInfo, sqlQuery, 'sql');

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
		const schemaResult = await executeCommand(connectionInfo, sqlQuery, 'sql');

		logger.log('info', { message: `Execute query: ${sqlQuery}`, dbName, entityName }, 'Getting schema');

		const truncatedColumns = schemaResult
			.map(([name, dataType], i) => (/more fields>*$/.test(dataType) ? [name, i] : null))
			.filter(Boolean);

		if (truncatedColumns.length) {
			await truncatedColumns.reduce(async (prev, [columnName, position]) => {
				await prev;
				const DATA_TYPE_COLUMN = 1;
				const DATA_TYPE_ROW = 1;
				const result = await executeCommand(connectionInfo, `${sqlQuery} \`${columnName}\``, 'sql');
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

const fetchSample = async ({ connectionInfo, dbName, entityName, logger }) => {
	try {
		const sqlQuery = `SELECT * FROM \`${dbName}\`.\`${entityName}\` LIMIT 1`;
		const schemaResult = await executeCommand(connectionInfo, sqlQuery, 'sql');

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

const useCatalog = async connectionInfo => {
	await executeCommand(connectionInfo, `USE CATALOG '${connectionInfo.catalogName}';`, 'sql');
};

const fetchClusterCatalogNames = async connectionInfo => {
	const result = await executeCommand(connectionInfo, 'SHOW CATALOGS', 'sql');
	return dependencies.lodash.flattenDeep(result);
};

const fetchClusterDatabasesNames = async connectionInfo => {
	const result = await executeCommand(connectionInfo, 'SHOW DATABASES', 'sql');
	return dependencies.lodash.flattenDeep(result);
};

const fetchDatabaseViewsNames = (dbName, connectionInfo) =>
	executeCommand(connectionInfo, `SHOW VIEWS IN \`${dbName}\``, 'sql');

const fetchDatabaseViewsNamesViaPython = (dbName, connectionInfo) =>
	executeCommand(connectionInfo, getViewNamesCommand(dbName), 'python');

const fetchClusterTablesNames = (dbName, connectionInfo) =>
	executeCommand(connectionInfo, `SHOW TABLES IN \`${dbName}\``, 'sql');

const fetchClusterData = async (connectionInfo, collectionsNames, databasesNames, logger) => {
	const async = dependencies.async;
	const databasesPropertiesResult = await async.mapLimit(databasesNames, 40, async dbName => {
		logger.log('info', '', `Start describe database: ${dbName} `);
		const dbInfoResult = await executeCommand(connectionInfo, `DESCRIBE DATABASE EXTENDED \`${dbName}\``, 'sql');
		logger.log('info', '', `Database: ${dbName} successfully described`);
		const dbProperties = dbInfoResult.reduce((dbProperties, row) => {
			if (row[0] === 'Location') {
				return { ...dbProperties, 'location': row[1] };
			}
			if (row[0] === 'Comment') {
				return { ...dbProperties, 'description': row[1] };
			}
			if (row[0] === 'Properties') {
				return { ...dbProperties, 'dbProperties': convertDbProperties(row[1]) };
			}
			return dbProperties;
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
				dbTables: dependencies.lodash.get(databasesTablesInfo, dbName, {}),
				dbProperties: dependencies.lodash.get(databasesProperties, dbName, {}),
			},
		}),
		{},
	);
};

/**
 * @param {string} jsonString
 * @return {string[]}
 */
const splitJsonObjects = (jsonString = '') => jsonString.split(JSON_OBJECTS_DELIMITER);

/**
 * @param {string} corruptedJsonData
 * @return {string}
 */
const filterCorruptedEnd = (corruptedJsonData) => {
	const splittedData = splitJsonObjects(corruptedJsonData);
	return splittedData.slice(0, splittedData.length - 1).join(JSON_OBJECTS_DELIMITER);
};

/**
 * @param {string} corruptedJsonData
 * @return {string}
 */
const filterCorruptedStart = (corruptedJsonData) => {
	const splittedData = splitJsonObjects(corruptedJsonData);
	return splittedData.slice(1).join(JSON_OBJECTS_DELIMITER);
};

/**
 * @param {string} databasesTablesInfoResult
 * @param {boolean} isTruncatedInMiddle
 * @return {string}
 */
const filterCorruptedData = (databasesTablesInfoResult, isTruncatedInMiddle) => {
	if (isTruncatedInMiddle) {
		const warningDelimiter = '*** WARNING: max output size exceeded, skipping output. ***';
		const [ firstChunk, lastChunk ] = databasesTablesInfoResult.split(warningDelimiter);
		return [ filterCorruptedEnd(firstChunk), filterCorruptedStart(lastChunk) ].join(', ');
	}

	return filterCorruptedEnd(databasesTablesInfoResult) + '}]}';
};

const fetchFieldMetadata = async (databasesNames, collectionsNames, connectionInfo, logger, previousData = {}) => {
	const { tableNames, dbNames } = prepareNamesForInsertionIntoScalaCode(databasesNames, collectionsNames);
	const getClusterDataCommand = getClusterData(tableNames.join(', '), dbNames.join(', '));
	logger.log(
		'info',
		'',
		`Start retrieving tables info: \nDatabases: ${dbNames.join(', ')} \nTables: ${tableNames.join(', ')}`,
	);
	const databasesTablesInfoResult = await executeCommand(connectionInfo, getClusterDataCommand, 'python');
	logger.log('info', '', `Finish retrieving tables info: ${databasesTablesInfoResult}`);

	const isTruncatedResponse = /\*\*\* WARNING: skipped \d* bytes of output \*\*\*$/.test(databasesTablesInfoResult);
	const isTruncatedInMiddle = /\*\*\* WARNING: max output size exceeded, skipping output. \*\*\*/.test(databasesTablesInfoResult);

	try {
		if (!isTruncatedResponse && !isTruncatedInMiddle) {
			const parsedData = JSON.parse(databasesTablesInfoResult);
			return mergeChunksOfData(previousData, parsedData);
		}

		const fullCompletedData = filterCorruptedData(databasesTablesInfoResult, isTruncatedInMiddle);
		const parsedData = JSON.parse(fullCompletedData);
		const mergedDataChunks = mergeChunksOfData(previousData, parsedData);
		const { dbNames: filteredDbNames, tableNames: filteredTableNames } = getFilteredEntities(collectionsNames, mergedDataChunks);

		return fetchFieldMetadata(filteredDbNames, filteredTableNames, connectionInfo, logger, mergedDataChunks);

	} catch (error) {
		logger.log('error', { error }, `\nDatabricks response: ${databasesTablesInfoResult}\n`);
		throw error;
	}
};

const getFilteredEntities = (tableNames, parsedData) => {
	return Object.keys(parsedData).reduce(
		(resultEntities, dbName) => {
			const parsedTableNames = parsedData[dbName].map(table => table.name);
			const dbTableNames = tableNames[dbName];
			const filteredTableNames = dbTableNames.filter(name => !parsedTableNames.includes(name));
			if (!filteredTableNames.length) {
				return resultEntities;
			}

			return {
				dbNames: [...resultEntities.dbNames, dbName],
				tableNames: {
					...resultEntities.tableNames,
					[dbName]: filteredTableNames,
				},
			};
		},
		{ dbNames: [], tableNames: {} },
	);
};

const mergeChunksOfData = (leftObj, rightObj) => {
	return dependencies.lodash.mergeWith(leftObj, rightObj, (objValue, srcValue) => {
		if (Array.isArray(objValue) && Array.isArray(srcValue)) {
			return objValue.concat(srcValue);
		}
	});
};

const fetchCreateStatementRequest = async (entityName, connectionInfo, logger) => {
	try {
		const result = await executeCommand(connectionInfo, `SHOW CREATE TABLE ${entityName};`, 'sql');
		return dependencies.lodash.get(result, '[0][0]', '');
	} catch (error) {
		logger.log('error', error, `Error during retrieve create table DDL statement. Table name: ${entityName}`);
		return '';
	}
};

const getRequestOptions = connectionInfo => {
	const headers = {
		'Authorization': 'Bearer ' + connectionInfo.accessToken,
	};

	return {
		'method': 'GET',
		'headers': headers,
		'timeout': connectionInfo.queryRequestTimeout,
		'logger': connectionInfo.logger || { log: () => {} },
	};
};

const postRequestOptions = (connectionInfo, body) => {
	const headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + connectionInfo.accessToken,
	};

	return {
		'method': 'POST',
		'timeout': connectionInfo.queryRequestTimeout,
		'logger': connectionInfo.logger || { log: () => {} },
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
		'language': language,
		'clusterId': connectionInfo.clusterId,
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
		'contextId': contextId,
		'clusterId': connectionInfo.clusterId,
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
			body = JSON.parse(body);
		});
};

const runCommand = (connectionInfo, contextId, command, language) => {
	const query = connectionInfo.host + '/api/1.2/commands/execute';
	const commandOptions = JSON.stringify({
		language,
		clusterId: connectionInfo.clusterId,
		contextId,
		command,
	});
	const options = postRequestOptions(connectionInfo, commandOptions);

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

			const query = new URL(connectionInfo.host + '/api/1.2/commands/status');
			const params = {
				clusterId: connectionInfo.clusterId,
				contextId: contextId,
				commandId: body.id,
			};
			query.search = new URLSearchParams(params).toString();
			const options = getRequestOptions(connectionInfo);
			return getCommandExecutionResult(query, options, commandOptions);
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

const executeCommand = (connectionInfo, command, language = 'sql', logger) => {
	return createContext(connectionInfo, language).then(async contextId => {
		if (connectionInfo.sparkConfig && Object.keys(connectionInfo.sparkConfig).length) {
			let sparkConfig;

			if (language === 'sql') {
				sparkConfig = getSqlSparkConfig(connectionInfo.sparkConfig);
			} else if (language === 'python') {
				sparkConfig = getPythonSparkConfig(connectionInfo.sparkConfig);
			}

			if (sparkConfig) {
				await runCommand(connectionInfo, contextId, sparkConfig, language);
			}
		}

		const result = await runCommand(connectionInfo, contextId, command, language);

		return result;
	});
};

const getCommandExecutionResult = (query, options, commandOptions) => {
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
			if (body.status === 'Finished' && body.results !== null) {
				if (body.results.resultType === 'error') {
					throw {
						message: body.results.data || body.results.cause,
						code: '',
						description: commandOptions,
					};
				}
				return body.results.data;
			}

			if (body.status === 'Error') {
				throw {
					message: 'Error during receiving command result',
					code: '',
					description: commandOptions,
				};
			}
			return getCommandExecutionResult(query, options, commandOptions);
		});
};

const convertDbPropertyValue = value => {
	const _ = dependencies.lodash;
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
	const _ = dependencies.lodash;
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
	useCatalog,
	fetchSample,
};
