'use strict'
const fetch = require('node-fetch');
const { dependencies } = require('../appDependencies');
let activeContext;

const destroyActiveContext = () => {
	destroyContext(activeContext.connectionInfo, activeContext.id)
	activeContext = undefined;
}


const fetchApplyToInstance = async (connectionInfo, logger) => {
	const scriptWithoutNewLineSymb = connectionInfo.script.replaceAll(/[\s]+/g, " ");
	const eachEntityScript = scriptWithoutNewLineSymb.split(';').filter(script => script !== '');
	const progress = (message) => {
		logger.log('info', message, 'Applying to instande');
		logger.progress(message);
	};
	for (let script of eachEntityScript) {
		progress({ message: `Applying script: \n ${script}` });
		const command = `var stmt = sqlContext.sql("${script}")`;
		await Promise.race([executeCommand(connectionInfo, command), new Promise((_r, rej) => setTimeout(() => { throw new Error("Timeout exceeded for script\n" + script); }, connectionInfo.applyToInstanceQueryRequestTimeout || 120000))])
	}
}

const fetchBloomFilteredIndexes = async (connectionInfo, dbName, collectionName) => {
	try {
		const command = `class Column(var col_name: String, var metadata: org.apache.spark.sql.types.Metadata) {
			override def toString() : String = {
			  return col_name +" : " + metadata+"|";
		  }
	  };
	  spark.table("${dbName}.${collectionName}").schema.map(field => (new Column(field.name, field.metadata)).toString())`;
		const result = await executeCommand(connectionInfo, command);
		const mapExtractionRegex = /List\((.+)\)/gm
		const nullableMapString = dependencies.lodash.get(mapExtractionRegex.exec(result), '1', '')
		const columnsIndexOptions = nullableMapString.replaceAll(' ', '').replaceAll('|,', '$').replaceAll('|', '').replaceAll(':{', '%{').split('$').reduce((map, columnNulable) => {
			const columnName = columnNulable.split('%')[0];
			const metadataString = columnNulable.split('%')[1];
			if (metadataString === '{}') {
				return map;
			}
			const metadataMap = JSON.parse(metadataString);
			const columnIndexOptions = Object.keys(metadataMap).map(metaKey => `${metaKey.slice(18)} = ${metadataMap[metaKey]}`).join(', ');
			return { ...map, [columnName]: columnIndexOptions }
		}, {})
		const columnsByIndexOptions = Object.keys(columnsIndexOptions).reduce((indexes, column) => {
			const options = columnsIndexOptions[column]
			if (indexes[options]) {
				return { ...indexes, [options]: [...indexes[options], column] }
			}
			return { ...indexes, [options]: [column] }
		}, {})
		const indexes = Object.keys(columnsByIndexOptions).map(options => ({
			forColumns: columnsByIndexOptions[options],
			options
		}))
		return indexes;
	} catch (e) {
		return [];
	}
}

const fetchDocumets = async (connectionInfo, dbName, collectionName, fields, limit) => {
	try {
		const columnsToSelect = fields.map(field => field.name).join(', ');
		const command = `import scala.util.parsing.json.JSONObject;
							var rows = sqlContext.sql(\"SELECT ${columnsToSelect} FROM ${dbName}.${collectionName} LIMIT ${limit}\")
								.map(row => JSONObject(row.getValuesMap(row.schema.fieldNames)).toString())
								.collect()`;
		const result = await executeCommand(connectionInfo, command);
		const rowsExtractionRegex = /(rows: Array\[String\] = Array\((.+)\))/gm
		const rowsJSON = dependencies.lodash.get(rowsExtractionRegex.exec(result), '2', '')
		const rows = JSON.parse(`[${rowsJSON}]`);
		return rows;
	} catch (e) {
		return [];
	}

}

