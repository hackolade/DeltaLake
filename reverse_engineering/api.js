'use strict';

const _ = require('lodash');
const async = require('async');
const logHelper = require('./logHelper');
let connectionData = null;

const fetchRequestHelper = require('./helpers/fetchRequestHelper')
const deltaLakeHelper = require('./helpers/DeltaLakeHelper')

module.exports = {

	disconnect: function (connectionInfo, cb) {
		cb();
	},

	testConnection: async (connectionInfo, logger, cb) => {
		try {
			logInfo('Test connection', connectionInfo, logger, logger);
			const clusterState = await deltaLakeHelper.requiredClusterState(connectionInfo, logInfo, logger);
			if (!clusterState.isRunning) {
				cb({ message: `Cluster is unavailable. Cluster status: ${clusterState.state}` })
			}
			cb()
		} catch (err) {
			logger.log(
				'error',
				{ message: err.message, stack: err.stack, error: err },
				'Test connection'
			);
			cb({ message: err.message, stack: err.stack });
		}
	},

	getDbCollectionsNames: async (connectionInfo, logger, cb) => {
		logInfo('Retrieving databases and tables information', connectionInfo, logger);
		try {

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

	getDbCollectionsData: async (data, logger, cb) => {
		logger.log('info', data, 'Retrieving schema', data.hiddenKeys);

		const progress = (message) => {
			logger.log('info', message, 'Retrieving schema', data.hiddenKeys);
			logger.progress(message);
		};

		try {
			const clusterState = await deltaLakeHelper.requiredClusterState(connectionData, logInfo, logger);
			if (!clusterState.isRunning) {
				cb({ message: `Cluster is unavailable. Cluster state: ${clusterState.state}` })
			}
			const collections = data.collectionData.collections;
			const dataBaseNames = data.collectionData.dataBaseNames;
			const modelData = await deltaLakeHelper.getModelData(connectionData);
			const entitiesPromises = await dataBaseNames.reduce(async (packagesPromise, dbName) => {
				const packages = await packagesPromise;
				const entities = deltaLakeHelper.splitTableAndViewNames(collections[dbName]);
				const containerData = await deltaLakeHelper.getContainerData(connectionData, dbName);
				const tablesPackages = entities.tables.map(async (tableName) => {
					progress({ message: 'Start getting data from table', containerName: dbName, entityName: tableName });
					const ddl = await await deltaLakeHelper.getTableCreateStatement(connectionData, dbName, tableName);

					const tableData = deltaLakeHelper.getTableDataFromDDl(ddl);
					progress({ message: 'Data retrieved successfully', containerName: dbName, entityName: tableName });
					return {
						dbName: dbName,
						collectionName: tableName,
						entityLevel: tableData.propertiesPane,
						documents: [],
						views: [],
						emptyBucket: false,
						validation: {
							jsonSchema: { properties: tableData.properties }
						},
						bucketInfo: {
							...containerData
						}
					};
				})

				const views = await Promise.all(entities.views.map(async viewName => {
					progress({ message: 'Start getting data from view', containerName: dbName, entityName: viewName });
					const ddl = await deltaLakeHelper.getTableCreateStatement(connectionData, dbName, viewName);

					const viewData = deltaLakeHelper.getViewDataFromDDl(ddl);
					
					progress({ message: 'Data retrieved successfully', containerName: dbName, entityName: viewName });

					return {
						name: viewName,
						viewData: viewData,
						ddl: {
							script: `CREATE VIEW \`${viewData.code}\` AS ${viewData.selectStatement}`,
							type: 'postgres'
						}
					};
				}));

				if (_.isEmpty(views)) {
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
			cb(null, packages, modelData);
		} catch (err) {
			handleError(logger, err, cb);
		}
	}
};
const logInfo = (step, connectionInfo, logger) => {
	logger.clear();
	logger.log('info', logHelper.getSystemInfo(connectionInfo.appVersion), step);
	logger.log('info', connectionInfo, 'connectionInfo', connectionInfo.hiddenKeys);
};

const handleError = (logger, error, cb) => {
	const message = _.isString(error) ? error : _.get(error, 'message', 'Reverse Engineering error')
	logger.log('error', { error }, 'Reverse Engineering error');
	cb(message);
};
