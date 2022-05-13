'use strict'
const fetch = require('node-fetch');
const { dependencies } = require('../appDependencies');
const { getClusterData, getViewNamesCommand } = require('./pythonScriptGeneratorHelper');
const { getCount, prepareNamesForInsertionIntoScalaCode, removeParentheses } = require('./utils');
let activeContexts = {};

const destroyActiveContext = () => {
	if (activeContexts.scala) {
		destroyContext(activeContexts.scala.connectionInfo, activeContexts.scala.id);
	}
	if (activeContexts.sql) {
		destroyContext(activeContexts.sql.connectionInfo, activeContexts.sql.id);
	}

	activeContexts = {};
};

const fetchApplyToInstance = async (connectionInfo, logger) => {
	const progress = (message) => {
		logger.log('info', message, 'Applying to instance');
		logger.progress(message);
	};

	progress({ message: `Applying script: \n ${connectionInfo.script}` });

	await Promise.race([executeCommand(connectionInfo, connectionInfo.script, 'sql'), new Promise((_r, rej) => setTimeout(() => { throw new Error("Timeout exceeded for script\n" + script); }, connectionInfo.applyToInstanceQueryRequestTimeout || 120000))])
};

const fetchDocuments = async ({ connectionInfo, dbName, tableName, fields, recordSamplingSettings }) => {
	try {
		const countResult = await executeCommand(connectionInfo, `SELECT COUNT(*) FROM \`${dbName}\`.\`${tableName}\``, 'sql');
		const count = dependencies.lodash.get(countResult, '[0][0]', 0);

		if (count === 0) {
			return [];
		}

		const columnsToSelect = fields.map(field => field.name);
		const columnsToSelectString = columnsToSelect.map(fieldName => `\`${fieldName}\``).join(', ');
		const limit = getCount(count, recordSamplingSettings);

		const documentsResult = await executeCommand(connectionInfo, `SELECT ${columnsToSelectString} FROM \`${dbName}\`.\`${tableName}\` LIMIT ${limit}`, 'sql');
		return documentsResult.map(result =>
			columnsToSelect.reduce((document, colName, index) => (
				{
					...document,
					[colName]: result[index]
				}
			), {})
		);
	} catch (e) {
		return [];
	}
};

