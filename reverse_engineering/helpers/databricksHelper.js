'use strict'
const { dependencies } = require('../appDependencies');
const fetchRequestHelper = require('./fetchRequestHelper')
const { convertCustomTags, cleanEntityName, isSupportGettingListOfViews } = require('./utils')


const getEntityCreateStatement = (connectionInfo, dbName, entityName, logger) => {
	return fetchRequestHelper.fetchCreateStatementRequest(`\`${dbName}\`.\`${entityName}\``, connectionInfo, logger);
}

const getDatabaseCollectionNames = async (connectionInfo, sparkVersion) => {
	const databasesNames = await fetchRequestHelper.fetchClusterDatabasesNames(connectionInfo);
	return await Promise.all(databasesNames.map(async dbName => {

		let views = [];
		let viewNames = [];
		if (isSupportGettingListOfViews(sparkVersion)) {
			const viewsResult = await fetchRequestHelper.fetchDatabaseViewsNames(dbName, connectionInfo);
			viewNames = viewsResult.map(([namespace, viewName]) => viewName);
			views = viewNames.map(viewName => `${viewName} (v)`);
		}

		const tablesResult = await fetchRequestHelper.fetchClusterTablesNames(dbName, connectionInfo);
		const tables = tablesResult.reduce((databaseTables, [dbName, tableName]) => {
			if (viewNames.includes(tableName)) {
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

const getClusterStateInfo = async (connectionInfo, logger) => {
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
		aws_attributes: clusterProperties.aws_attributes,
		isRunning: clusterProperties.state === 'RUNNING',
		state: clusterProperties.state
	};
}

const getEntitiesDDL = (connectionInfo, databasesNames, collectionsNames, sparkVersion, logger) => {
	const entitiesNames = dependencies.lodash.flatMap(databasesNames, dbName => {
		return (collectionsNames[dbName] || []).map(entityName => ({ dbName, name: entityName }));
	});
	
	return entitiesNames.map(async entity => {
		const entityName = cleanEntityName(sparkVersion, entity.name);
		const ddlStatement = await getEntityCreateStatement(connectionInfo, entity.dbName, entityName, logger);
		return {
			[`${entity.dbName}.${entityName}`]: ddlStatement
		};
	});
}

const getClusterData = (connectionInfo, databasesNames, collectionsNames, logger) => {
	return fetchRequestHelper.fetchClusterData(connectionInfo, collectionsNames, databasesNames, logger);
}

module.exports = {
	getDatabaseCollectionNames,
	getClusterStateInfo,
	getClusterData,
	getEntitiesDDL
};