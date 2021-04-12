'use strict'
const fetch = require('node-fetch');
const _ = require('lodash')


const fetchCreateStatementRequest = (query, connectionInfo) => {
	let options = this.getRequestOptions(connectionInfo);
	let response;
	return fetch(query, options)
		.then(response => {
			return response.text();
		})
		.then(body => {
			body = JSON.parse(body);

			if (!response.ok) {
				throw {
					message: response.statusText, code: response.status, description: body
				};
			}
			return body;
		}).catch(err => {
			debugger
		});
}

const fetchClusterDatabaseNames = async (connectionInfo) => {
	const getDatabasesNamesCommand = "var values = sqlContext.sql(\"SHOW DATABASES\").select(\"databaseName\").collect().map(_(0)).toList"
	return await getDFColumnValues(connectionInfo, getDatabasesNamesCommand);
}

const fetchDatabaseTablesNames = async (connectionInfo, dbName) => {
	const getDatabasesNamesCommand = `var values = sqlContext.sql(\"SHOW TABLES FROM ${dbName}\").select(\"tableName\").collect().map(_(0)).toList`
	return await getDFColumnValues(connectionInfo, getDatabasesNamesCommand);
}

const fetchDatabaseViewsNames = async (connectionInfo, dbName) => {
	const getDatabasesNamesCommand = `var values = sqlContext.sql(\"SHOW VIEWS FROM ${dbName}\").select(\"viewName\").collect().map(_(0)).toList`
	return await getDFColumnValues(connectionInfo, getDatabasesNamesCommand);
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

const executeCommand = (connectionInfo, command, cb) => {

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
	const result = await executeCommand(connectionInfo, command);
	const valuesExtractionRegex = /values: List\[Any\] = List\((.+)\)/gm;
	const values = _.get(valuesExtractionRegex.exec(result), '1', '')
	return _.isEmpty(values) ? [] : values.split(", ");
}

module.exports = {
	fetchCreateStatementRequest,
	fetchClusterDatabaseNames,
	fetchDatabaseTablesNames,
	fetchDatabaseViewsNames
};