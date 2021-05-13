'use strict'
const fetch = require('node-fetch');
const { dependencies } = require('../appDependencies');


const fetchApplyToInstance = async (connectionInfo) => {
	const scriptWithoutNewLineSymb = connectionInfo.script.replaceAll(/[\s]+/g, " ");
	const eachEntityScript = scriptWithoutNewLineSymb.split(';').filter(script => script !== '');
	for (let script of eachEntityScript) {
		script = script.trim() + ';'
		const command = `var stmt = sqlContext.sql("${script}")`;
		await executeCommand(connectionInfo, command);
	}
}

const fetchLimitByCount = async (connectionInfo, collectionName) => {
	const command = `var stmt = sqlContext.sql("select count(*) as count from ${collectionName}").select(\"count\").collect()`;
	return await executeCommand(connectionInfo, command);
}

const fetchDocumets = async (connectionInfo, dbName, collectionName, fields, limit) => {
	const columnsToSelect = fields.map(field => field.name).join(', ');
	const command = `import scala.util.parsing.json.JSONObject;
						var rows = sqlContext.sql(\"SELECT ${columnsToSelect} FROM ${dbName}.${collectionName} LIMIT ${limit}\")
							.map(row => JSONObject(row.getValuesMap(row.schema.fieldNames)).toString())
							.collect()`;
	const result = await executeCommand(connectionInfo, command);
	const rowsExtractionRegex = /(rows: Array\[String\] = Array\((.+)\))/gm
	const rowsJSON = _.get(rowsExtractionRegex.exec(result), '2', '')
	const rows = JSON.parse(`[${rowsJSON}]`);
	return rows;
}

const fetchDatabaseProperties = async (connectionInfo, dbName) => {
	const command = `import scala.util.parsing.json.JSONObject;
						var dbProperties = sqlContext.sql(\"DESCRIBE DATABASE EXTENDED ${dbName}\")
							.map(row => JSONObject(row.getValuesMap(row.schema.fieldNames)).toString())
							.collect()`;
	const result = await executeCommand(connectionInfo, command);
	const propertiesExtractionRegex = /(dbProperties: Array\[String\] = Array\((.+)\))/gm
	const propertiesJSON = _.get(propertiesExtractionRegex.exec(result), '2', '')
	const properties = JSON.parse(`[${propertiesJSON}]`);
	const propertiesObject = properties.reduce((propertiesObject, property) => {
		return { ...propertiesObject, [property.database_description_item]: property.database_description_value }
	}, {});
	const location = propertiesObject['Location'];
	const description = propertiesObject['Comment'];

	const dbPropertyItemsExtractionRegex = /\((.+)\)/gmi
	let dbProperties = _.get(dbPropertyItemsExtractionRegex.exec(propertiesObject['Properties']), '1', '').split('), ')
	.map(item => item.replaceAll(/[\(\)]/gmi,'')).map(propertyPair => `'${propertyPair.split(',')[0]}' = '${propertyPair.split(',')[1]}'`).join(', ');
	if(!_.isEmpty(dbProperties)){
		dbProperties = `(${dbProperties})`
	}
	return {location, description, dbProperties};
}

const fetchCreateStatementRequest = async (command, connectionInfo) => {
	const result = await executeCommand(connectionInfo, command);

	const statementExtractionRegex = /stmt: String = "(.+)"/gm;
	const resultWithoutNewLineSymb = result.replaceAll(/[\n\r]/g, " ");
	const entityCreateStatement = statementExtractionRegex.exec(resultWithoutNewLineSymb);

	return dependencies.lodash.get(entityCreateStatement, '1', '')
}

const fetchClusterProperties = async (connectionInfo) => {
	const query = connectionInfo.host + `/api/2.0/clusters/get?cluster_id=${connectionInfo.clusterId}`;
	const options = getRequestOptions(connectionInfo)
	return await fetch(query, options)
		.then(response => {
			if (response.ok) {
				return response.text()
			}
			throw {
				message: response.statusText, code: response.status, description: body
			};
		})
		.then(body => {
			return JSON.parse(body);
		})
}

const fetchClusterDatabaseNames = async (connectionInfo) => {
	const getDatabasesNamesCommand = "var values = sqlContext.sql(\"SHOW DATABASES\").select(\"databaseName\").collect().map(_(0)).toList"
	return await getDFColumnValues(connectionInfo, getDatabasesNamesCommand);
}

const fetchDatabaseTablesNames = async (connectionInfo, dbName) => {
	const getTablesNamesCommand = `var values = sqlContext.sql(\"SHOW TABLES FROM ${dbName}\").select(\"tableName\").collect().map(_(0)).toList`
	return await getDFColumnValues(connectionInfo, getTablesNamesCommand);
}

