'use strict';

const _ = require('lodash');
const uuid = require('uuid');
const async = require('async');
const fs = require('fs');
const entityLevelHelper = require('./entityLevelHelper');
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
			if(!clusterState.isRunning){
			 cb({ message: `Cluster is unavailable. Cluster status: ${clusterState.state}`})
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
			if(!clusterState.isRunning){
				cb({ message: `Cluster is unavailable. Cluster state: ${clusterProperties.state}`})
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

		const clusterState = await deltaLakeHelper.requiredClusterState(connectionInfo, logInfo, logger);
		if(!clusterState.isRunning){
			cb({ message: `Cluster is unavailable. Cluster state: ${clusterProperties.state}`})
		}

		const progress = (message) => {
			logger.log('info', message, 'Retrieving schema', data.hiddenKeys);
			logger.progress(message);
		};
		try {
			const modelData = await deltaLakeHelper.getModelData(connectionData);
			debugger
			// const tables = data.collectionData.collections;
			// const databases = data.collectionData.dataBaseNames;
			// const pagination = data.pagination;
			// const includeEmptyCollection = data.includeEmptyCollection;
			// const recordSamplingSettings = data.recordSamplingSettings;
			// const fieldInference = data.fieldInference;

			// this.connect(data, logger, async (err, session, cursor) => {
			// 	if (err) {
			// 		logger.log('error', err, 'Retrieving schema');
			// 		return cb(err);
			// 	}

			// 	try {
			// 		const exec = cursor.asyncExecute.bind(null, session.sessionHandle);
			// 		const query = getExecutorWithResult(cursor, exec);
			// 		const plans = await query('SHOW RESOURCE PLANS');
			// 		const resourcePlans = await Promise.all(plans.map(async plan => {
			// 			const resourcePlanData = await query(`SHOW RESOURCE PLAN ${plan.rp_name}`);

			// 			return { name: plan.rp_name, ...parseResourcePlan(resourcePlanData) };
			// 		}));
			// 		modelData = { resourcePlans };
			// 	} catch (err) {}
			// 	async.mapSeries(databases, (dbName, nextDb) => {
			// 		const exec = cursor.asyncExecute.bind(null, session.sessionHandle);
			// 		const query = getExecutorWithResult(cursor, exec);
			// 		const getPrimaryKeys = getExecutorWithResult(
			// 			cursor,
			// 			cursor.getPrimaryKeys.bind(null, session.sessionHandle)
			// 		);
			// 		const tableNames = tables[dbName] || [];
			// 		exec(`use ${dbName}`)
			// 			.then(() => query(`describe database ${dbName}`))
			// 			.then((databaseInfo) => {
			// 				async.mapSeries(tableNames, (tableName, nextTable) => {
			// 					progress({ message: 'Start sampling data', containerName: dbName, entityName: tableName });
			// 					const isView = tableName.slice(-4) === ' (v)';
			// 					if (isView) {
			// 						const viewName = tableName.slice(0, -4)
			// 						return query(`describe extended ${viewName}`).then(viewData => {
			// 							const { schema, additionalDescription } = viewData.reduce((data, item) => {
			// 								const { schema, isSchemaParsingFinished, additionalDescription } = data;
			// 								if (!item.col_name || item.col_name === 'Detailed Table Information') {
			// 									const originalDdl = item.data_type.split('viewOriginalText:')[1] || '';
			// 									return { ...data, isSchemaParsingFinished: true, additionalDescription: originalDdl};
			// 								}
			// 								if (isSchemaParsingFinished) {
			// 									return { ...data, additionalDescription: `${additionalDescription} ${item.col_name}`};
			// 								}

			// 								return { ...data, schema: {
			// 									...schema,
			// 									[item.col_name]: { comment: item.comment }
			// 								}};
			// 							}, { schema: {}, isSchemaParsingFinished: false, additionalDescription: '' });

			// 							const metaInfoRegex = /(.*?)(, viewExpandedText:|, tableType:|, rewriteEnabled:)/;

			// 							const isMaterialized = additionalDescription.includes('tableType:MATERIALIZED_VIEW');
			// 							const selectStatement = (metaInfoRegex.exec(additionalDescription)[1] || additionalDescription);

			// 							const viewPackage = {
			// 								dbName,
			// 								entityLevel: {},
			// 								views: [{
			// 									name: viewName,
			// 									data: {
			// 										materialized: isMaterialized
			// 									},
			// 									ddl: {
			// 										script: `CREATE VIEW ${viewName} AS ${selectStatement};`,
			// 										type: 'teradata'
			// 									}
			// 								}],
			// 								emptyBucket: false,
			// 								bucketInfo: {
			// 								}
			// 							};
			// 							return nextTable(null, { documentPackage: viewPackage, relationships: [] });
			// 						}).catch(err => {
			// 							nextTable(null, { documentPackage: false, relationships: [] })
			// 						});
			// 					}

			// 					getLimitByCount(recordSamplingSettings, query.bind(null, `select count(*) as count from ${tableName}`))
			// 						.then(countDocuments => {
			// 							progress({ message: 'Start getting data from database', containerName: dbName, entityName: tableName });

			// 							return getDataByPagination(pagination, countDocuments, (limit, offset, next) => {
			// 								retrieveData(query, tableName, limit, offset).then(data => {
			// 										progress({ message: `${limit * (offset + 1)}/${countDocuments}`, containerName: dbName, entityName: tableName });
			// 										next(null, data);
			// 									}, err => next(err));
			// 							});
			// 						})
			// 						.then(documents => documents || [])
			// 						.then((documents) => {
			// 							progress({ message: `Data fetched successfully`, containerName: dbName, entityName: tableName });									

			// 							const documentPackage = {
			// 								dbName,
			// 								collectionName: tableName,
			// 								documents: filterNullValues(documents),
			// 								indexes: [],
			// 								bucketIndexes: [],
			// 								views: [],
			// 								validation: false,
			// 								emptyBucket: false,
			// 								containerLevelKeys: [],
			// 								bucketInfo: {
			// 									description: _.get(databaseInfo, '[0].comment', '')
			// 								}
			// 							};

			// 							if (fieldInference.active === 'field') {
			// 								documentPackage.documentTemplate = _.cloneDeep(documents[0]);
			// 							}

			// 							return documentPackage;
			// 						})
			// 						.then((documentPackage) => {
			// 							progress({ message: `Start creating schema`, containerName: dbName, entityName: tableName });

			// 							return allChain(
			// 								() => query(`describe formatted ${tableName}`),
			// 								() => query(`describe extended ${tableName}`),
			// 								() => exec(`select * from ${tableName} limit 1`).then(cursor.getSchema)
			// 							).then(([formattedTable, extendedTable, tableSchema]) => {
			// 								const tableInfo = hiveHelper
			// 									.getFormattedTable(
			// 										...cursor.getTCLIService(),
			// 										cursor.getCurrentProtocol()
			// 									)(formattedTable);
			// 								const extendedTableInfo = hiveHelper.getDetailInfoFromExtendedTable(extendedTable);
			// 								const sample = documentPackage.documents[0];
			// 								documentPackage.entityLevel = entityLevelHelper.getEntityLevelData(tableName, tableInfo, extendedTableInfo);
			// 								const { columnToConstraints, notNullColumns } = hiveHelper.getTableColumnsConstraints(extendedTable);
			// 								return {
			// 									jsonSchema: hiveHelper.getJsonSchemaCreator(...cursor.getTCLIService(), tableInfo)({ columns: extendedTable, tableColumnsConstraints: columnToConstraints, tableSchema, sample, notNullColumns }),
			// 									relationships: convertForeignKeysToRelationships(dbName, tableName, tableInfo.foreignKeys || [], data.appVersion)
			// 								};
			// 							}).then(({ jsonSchema, relationships }) => {
			// 								progress({ message: `Schema successfully created`, containerName: dbName, entityName: tableName });

			// 								return getPrimaryKeys(dbName, tableName)
			// 									.then(keys => {
			// 										keys.forEach(key => {
			// 											jsonSchema.properties[key.COLUMN_NAME].primaryKey = true;
			// 										});

			// 										return jsonSchema;
			// 									})
			// 									.then(jsonSchema => {
			// 										progress({ message: `Primary keys successfully retrieved`, containerName: dbName, entityName: tableName });

			// 										return ({ jsonSchema, relationships });
			// 									})
			// 									.catch(err => {
			// 										return Promise.resolve({ jsonSchema, relationships });
			// 									});
			// 							}).then(({ jsonSchema, relationships }) => {
			// 								return query(`show indexes on ${tableName}`)
			// 									.then(result => {
			// 										return getIndexes(result);
			// 									})
			// 									.then(indexes => {
			// 										progress({ message: `Indexes successfully retrieved`, containerName: dbName, entityName: tableName });

			// 										documentPackage.entityLevel.SecIndxs = indexes;

			// 										return { jsonSchema, relationships };
			// 									})
			// 									.catch(err => ({ jsonSchema, relationships }));
			// 							}).then(({ jsonSchema, relationships }) => {
			// 								if (jsonSchema) {
			// 									documentPackage.validation = { jsonSchema };
			// 								}

			// 								return {
			// 									documentPackage,
			// 									relationships
			// 								};
			// 							});
			// 						})
			// 						.then((data) => {
			// 							nextTable(null, data);
			// 						})
			// 						.catch(err => {
			// 							nextTable(err)
			// 						});
			// 				}, (err, data) => {
			// 					if (err) {
			// 						nextDb(err);
			// 					} else {
			// 						nextDb(err, expandPackages(data));
			// 					}
			// 				});
			// 			});
			// 	}, (err, data) => {
			// 		if (err) {
			// 			logger.log('error', { message: err.message, stack: err.stack, error: err }, 'Retrieving databases and tables information');

			// 			setTimeout(() => {
			// 				cb(err);
			// 			}, 1000);
			// 		} else {
			// 			cb(err, ...expandFinalPackages(modelData, data));
			// 		}
			// 	});
			// }, app);
			cb(null, [], modelData);
		} catch (e) {
			debugger
		}
	},

	reFromFile: async (data, logger, callback) => {
		callback(null);
	},
};
const logInfo = (step, connectionInfo, logger) => {
	logger.clear();
	logger.log('info', logHelper.getSystemInfo(connectionInfo.appVersion), step);
	logger.log('info', connectionInfo, 'connectionInfo', connectionInfo.hiddenKeys);
};

const handleErrorObject = (error, title) => {
	const errorProperties = Object.getOwnPropertyNames(error).reduce((accumulator, key) => ({ ...accumulator, [key]: error[key] }), {});

	return { title, ...errorProperties };
};