const fetchColumnsNullableMap = async (connectionInfo, collectionName, dbName) => {
	try {
		const command = `class Column(var col_name: String, var nullable: Boolean) { override def toString() : String = { return col_name + ":" + nullable;  };  };
	  		val res = spark.table(\"${dbName}.${collectionName}\").schema.fields.map(field => (new Column(field.name, field.nullable)).toString());`;
		const result = await executeCommand(connectionInfo, command);
		const mapExtractionRegex = /Array\((.+)\)/gm
		const nullableMapString = dependencies.lodash.get(mapExtractionRegex.exec(result), '1', '')
		const nullableMap = nullableMapString.replaceAll(' ', '').split(',').reduce((map, columnNulable) => {
			const splitColumnNullable = columnNulable.split(':')
			const columnName = splitColumnNullable[0];
			const isNullable = splitColumnNullable[1] === 'true';
			return { ...map, [columnName]: isNullable }
		}, {})
		return nullableMap
	} catch (e) {
		return {};
	}
}

const fetchTableCheckConstraints = async (connectionInfo, dbName, tableName) => {
	const command = `var values = sqlContext.sql(\"DESCRIBE DETAIL ${dbName}.${tableName}\").select(\"properties\").map(row => JSONObject(row.getValuesMap(row.schema.fieldNames)).toString())
	.collect()`
	const result = await executeCommand(connectionInfo, command);
	const valuesExtractionRegex = /values: Array\[String\] = Array\(\{"properties" : Map\((.*)\)\}\)/gm;
	const checkConstraintsValue = dependencies.lodash.get(valuesExtractionRegex.exec(result), '1', '')
	return checkConstraintsValue.split(',').map(constraintStatement => constraintStatement.split(' -> ')[1]).join(' and ')
}

const fetchDatabaseProperties = async (connectionInfo, dbName) => {
	const command = `import scala.util.parsing.json.JSONObject;
						var dbProperties = sqlContext.sql(\"DESCRIBE DATABASE EXTENDED ${dbName}\")
							.map(row => JSONObject(row.getValuesMap(row.schema.fieldNames)).toString())
							.collect()`;
	const result = await executeCommand(connectionInfo, command);
	const propertiesExtractionRegex = /(dbProperties: Array\[String\] = Array\((.+)\))/gm
	const propertiesJSON = dependencies.lodash.get(propertiesExtractionRegex.exec(result), '2', '')
	let properties;
	try {
		properties = JSON.parse(`[${propertiesJSON}]`);
	} catch (e) {
		properties = [];
	}
	const propertiesObject = properties.reduce((propertiesObject, property) => {
		return { ...propertiesObject, [property.database_description_item]: property.database_description_value }
	}, {});
	const location = propertiesObject['Location'];
	const description = propertiesObject['Comment'];

	const dbPropertyItemsExtractionRegex = /\((.+)\)/gmi
	if (propertiesObject['Properties'] !== '') {
		let dbProperties = dependencies.lodash.get(dbPropertyItemsExtractionRegex.exec(propertiesObject['Properties']), '1', '').split('), ')
			.map(item => item.replaceAll(/[\(\)]/gmi, '')).map(propertyPair => `'${propertyPair.split(',')[0]}' = '${propertyPair.split(',')[1]}'`).join(', ');
		if (!dependencies.lodash.isEmpty(dbProperties)) {
			dbProperties = `(${dbProperties})`
		}
		return { location, description, dbProperties };
	}
	return { location, description, dbProperties: '' };
}

const fetchLimitByCount = async (connectionInfo, collectionName, dbName) => {
	const command = `var stmt = sqlContext.sql("select count(*) as count from ${dbName || "default"}.${collectionName}").select(\"count\").collect()`;
	return await executeCommand(connectionInfo, command);
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
			try{
				return JSON.parse(body);
			} catch (e) {
				throw {
					message: e.message, code: "", description: 'body: '+body
				};
			}
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
	if (activeContext) {
		return Promise.resolve(activeContext.id);
	}
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
			activeContext = {
				id: body.id,
				connectionInfo
			}
			return activeContext.id;
		})
}

const destroyContext = (connectionInfo, contextId) => {
	const query = connectionInfo.host + '/api/1.2/contexts/destroy'
	const body = JSON.stringify({
		"contextId": contextId,
		"clusterId": connectionInfo.clusterId
	});
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
	const values = dependencies.lodash.get(valuesExtractionRegex.exec(result), '1', '')
	return dependencies.lodash.isEmpty(values) ? [] : values.split(", ");
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
	fetchDatabaseProperties,
	destroyActiveContext,
	fetchBloomFilteredIndexes,
	fetchTableCheckConstraints,
	fetchColumnsNullableMap
};