const fetchClusterProperties = async (connectionInfo) => {
	const query = connectionInfo.host + `/api/2.0/clusters/get?cluster_id=${connectionInfo.clusterId}`;
	const options = getRequestOptions(connectionInfo)
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

const fetchClusterDatabasesNames = async (connectionInfo) => {
	const result = await executeCommand(connectionInfo, "SHOW DATABASES", 'sql');
	return dependencies.lodash.flattenDeep(result);
};

const fetchDatabaseViewsNames = (dbName, connectionInfo) => executeCommand(connectionInfo, `SHOW VIEWS IN \`${dbName}\``, 'sql');

const fetchDatabaseViewsNamesViaPython = (dbName, connectionInfo) => executeCommand(connectionInfo, getViewNamesCommand(dbName), 'python');

const fetchClusterTablesNames = (dbName, connectionInfo) => executeCommand(connectionInfo, `SHOW TABLES IN \`${dbName}\``, 'sql');

const fetchClusterData = async (connectionInfo, collectionsNames, databasesNames, logger) => {
	const databasesPropertiesResult = await Promise.all(databasesNames.map(async dbName => {
		logger.log('info', '', `Start describe database: ${dbName} `);
		const dbInfoResult = await executeCommand(connectionInfo, `DESCRIBE DATABASE EXTENDED \`${dbName}\``, 'sql');
		logger.log('info', '', `Database: ${dbName} successfully described`);
		const dbProperties = dbInfoResult.reduce((dbProperties, row) => {
			if (row[0] === 'Location') {
				return { ...dbProperties, "location": row[1] }
			}
			if (row[0] === 'Comment') {
				return { ...dbProperties, "description": row[1] }
			}
			if (row[0] === 'Properties') {

				return { ...dbProperties, "dbProperties": convertDbProperties(row[1]) }
			}
			return dbProperties;
		}, {});
		return { dbName, dbProperties }
	}));

	const databasesProperties = databasesPropertiesResult.reduce((properties, { dbName, dbProperties }) => ({ ...properties, [dbName]: dbProperties }), {})
	
	const databasesTablesInfo = await fetchFieldMetadata(databasesNames, collectionsNames, connectionInfo, logger);
	return databasesNames.reduce((clusterData, dbName) => ({
		...clusterData,
		[dbName]: {
			dbTables: dependencies.lodash.get(databasesTablesInfo, dbName, {}),
			dbProperties: dependencies.lodash.get(databasesProperties, dbName, {})
		}
	}), {});
};

const fetchFieldMetadata = async (databasesNames, collectionsNames, connectionInfo, logger, previousData = {}) => {
	const { tableNames, dbNames } = prepareNamesForInsertionIntoScalaCode(databasesNames, collectionsNames);
	const getClusterDataCommand = getClusterData(tableNames.join(', '), dbNames.join(', '));
	logger.log('info', '', `Start retrieving tables info: \nDatabases: ${dbNames.join(', ')} \nTables: ${tableNames.join(', ')}`);
	const databasesTablesInfoResult = await executeCommand(connectionInfo, getClusterDataCommand, 'python');
	logger.log('info', '', `Finish retrieving tables info: ${databasesTablesInfoResult}`);

	const isTruncatedResponse = /\*\*\* WARNING: skipped \d* bytes of output \*\*\*$/.test(databasesTablesInfoResult);

	try {
		if (!isTruncatedResponse) {
			const parsedData = JSON.parse(databasesTablesInfoResult);
			return mergeChunksOfData(previousData, parsedData);
		}
	
		const delimiter = '}, {';
		const splittedData = databasesTablesInfoResult.split(delimiter);
		const fullCompletedData = splittedData.slice(0, splittedData.length - 1).join(delimiter);
	
		const parsedData = JSON.parse(fullCompletedData + '}]}');
		const mergedDataChunks = mergeChunksOfData(previousData, parsedData);
		const { dbNames: filteredDbNames, tableNames: filteredTableNames } = getFilteredEntities(collectionsNames, mergedDataChunks);
		
		return fetchFieldMetadata(filteredDbNames, filteredTableNames, connectionInfo, logger, mergedDataChunks);
		
	} catch (error) {
		logger.log('error', { error }, `\nDatabricks response: ${databasesTablesInfoResult}\n`);
		throw error;
	}
};

const getFilteredEntities = (tableNames, parsedData) => {
    return Object.keys(parsedData).reduce((resultEntities, dbName) => {
        const parsedTableNames = parsedData[dbName].map(table => table.name);
        const dbTableNames = tableNames[dbName]
        const filteredTableNames = dbTableNames.filter(name => !parsedTableNames.includes(name));
        if (!filteredTableNames.length) {
            return resultEntities;
        }

        return {
            dbNames: [
                ...resultEntities.dbNames,
                dbName,
            ],
            tableNames: {
                ...resultEntities.tableNames,
				[dbName]: filteredTableNames,
			}
        };
    }, { dbNames: [], tableNames: {} });
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

const getRequestOptions = (connectionInfo) => {
	const headers = {
		'Authorization': 'Bearer ' + connectionInfo.accessToken
	};

	return {
		'method': 'GET',
		'headers': headers
	};
};

const postRequestOptions = (connectionInfo, body) => {
	const headers = {
		'Content-Type': 'application/json',
		'Authorization': 'Bearer ' + connectionInfo.accessToken
	};

	return {
		'method': 'POST',
		headers,
		body
	}
};

const createContext = (connectionInfo, language) => {
	if (activeContexts[language]) {
		return Promise.resolve(activeContexts[language].id);
	}
	const query = connectionInfo.host + '/api/1.2/contexts/create';
	const body = JSON.stringify({
		"language": language,
		"clusterId": connectionInfo.clusterId
	})
	const options = postRequestOptions(connectionInfo, body);

	return fetch(query, options)
		.then(async response => {
			if (response.ok) {
				return response.text()
			}
			const description = await response.json();
			throw {
				message: `${response.statusText}\n${JSON.stringify(description)}`, code: response.status, description
			};
		})
		.then(body => {
			body = JSON.parse(body);
			activeContexts[language] = {
				id: body.id,
				connectionInfo
			}
			return activeContexts[language].id;
		})
};

const destroyContext = (connectionInfo, contextId) => {
	const query = connectionInfo.host + '/api/1.2/contexts/destroy'
	const body = JSON.stringify({
		"contextId": contextId,
		"clusterId": connectionInfo.clusterId
	});
	const options = postRequestOptions(connectionInfo, body);
	return fetch(query, options)
		.then(async response => {
			const responseBody = await response.text();
			if (response.ok) {
				return responseBody;
			}
			throw {
				message: response.statusText, code: response.status, description: body, responseBody
			};
		})
		.then(body => {
			body = JSON.parse(body);
		});
};

const executeCommand = (connectionInfo, command, language = 'sql') => {

	let activeContextId;

	return createContext(connectionInfo, language)
		.then(contextId => {
			activeContextId = contextId;
			const query = connectionInfo.host + '/api/1.2/commands/execute';
			const commandOptions = JSON.stringify({
				language,
				clusterId: connectionInfo.clusterId,
				contextId,
				command
			});
			const options = postRequestOptions(connectionInfo, commandOptions)

			return fetch(query, options)
				.then(async response => {
					const responseBody = await response.text();
					if (response.ok) {
						return responseBody;
					}
					throw {
						message: response.statusText, code: response.status, description: commandOptions, responseBody
					};
				})
				.then(body => {

					body = JSON.parse(body);

					const query = new URL(connectionInfo.host + '/api/1.2/commands/status');
					const params = {
						clusterId: connectionInfo.clusterId,
						contextId: activeContextId,
						commandId: body.id
					}
					query.search = new URLSearchParams(params).toString();
					const options = getRequestOptions(connectionInfo);
					return getCommandExecutionResult(query, options, commandOptions);
				})
		}
		)
};

const getCommandExecutionResult = (query, options, commandOptions) => {
	return fetch(query, options)
		.then(async response => {
			const responseBody = await response.text();
			if (response.ok) {
				return responseBody;
			}
			throw {
				message: response.statusText, code: response.status, description: commandOptions, responseBody,
			};
		})
		.then(body => {
			body = JSON.parse(body);
			if (body.status === 'Finished' && body.results !== null) {
				if (body.results.resultType === 'error') {
					throw {
						message: body.results.data || body.results.cause, code: "", description: commandOptions
					};
				}
				return body.results.data;
			}

			if (body.status === 'Error') {
				throw {
					message: "Error during receiving command result", code: "", description: commandOptions
				};
			}
			return getCommandExecutionResult(query, options, commandOptions);
		})
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
	}

	if (isNumber(value)) {
		return _.toNumber(value);
	} else if (isBoolean(value)) {
		return convertToBoolean(value);
	} else {
		return `'${value}'`;
	}
};

const splitStatementsByBrackets = (statements) => {
	const _ = dependencies.lodash;
	let result = [];
	let startIndex = 0;
	let skippedBrackets = 0;
	_.range(statements.length).forEach(index => {
		const symbol = statements.charAt(index);
		if (symbol === '(' && startIndex) {
			skippedBrackets++
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
		.join(',\n')
};

module.exports = {
	fetchClusterProperties,
	fetchApplyToInstance,
	fetchDocuments,
	destroyActiveContext,
	fetchClusterData,
	fetchCreateStatementRequest,
	fetchClusterDatabasesNames,
	fetchDatabaseViewsNames,
	fetchClusterTablesNames,
	fetchDatabaseViewsNamesViaPython,
};