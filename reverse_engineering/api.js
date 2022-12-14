'use strict';

const logHelper = require('./logHelper');
let connectionData = null;

const fetchRequestHelper = require('./helpers/fetchRequestHelper');
const tableDDlHelper = require('./helpers/tableDDLHelper');
const viewDDLHelper = require('./helpers/viewDDLHelper')
const databricksHelper = require('./helpers/databricksHelper');
const { getErrorMessage, cleanEntityName, isViewDdl, isTableDdl, getTemplateDocByJsonSchema } = require('./helpers/utils')
const { setDependencies, dependencies } = require('./appDependencies');
const fs = require('fs');
const antlr4 = require('antlr4');
const HiveLexer = require('./parser/Hive/HiveLexer.js');
const HiveParser = require('./parser/Hive/HiveParser.js');
const hqlToCollectionsVisitor = require('./hqlToCollectionsVisitor.js');
const commandsService = require('./commandsService');
const ExprErrorListener = require('./antlrErrorListener');
const { getCleanedUrl } = require('../forward_engineering/helpers/generalHelper');
const mapJsonSchema = require('./thriftService/mapJsonSchema');

module.exports = {

	disconnect: function (connectionInfo, cb) {
		fetchRequestHelper.destroyActiveContext();
		cb();
	},

	testConnection: async (connectionInfo, logger, cb, app) => {
		try {
			setDependencies(app);

			connectionData = {
				host: getCleanedUrl(connectionInfo.host),
				clusterId: connectionInfo.clusterId,
				accessToken: connectionInfo.accessToken,
				queryRequestTimeout: connectionInfo.queryRequestTimeout,
				sparkConfig: getSparkConfigurations(connectionInfo),
				logger,
			}

			logInfo('Test connection RE', connectionInfo, logger);
			const clusterState = await databricksHelper.getClusterStateInfo(connectionData, logger);
			logger.log('info', clusterState, 'Cluster state info');
			await databricksHelper.getFirstDatabaseCollectionName(connectionData, clusterState.spark_version, logger);

			if (!clusterState.isRunning) {
				cb({ message: `Cluster is unavailable. Cluster status: ${clusterState.state}`, type: 'simpleError' })
			}
			cb()
		} catch (err) {
			logger.log(
				'error',
				{ message: err.message, stack: err.stack, error: err },
				'Test connection RE'
			);
			cb({ message: getErrorMessage(err), stack: err.stack });
		}
	},

	async getDatabases(connectionInfo, logger, cb, app) {
		logInfo('Retrieving databases information', connectionInfo, logger);

		try {
			setDependencies(app);

			let dbNames = [];

			if (connectionInfo.databaseName) {
				dbNames = [connectionInfo.databaseName];
			} else {
				const connectionData = {
					host: getCleanedUrl(connectionInfo.host),
					clusterId: connectionInfo.clusterId,
					accessToken: connectionInfo.accessToken,
					queryRequestTimeout: connectionInfo.queryRequestTimeout,
					sparkConfig: getSparkConfigurations(connectionInfo),
					logger,
				};
				dbNames = await fetchRequestHelper.fetchClusterDatabasesNames(connectionData);
			}

			logger.log('info', dbNames, 'Database names list');

			cb(null, dbNames);
		} catch (err) {
			logger.log(
				'error',
				{ message: err.message, stack: err.stack, error: err },
				'Retrieving databases and tables names'
			);
			cb({ message: getErrorMessage(err), stack: err.stack });
		}
	},

	getDocumentKinds(connectionInfo, logger, callback) {
		callback(null, []);
	},

	getDbCollectionsNames: async (connectionInfo, logger, cb, app) => {
		logger.log('info', connectionInfo, 'Retrieving tables and views information', connectionInfo.hiddenKeys);
		
		try {
			setDependencies(app);

			connectionData = {
				host: getCleanedUrl(connectionInfo.host),
				clusterId: connectionInfo.clusterId,
				accessToken: connectionInfo.accessToken,
				databaseName: connectionInfo.database,
				queryRequestTimeout: connectionInfo.queryRequestTimeout,
				sparkConfig: getSparkConfigurations(connectionInfo),
				logger,
			};

			const clusterState = await databricksHelper.getClusterStateInfo(connectionData, logger);
			logger.log('info', clusterState, 'Cluster state info');
			const dbCollectionsNames = await databricksHelper.getDatabaseCollectionNames(connectionData, clusterState.spark_version, logger);

			cb(null, dbCollectionsNames);
		} catch (err) {
			try {
				const clusterState = await databricksHelper.getClusterStateInfo(connectionData, logger);
				if (!clusterState.isRunning) {
					logger.log(
						'error',
						{ message: err.message, stack: err.stack, error: err },
						`Cluster is unavailable. Cluster state: ${clusterState.state}`
					);
					cb({ message: `Cluster is unavailable. Cluster state: ${clusterState.state}`, type: 'simpleError' })
					return;
				}
			} catch (err) {
				logger.log(
					'error',
					{ message: err.message, stack: err.stack, error: err },
					`Cluster is unavailable.`
				);
				cb({ message: getErrorMessage(err), stack: err.stack });
				return;
			}

			logger.log(
				'error',
				{ message: err.message, stack: err.stack, error: err },
				'Retrieving databases and tables names'
			);
			cb({ message: getErrorMessage(err), stack: err.stack });
		}
	},

	getDbCollectionsData: async (data, logger, cb, app) => {
		logger.log('info', data, 'Retrieving schema', data.hiddenKeys);

		const progress = (message) => {
			logger.log('info', message, 'Retrieving schema', data.hiddenKeys);
			logger.progress(message);
		};
		let modelData;

		try {
			
			setDependencies(app);
			
			const async = dependencies.async;
			
			modelData = await databricksHelper.getClusterStateInfo(connectionData, logger);
			logger.log('info', modelData, 'Cluster state info');
			
			const collections = data.collectionData.collections;
			const dataBaseNames = data.collectionData.dataBaseNames;
			const fieldInference = data.fieldInference;

			progress({ message: 'Start getting data from entities', containerName: 'databases', entityName: 'entities' });
			const clusterData = await databricksHelper.getClusterData(connectionData, dataBaseNames, collections, logger);

			progress({ message: 'Start getting entities ddl', containerName: 'databases', entityName: 'entities' });
			const entitiesDdl = await databricksHelper.getEntitiesDDL(connectionData, dataBaseNames, collections, modelData.spark_version, logger);
			const ddlByEntity = entitiesDdl.reduce((ddlByEntity, ddlObject) => {
				const entityName = Object.keys(ddlObject)[0]
				return { ...ddlByEntity, [entityName]: ddlObject[entityName] }
			}, {})

			progress({ message: 'Entities ddl retrieved successfully', containerName: 'databases', entityName: 'entities' });

			let warnings = [];

			const entitiesPromises = await dataBaseNames.reduce(async (packagesPromise, dbName) => {
				const dbData = clusterData[dbName];
				const packages = await packagesPromise;
				const tablesPackages = await async.mapLimit(
					dbData.dbTables.filter(table => isTableDdl(ddlByEntity[`${dbName}.${table.name}`])),
					40,
					async (table) => {
						const ddl = ddlByEntity[`${dbName}.${table.name}`]

						progress({ message: 'Start processing data from table', containerName: dbName, entityName: table.name });
						let tableData = await tableDDlHelper.getTableData({ ...table, ddl }, data, logger);

						const columnsOfTypeString = (tableData.properties || []).filter(property => property.mode === 'string');
						const hasColumnsOfTypeString = !dependencies.lodash.isEmpty(columnsOfTypeString)
						let documents = [];
						if (hasColumnsOfTypeString) {
							progress({ message: 'Start getting documents from table', containerName: 'databases', entityName: table.name });
							documents = await fetchRequestHelper.fetchDocuments({
								connectionInfo: connectionData,
								dbName,
								tableName: table.name,
								fields: columnsOfTypeString,
								recordSamplingSettings: data.recordSamplingSettings,
								logger,
							});
							progress({ message: 'Documents retrieved successfully', containerName: 'databases', entityName: table.name });
						}

						progress({ message: 'Table data processed successfully', containerName: dbName, entityName: table.name });
						const doc = {
							dbName,
							collectionName: table.name,
							entityLevel: tableData.propertiesPane,
							documents,
							views: [],
							emptyBucket: false,
							validation: {
								jsonSchema: { properties: tableData.schema, required: tableData.requiredColumns }
							},
							bucketInfo: dbData.dbProperties
						};

						if (fieldInference.active === 'field') {
							doc.documentTemplate = getTemplateDocByJsonSchema({ properties: tableData.schema });
						}
						
						return doc;
					})

				const viewsNames = dataBaseNames.reduce((viewsNames, dbName) => {
					const views = (collections[dbName] || [])
						.map(entityName => cleanEntityName(modelData.spark_version, entityName))
						.filter(entityName => isViewDdl(ddlByEntity[`${dbName}.${entityName}`]));

					return { ...viewsNames, [dbName]: views };
				}, {});

				const hasTables = tablesPackages?.length !== 0;
				const hasViews = viewsNames[dbName]?.length !== 0;
				const isEmptyBucket = !hasTables && !hasViews;
				if (isEmptyBucket) {
					const emptyBucket = {
						dbName: dbName,
						entityLevel: {},
						emptyBucket: isEmptyBucket,
						bucketInfo: dbData.dbProperties,
					}
					return [...packages, emptyBucket];
				} else if (!hasViews) {
					return [...packages, ...tablesPackages];
				}

				const views = await async.mapLimit(
					viewsNames[dbName],
					40,
					async (name) => {
						progress({ message: 'Start processing data from view', containerName: dbName, entityName: name });
						const ddl = ddlByEntity[`${dbName}.${name}`];
						let viewData = {};
						let jsonSchema;
						let documentTemplate;
	
						try {
							let viewSchema = [];
							let viewSample = [];
							
							try {
								viewSchema = await fetchRequestHelper.fetchEntitySchema({ connectionInfo: connectionData, dbName, entityName: name, logger });
								viewSample = await fetchRequestHelper.fetchSample({ connectionInfo: connectionData, dbName, entityName: name, logger });
							} catch (e) {
								if (e.type === 'warning') {
									warnings.push(e);
								} else {
									throw e;
								}
							}
							
							viewData = viewDDLHelper.getViewDataFromDDl(ddl);
							jsonSchema = viewDDLHelper.getJsonSchema(viewSchema, viewSample);

							if (fieldInference.active === 'field') {
								documentTemplate = getTemplateDocByJsonSchema(jsonSchema);
							}
						} catch (e) {
							logger.log('info', data, `Error parsing ddl statement: \n${ddl}\n`, data.hiddenKeys);
							return createViewPackage({ name });
						}
	
						progress({ message: 'View data processed successfully', containerName: dbName, entityName: name });
	
						return createViewPackage({
							name,
							viewData,
							jsonSchema,
							documentTemplate,
						});
					},
				);

				const viewPackage = Promise.resolve({
					dbName: dbName,
					entityLevel: {},
					views,
					emptyBucket: false,
					bucketInfo: dbData.dbProperties,
				});

				return [...packages, ...tablesPackages, viewPackage];
			}, Promise.resolve([]))
			const packages = await Promise.all(entitiesPromises);
			fetchRequestHelper.destroyActiveContext();

			if (warnings.length) {
				modelData = {
					...(modelData || {}),
					warning: createWarning(warnings),
				};
			}

			cb(null, packages, modelData);
		} catch (err) {
			const clusterState = modelData || await databricksHelper.getClusterStateInfo(connectionData, logger);
			if (!clusterState.isRunning) {
				logger.log(
					'error',
					{ message: err.message, stack: err.stack, error: err },
					`Cluster is unavailable. Cluster state: ${clusterState.state}`
				);
				cb({ message: `Cluster is unavailable. Cluster state: ${clusterState.state}`, type: 'simpleError' })
				return;
			}
			handleError(logger, err, cb);
		}
	},
	reFromFile: async (data, logger, callback, app) => {
		try {
			setDependencies(app);
			const input = await handleFileData(data.filePath);
			const { result, info, relationships } = parseDDLStatements(input);
			callback(null, result, info, relationships, 'multipleSchema');
		} catch (err) {
			handleError(logger, err, callback);
		}
	},

	adaptJsonSchema(data, logger, callback, app) {
		try {
			setDependencies(app);
			const _ = app.require('lodash');
			const jsonSchema = JSON.parse(data.jsonSchema);
			const result = mapJsonSchema(_)(jsonSchema, {}, (schema, parentJsonSchema, key) => {
				if (schema.type === 'array' && !schema.subtype) {
					return {
						...schema,
						subtype: getArraySubtypeByChildren(_, schema),
					};
				} else {
					return schema;
				}
			});
		
			callback(null, {
				...data,
				jsonSchema: JSON.stringify(result)
			});
		} catch (error) {
			const err = {
				message: error.message,
				stack: error.stack,
			};
			logger.log('error', err, 'Remove nulls from JSON Schema');
			callback(err);
		}
	},

	parseViewStatement(data, logger, callback, app) {
		try {
			setDependencies(app);
			const statement = data.statement;
			const { result } = parseDDLStatements('CREATE VIEW `db`.`name` AS ' + statement + ';\n');

			callback(null, {
				jsonSchema: {},
				ddl: result?.[0]?.doc?.views?.[0]?.ddl,
			});
		} catch(err) {
			handleError(logger, err, callback);
		}
	}
};

