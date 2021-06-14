'use strict';

const logHelper = require('./logHelper');
let connectionData = null;

const fetchRequestHelper = require('./helpers/fetchRequestHelper')
const deltaLakeHelper = require('./helpers/DeltaLakeHelper');
const { setDependencies, dependencies } = require('./appDependencies');
const fs = require('fs');
const antlr4 = require('antlr4');
const HiveLexer = require('./parser/Hive/HiveLexer.js');
const HiveParser = require('./parser/Hive/HiveParser.js');
const hqlToCollectionsVisitor = require('./hqlToCollectionsVisitor.js');
const commandsService = require('./commandsService');
const ExprErrorListener = require('./antlrErrorListener');

module.exports = {

	disconnect: function (connectionInfo, cb) {
		fetchRequestHelper.destroyActiveContext();
		cb();
	},

	testConnection: async (connectionInfo, logger, cb, app) => {
		try {
			setDependencies(app);
			logInfo('Test connection RE', connectionInfo, logger, logger);
			const clusterState = await deltaLakeHelper.requiredClusterState(connectionInfo, logInfo, logger);
			if (!clusterState.isRunning) {
				cb({ message: `Cluster is unavailable. Cluster status: ${clusterState.state}` })
			}
			cb()
		} catch (err) {
			logger.log(
				'error',
				{ message: err.message, stack: err.stack, error: err },
				'Test connection RE'
			);
			cb({ message: err.message, stack: err.stack });
		}
	},

	getDbCollectionsNames: async (connectionInfo, logger, cb, app) => {
		logInfo('Retrieving databases and tables information', connectionInfo, logger);
		try {
			setDependencies(app);
			const clusterState = await deltaLakeHelper.requiredClusterState(connectionInfo, logInfo, logger);
			if (!clusterState.isRunning) {
				cb({ message: `Cluster is unavailable. Cluster state: ${clusterState.state}` })
			}
			connectionData = {
				host: connectionInfo.host,
				clusterId: connectionInfo.clusterId,
				accessToken: connectionInfo.accessToken
			}
			const dbNames = await fetchRequestHelper.fetchClusterDatabaseNames(connectionInfo);
			const dbCollectionsNames = await Promise.all(dbNames.map(dbName => deltaLakeHelper.getDatabaseCollectionNames(connectionInfo, dbName)));

			cb(null, dbCollectionsNames);
		} catch (err) {
			logger.log(
				'error',
				{ message: err.message, stack: err.stack, error: err },
				'Retrieving databases and tables names'
			);
			cb({ message: err.message, stack: err.stack });
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
			const clusterState = await deltaLakeHelper.requiredClusterState(connectionData, logInfo, logger);
			setDependencies(app);
			if (!clusterState.isRunning) {
				cb({ message: `Cluster is unavailable. Cluster state: ${clusterState.state}` })
			}
			const collections = data.collectionData.collections;
			const dataBaseNames = data.collectionData.dataBaseNames;
			const modelData = await deltaLakeHelper.getModelData(connectionData, logger);
			const entitiesPromises = await dataBaseNames.reduce(async (packagesPromise, dbName) => {
				const packages = await packagesPromise;
				const entities = deltaLakeHelper.splitTableAndViewNames(collections[dbName]);
				const containerData = await deltaLakeHelper.getContainerData(connectionData, dbName);
				const tablesPackages = entities.tables.map(async (tableName) => {
					progress({ message: 'Start getting data from table', containerName: dbName, entityName: tableName });
					const ddl = await deltaLakeHelper.getEntityCreateStatement(connectionData, dbName, tableName);
					let tableData = {}
					try {
						const tableColumnsNullableMap = await fetchRequestHelper.fetchColumnsNullableMap(connectionData,tableName,dbName)
						tableData = await deltaLakeHelper.getTableData(connectionData,dbName,tableName,ddl, tableColumnsNullableMap);
					} catch (e){
						logger.log('info', data, `Error parsing ddl statement: \n${ddl}\n`, data.hiddenKeys);
						return {};
					}

					const columnsOfTypeString = tableData.properties.filter(property => property.mode === 'string');
					const hasColumnsOfTypeString = !dependencies.lodash.isEmpty(columnsOfTypeString)
					let documents = [];
					if (hasColumnsOfTypeString) {
						const limitByCount = await deltaLakeHelper.fetchLimitByCount(connectionData, tableName,dbName);
						documents = await fetchRequestHelper.fetchDocumets(connectionData, dbName, tableName, columnsOfTypeString, getLimit(limitByCount, data.recordSamplingSettings));
					}
					progress({ message: 'Data retrieved successfully', containerName: dbName, entityName: tableName });
					return {
						dbName: dbName,
						collectionName: tableName,
						entityLevel: tableData.propertiesPane,
						documents,
						views: [],
						emptyBucket: false,
						validation: {
							jsonSchema: { properties: tableData.schema, required: tableData.requiredColumns }
						},
						bucketInfo: {
							...containerData
						}
					};
				})
				const views = await Promise.all(entities.views.map(async viewName => {
					progress({ message: 'Start getting data from view', containerName: dbName, entityName: viewName });
					const ddl = await deltaLakeHelper.getEntityCreateStatement(connectionData, dbName, viewName);

					let viewData = {};

					try {
						viewData = deltaLakeHelper.getViewDataFromDDl(ddl);
					} catch (e){
						logger.log('info', data, `Error parsing ddl statement: \n${ddl}\n`, data.hiddenKeys);
						return {};
					}

					progress({ message: 'Data retrieved successfully', containerName: dbName, entityName: viewName });

					return {
						name: viewName,
						data: {
							...viewData,
							selectStatement: viewData.selectStatement,
						},
						ddl: {
							script: `CREATE VIEW \`${viewData.code}\` AS ${viewData.selectStatement}`,
							type: 'postgres'
						}
					};
				}));

				if (dependencies.lodash.isEmpty(views.filter(view => !dependencies.lodash.isEmpty(view)))) {
					return [...packages, ...tablesPackages];
				}

				const viewPackage = Promise.resolve({
					dbName: dbName,
					entityLevel: {},
					views,
					emptyBucket: false,
					bucketInfo: {
						...containerData
					}
				});

				return [...packages, ...tablesPackages, viewPackage];
			}, Promise.resolve([]))
			const packages = await Promise.all(entitiesPromises);
			const notEmptyPackages = packages.filter(entity => !dependencies.lodash.isEmpty(entity))
			fetchRequestHelper.destroyActiveContext(); 
			cb(null, notEmptyPackages, modelData);
		} catch (err) {
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
		} catch(err) {
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
			if(err) {
				reject(err);
			} else {
				resolve(content);
			}
		});
	});
};

const getLimit = (count, recordSamplingSettings) => {
	const per = recordSamplingSettings.relative.value;
	const size = (recordSamplingSettings.active === 'absolute')
		? recordSamplingSettings.absolute.value
		: Math.round(count / 100 * per);
	return size;
};

const logInfo = (step, connectionInfo, logger) => {
	logger.clear();
	logger.log('info', logHelper.getSystemInfo(connectionInfo), step);
	logger.log('info', connectionInfo, 'connectionInfo', connectionInfo.hiddenKeys);
};

const handleError = (logger, error, cb) => {
	const message = dependencies.lodash.isString(error) ? error : dependencies.lodash.get(error, 'message', 'Reverse Engineering error')
	logger.log('error', { error }, 'Reverse Engineering error');
	cb(message);
};
