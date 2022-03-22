'use strict'
const { dependencies } = require('../appDependencies');
const fetchRequestHelper = require('./fetchRequestHelper')
const { splitTableAndViewNames, convertCustomTags } = require('./utils')


const getEntityCreateStatement = (connectionInfo, dbName, entityName, logger) => {
	return fetchRequestHelper.fetchCreateStatementRequest(`\`${dbName}\`.\`${entityName}\``, connectionInfo, logger);
}

const getDatabaseCollectionNames = async (connectionInfo) => {
	const databasesNames = await fetchRequestHelper.fetchClusterDatabasesNames(connectionInfo);
	return await Promise.all(databasesNames.map(async dbName => {

		const viewsResult = await fetchRequestHelper.fetchDatabaseViewsNames(dbName, connectionInfo);
		const viewsNames = viewsResult.map(([namespace, viewName]) => viewName);
		const views = viewsNames.map(viewName => `${viewName} (v)`);

		const tablesResult = await fetchRequestHelper.fetchClusterTablesNames(dbName, connectionInfo);
		const tables = tablesResult.reduce((databaseTables, [dbName, tableName]) => {
			if (viewsNames.includes(tableName)) {
				return databaseTables;
			}
			return [...databaseTables, tableName]
		}, []);

		const dbCollections = [...tables, ...views];
		return {
			dbName,
			dbCollections,
			isEmpty: dependencies.lodash.isEmpty(dbCollections)
		}
	}));
}

const getModelData = async (connectionInfo, logger) => {
	const clusterProperties = await fetchRequestHelper.fetchClusterProperties(connectionInfo);
	return {
		dbVersion: `Runtime ${clusterProperties.spark_version[0]}`,
		modelName: clusterProperties.cluster_name,
		author: clusterProperties.creator_user_name,
		host: connectionInfo.host,
		port: clusterProperties.jdbc_port,
		cluster_name: clusterProperties.cluster_name,
		min_workers: clusterProperties.num_workers,
		max_workers: clusterProperties.num_workers,
		spark_version: clusterProperties.spark_version,
		spark_conf: JSON.stringify(clusterProperties.spark_conf),
		node_type_id: clusterProperties.node_type_id,
		driver_node_type_id: clusterProperties.driver_node_type_id,
		custom_tags: convertCustomTags(clusterProperties.custom_tags, logger),
		autotermination_minutes: clusterProperties.autotermination_minutes,
		enable_elastic_disk: clusterProperties.enable_elastic_disk,
		aws_attributes: clusterProperties.aws_attributes
	};
}

const requiredClusterState = async (connectionInfo, logInfo, logger) => {
	const clusterProperties = await fetchRequestHelper.fetchClusterProperties(connectionInfo);
	logger.log('Retrieving databases and tables information', 'Cluster status: ' + clusterProperties.state);
	return {
		isRunning: clusterProperties.state === 'RUNNING',
		state: clusterProperties.state
	}
}

const getEntitiesDDL = (connectionInfo, databasesNames, collectionsNames, logger) => {
	const entitiesNames = databasesNames.reduce((entitiesNames, dbName) => {
		const { tables, views } = splitTableAndViewNames(collectionsNames[dbName]);
		const viewNames = views.map(viewName => ({ dbName, name: viewName }));
		const tableNames = tables.map(tableName => ({ dbName, name: tableName }));

		return [...entitiesNames, ...viewNames, ...tableNames]
	}, []);
	return entitiesNames.map(async entity => ({ [`${entity.dbName}.${entity.name}`]: await getEntityCreateStatement(connectionInfo, entity.dbName, entity.name, logger) }))
}

const getClusterData = (connectionInfo, databasesNames, collectionsNames, logger) => {
	return fetchRequestHelper.fetchClusterData(connectionInfo, collectionsNames, databasesNames, logger);
}

module.exports = {
	getDatabaseCollectionNames,
	getModelData,
	requiredClusterState,
	getClusterData,
	getEntitiesDDL
};