const handleFileData = filePath => {
	return new Promise((resolve, reject) => {

		fs.readFile(filePath, 'utf-8', (err, content) => {
			if (err) {
				reject(err);
			} else {
				resolve(content);
			}
		});
	});
};

const logInfo = (step, connectionInfo, logger) => {
	logger.clear();
	logger.log('info', logHelper.getSystemInfo(connectionInfo), step);
	logger.log('info', connectionInfo, 'connectionInfo', connectionInfo.hiddenKeys);
};

const handleError = (logger, error, cb) => {
	const message = getErrorMessage(error);
	logger.log('error', { error }, 'Reverse Engineering error');
	cb(message);
};

const createViewPackage = ({ name, viewData = {}, jsonSchema, documentTemplate }) => {
	const selectStatement = viewData.selectStatement || '';
	const viewName = viewData.code || name;

	return {
		name,
		documentTemplate,
		jsonSchema,
		data: {
			...viewData,
			selectStatement,
		},
		ddl: {
			script: `CREATE VIEW ${viewName} AS ${selectStatement};`.replace(/`/g, '"'),
			type: 'postgres'
		},
		mergeSchemas: true,
	};
};

const getArraySubtypeByChildren = (_, arraySchema) => {
	const subtype = (type) => `array<${type}>`;

	if (!arraySchema.items) {
		return;
	}

	if (Array.isArray(arraySchema.items) && _.uniq(arraySchema.items.map(item => item.type)).length > 1) {
		return subtype("union");
	}

	let item = Array.isArray(arraySchema.items) ? arraySchema.items[0] : arraySchema.items;

	if (!item) {
		return;
	}

	switch(item.type) {
		case 'string':
		case 'text':
			return subtype("txt");
		case 'number':
		case 'numeric':
			return subtype("num");
		case 'interval':
			return subtype("intrvl");
		case 'object':
		case 'struct':
			return subtype("struct");
		case 'array':
			return subtype("array");
		case 'map':
			return subtype("map");
		case "union":
			return subtype("union");
		case "timestamp":
			return subtype("ts");
		case "date":
			return subtype("date");
	}

	if (item.items) {
		return subtype("array");
	}

	if (item.properties) {
		return subtype("struct");
	}
};

const parseDDLStatements = (input) => {
	const chars = new antlr4.InputStream(input);
	const lexer = new HiveLexer.HiveLexer(chars);

	const tokens = new antlr4.CommonTokenStream(lexer);
	const parser = new HiveParser.HiveParser(tokens);
	parser.removeErrorListeners();
	parser.addErrorListener(new ExprErrorListener());

	const tree = parser.statements();

	const hqlToCollectionsGenerator = new hqlToCollectionsVisitor(input);

	const commands = tree.accept(hqlToCollectionsGenerator);
	return commandsService.convertCommandsToReDocs(
		dependencies.lodash.flatten(commands).filter(Boolean),
		input
	);
};

const createWarning = (warnings) => {
	const viewsWarnings = warnings.filter(warning => warning.code === 'VIEW_SCHEMA_ERROR');
	const viewNames = viewsWarnings.slice(0, 3).map(warning => `\`${warning.dbName}\`.\`${warning.entityName}\``).join('\n') + (warnings.length > 3 ? '\n...' : '');

	const viewWarningMessage = `The schema of the following view(s) cannot be retrieved:\n${viewNames}\n because there's an inconsistency with their underlying tables.\n You must refresh the view(s) in the database, then try this process again.\n See the log file for more details.`;

	return {
		title: 'Reverse-Engineering',
		message: viewWarningMessage,
		openLog: true,
		size: 'middle'
	};
};

const getSparkConfigurations = (connectionInfo) => {
	const { azureStorageAccountName, azureStorageAccountKey } = connectionInfo;
	const config = {};

	if (connectionInfo.provider === 'Azure Databricks') {
		if (azureStorageAccountName && azureStorageAccountKey) {
			config[`fs.azure.account.key.${azureStorageAccountName}.dfs.core.windows.net`] = azureStorageAccountKey;
		}
	}

	return config;
};