const fetchFunctionNames = async (connectionInfo) => {
	const getFunctionsNamesCommand = `var values = sqlContext.sql(\"SHOW USER FUNCTIONS\").select(\"function\").collect().map(_(0)).toList`
	return await getDFColumnValues(connectionInfo, getFunctionsNamesCommand);
}

const getFunctionClass = async (connectionInfo, funcName) => {
	const getFunctionsClassCommand = `var clas = sqlContext.sql(\"DESCRIBE FUNCTION ${funcName}\").select(\"function_desc\").collect().map(_(0)).toList(1)`
	const result = await executeCommand(connectionInfo, getFunctionsClassCommand);
	const valuesExtractionRegex = /clas: Any = Class: (.*)/gm;
	return dependencies.lodash.get(valuesExtractionRegex.exec(result), '1', '');
}

const fetchDatabaseViewsNames = async (connectionInfo, dbName) => {
	const getViiewsNamesCommand = `var values = sqlContext.sql(\"SHOW VIEWS FROM ${dbName}\").select(\"viewName\").collect().map(_(0)).toList`
	return await getDFColumnValues(connectionInfo, getViiewsNamesCommand);
}

const getRequestOptions = (connectionInfo) => {
	const headers = {
		'Authorization': 'Bearer ' + connectionInfo.accessToken
	};

	return {
		'method': 'GET',
		'headers': headers
	};
}

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

const createContext = (connectionInfo) => {

	const query = connectionInfo.host + '/api/1.2/contexts/create'
	const body = JSON.stringify({
		"language": "scala",
		"clusterId": connectionInfo.clusterId
	})
	const options = postRequestOptions(connectionInfo, body);

	return fetch(query, options)
		.then(response => {
			if (response.ok) {
				return response.text()
			}
			throw {
				message: response.statusText, code: response.status, description: body
			};
		})
		.then(body => {
			body = JSON.parse(body);
			return body.id;
		})
}

const destroyContext = (connectionInfo, contextId) => {
	const query = '' + '/api/1.2/contexts/destroy'
	const body = JSON.stringify({
		"contextId": contextId,
		"clusterId": connectionInfo.clusterId
	});
	const options = postRequestOptions(connectionInfo, body);
	return fetch(query, options)
		.then(response => response.text())
		.then(body => {
			body = JSON.parse(body);

			if (response.ok) {
				return body;
			}

			throw {
				message: response.statusText, code: response.status, description: body
			};
		});
}

const executeCommand = (connectionInfo, command) => {

	let activeContextId;

	return createContext(connectionInfo)
		.then(contextId => {
			activeContextId = contextId;
			const query = connectionInfo.host + '/api/1.2/commands/execute';
			const body = JSON.stringify({
				language: "scala",
				clusterId: connectionInfo.clusterId,
				contextId,
				command
			});
			const options = postRequestOptions(connectionInfo, body)

			return fetch(query, options)
				.then(response => {
					if (response.ok) {
						return response.text()
					}
					throw {
						message: response.statusText, code: response.status, description: body
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
					return getCommandExecutionResult(query, options);
				})
		}
		)
}

const getCommandExecutionResult = (query, options) => {
	return fetch(query, options)
		.then(response => {
			if (response.ok) {
				return response.text()
			}
			throw {
				message: response.statusText, code: response.status, description: body
			};
		})
		.then(body => {
			body = JSON.parse(body);
			if (body.status === 'Finished' && body.results !== null) {
				if (body.results.resultType === 'error') {
					throw {
						message: body.results.data || body.results.cause, code: "", description: ""
					};
				}
				return body.results.data;
			}

			if (body.status === 'Error') {
				throw {
					message: "Error during receiving command result", code: "", description: ""
				};
			}
			return getCommandExecutionResult(query, options);
		})
}

const getDFColumnValues = async (connectionInfo, command) => {
	const _ = dependencies.lodash;
	const result = await executeCommand(connectionInfo, command);
	const valuesExtractionRegex = /values: List\[Any\] = List\((.+)\)/gm;
	const values = _.get(valuesExtractionRegex.exec(result), '1', '')
	return _.isEmpty(values) ? [] : values.split(", ");
}

module.exports = {
	fetchCreateStatementRequest,
	fetchClusterDatabaseNames,
	fetchDatabaseTablesNames,
	fetchDatabaseViewsNames,
	fetchClusterProperties,
	getFunctionClass,
	fetchFunctionNames,
	fetchApplyToInstance,
	fetchLimitByCount,
	fetchDocumets,
	fetchDatabaseProperties
};