'use strict';

const logHelper = require('./logHelper');
let connectionData = null;

const fetchRequestHelper = require('./helpers/fetchRequestHelper');
const tableDDlHelper = require('./helpers/tableDDLHelper');
const viewDDLHelper = require('./helpers/viewDDLHelper')
const databricksHelper = require('./helpers/databricksHelper');
const {splitTableAndViewNames, getErrorMessage} = require('./helpers/utils')
const { setDependencies, dependencies } = require('./appDependencies');
const fs = require('fs');
const antlr4 = require('antlr4');
const HiveLexer = require('./parser/Hive/HiveLexer.js');
const HiveParser = require('./parser/Hive/HiveParser.js');
const hqlToCollectionsVisitor = require('./hqlToCollectionsVisitor.js');
const commandsService = require('./commandsService');
const ExprErrorListener = require('./antlrErrorListener');
const { getCleanedUrl } = require('../forward_engineering/helpers/generalHelper')

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
				accessToken: connectionInfo.accessToken
			}

			logInfo('Test connection RE', connectionInfo, logger, logger);
			const clusterState = await databricksHelper.requiredClusterState(connectionData, logInfo, logger);
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

	getDbCollectionsNames: async (connectionInfo, logger, cb, app) => {
		logInfo('Retrieving databases and tables information', connectionInfo, logger);
		try {
			setDependencies(app);

			connectionData = {
				host: getCleanedUrl(connectionInfo.host),
				clusterId: connectionInfo.clusterId,
				accessToken: connectionInfo.accessToken
			}

			const dbCollectionsNames = await databricksHelper.getDatabaseCollectionNames(connectionData)

			cb(null, dbCollectionsNames);
		} catch (err) {
			try{
				const clusterState = await databricksHelper.requiredClusterState(connectionData, logInfo, logger);
				if (!clusterState.isRunning) {
					logger.log(
						'error',
						{ message: err.message, stack: err.stack, error: err },
						`Cluster is unavailable. Cluster state: ${clusterState.state}`
					);
					cb({ message: `Cluster is unavailable. Cluster state: ${clusterState.state}`, type: 'simpleError' })
					return;
				}
			}catch(err){
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

		try {
			setDependencies(app);

			const modelData = await databricksHelper.getModelData(connectionData, logger);

			const collections = data.collectionData.collections;
			const dataBaseNames = data.collectionData.dataBaseNames;

			progress({ message: 'Start getting data from entities', containerName: 'databases', entityName: 'entities' });
			const clusterData = await databricksHelper.getClusterData(connectionData, dataBaseNames, collections, logger);

			progress({ message: 'Start getting entities ddl', containerName: 'databases', entityName: 'entities' });
			const entitiesDdl = await Promise.all(databricksHelper.getEntitiesDDL(connectionData, dataBaseNames, collections, logger));
			const ddlByEntity = entitiesDdl.reduce((ddlByEntity, ddlObject) => {
				const entityName = Object.keys(ddlObject)[0]
				return { ...ddlByEntity, [entityName]: ddlObject[entityName] }
			}, {})

			progress({ message: 'Entities ddl retrieved successfully', containerName: 'databases', entityName: 'entities' });
			const entitiesPromises = await dataBaseNames.reduce(async (packagesPromise, dbName) => {
				const dbData = clusterData[dbName];
				const packages = await packagesPromise;
				const tablesPackages = dbData.dbTables.map(async (table) => {
					const ddl = ddlByEntity[`${dbName}.${table.name}`]

					progress({ message: 'Start processing data from table', containerName: dbName, entityName: table.name });
					let tableData  = await tableDDlHelper.getTableData({ ...table, ddl },data, logger);

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
							recordSamplingSettings: data.recordSamplingSettings
						});
						progress({ message: 'Documents retrieved successfully', containerName: 'databases', entityName: table.name });
					}
					
					progress({ message: 'Table data processed successfully', containerName: dbName, entityName: table.name });
					return {
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
				})

				const viewsNames = dataBaseNames.reduce((viewsNames, dbName) => {
					const { views } = splitTableAndViewNames(collections[dbName]);	
					return {...viewsNames, [dbName]: views}
				}, {});

				if (dependencies.lodash.isEmpty(viewsNames[dbName])) {
					return [...packages, ...tablesPackages];
				}

				const views = viewsNames[dbName].map((name) => {
					progress({ message: 'Start processing data from view', containerName: dbName, entityName: name });
					const ddl = ddlByEntity[`${dbName}.${name}`];
					let viewData = {};

					try {
						viewData = viewDDLHelper.getViewDataFromDDl(ddl);
					} catch (e) {
						logger.log('info', data, `Error parsing ddl statement: \n${ddl}\n`, data.hiddenKeys);
						return {};
					}

					progress({ message: 'View data processed successfully', containerName: dbName, entityName: name });

					return {
						name,
						data: {
							...viewData,
							selectStatement: viewData.selectStatement,
						},
						ddl: {
							script: `CREATE VIEW ${viewData.code} AS ${viewData.selectStatement};`,
							type: 'postgres'
						}
					};
				});

				const viewPackage = Promise.resolve({
					dbName: dbName,
					entityLevel: {},
					views,
					emptyBucket: false,
					bucketInfo: {
						description: dbData.dbProperties.Comment,
						dbProperties: dbData.dbProperties.Properties,
						location: dbData.dbProperties.Location
					}
				});

				return [...packages, ...tablesPackages, viewPackage];
			}, Promise.resolve([]))
			const packages = await Promise.all(entitiesPromises);
			fetchRequestHelper.destroyActiveContext();
			cb(null, packages, modelData);
		} catch (err) {
			const clusterState = await databricksHelper.requiredClusterState(connectionData, logInfo, logger);
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
			const chars = new antlr4.InputStream(input);
			const lexer = new HiveLexer.HiveLexer(chars);

			const tokens = new antlr4.CommonTokenStream(lexer);
			const parser = new HiveParser.HiveParser(tokens);
			parser.removeErrorListeners();
			parser.addErrorListener(new ExprErrorListener());

			const tree = parser.statements();

			const hqlToCollectionsGenerator = new hqlToCollectionsVisitor();

			const commands = tree.accept(hqlToCollectionsGenerator);
			const { result, info, relationships } = commandsService.convertCommandsToReDocs(
				dependencies.lodash.flatten(commands).filter(Boolean),
				input
			);
			callback(null, result, info, relationships, 'multipleSchema');
		} catch (err) {
			const { error, title, name } = err;
			const handledError = handleErrorObject(error || err, title || name);
			logger.log('error', handledError, title);
			callback(handledError);
		}
	},
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
