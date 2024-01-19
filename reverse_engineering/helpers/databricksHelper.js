'use strict'
const { dependencies } = require('../appDependencies');
const fetchRequestHelper = require('./fetchRequestHelper')
const { convertCustomTags, cleanEntityName, isSupportGettingListOfViews } = require('./utils')


const getEntityCreateStatement = (connectionInfo, dbName, entityName, logger) => {
	return fetchRequestHelper.fetchCreateStatementRequest(`\`${dbName}\`.\`${entityName}\``, connectionInfo, logger);
}

const getFirstDatabaseCollectionName = async (connectionInfo, sparkVersion, logger) => {
	const _ = dependencies.lodash;
	const databasesNames = await fetchRequestHelper.fetchClusterDatabasesNames(connectionInfo);
	logger.log('info', databasesNames, `Schema list`);
	if (_.isEmpty(databasesNames)) {
		return;
	}

	const firstDatabaseName = _.first(databasesNames);
	
	const tableNames = await fetchRequestHelper.fetchClusterTablesNames(firstDatabaseName, connectionInfo);
	logger.log('info', tableNames, `Tables list in ${firstDatabaseName} schema`);
	const viewNames = await getDatabaseViewNames(firstDatabaseName, connectionInfo, sparkVersion, logger);
	logger.log('info', viewNames, `Views list in ${firstDatabaseName} schema`);
};

const fetchViewNamesFallback = async (dbName, connectionInfo, logger) => {
	try {
		const viewNamesResponse = await fetchRequestHelper.fetchDatabaseViewsNamesViaPython(dbName, connectionInfo);
		const viewNames = JSON.parse(viewNamesResponse);
		return viewNames.map(name => [ dbName, name ]);
	} catch (error) {
		logger.log('warning', error, `Error getting view names from ${dbName} schema via Python.`);
		return [];
	}
};

const fetchViewNames = (dbName, connectionInfo, logger) => {
	try {
		return fetchRequestHelper.fetchDatabaseViewsNames(dbName, connectionInfo);
	} catch (error) {
		logger.log('warning', error, `Error getting view names from ${dbName} schema via SQL. Run fallback via Python.`);
		return fetchViewNamesFallback(dbName, connectionInfo, logger);
	}
};

const getDatabaseViewNames = async (dbName, connectionInfo, sparkVersion, logger) => {
	let views = [];
	let viewNames = [];
	if (!isSupportGettingListOfViews(sparkVersion)) {
		return { views, viewNames };
	}
	
	const viewsResult = await fetchViewNames(dbName, connectionInfo, logger);
	viewNames = viewsResult.map(([namespace, viewName]) => viewName);
	views = viewNames.map(viewName => `${viewName} (v)`);
	
	return { views, viewNames };
};

const getDatabaseCollectionNames = async (connectionInfo, sparkVersion, logger) => {
	const async = dependencies.async;

	if (isSupportUnityCatalog(sparkVersion)) {
		await fetchRequestHelper.useCatalog(connectionInfo);
	}

	const databasesNames = connectionInfo.databaseName
		? [connectionInfo.databaseName]
		: await fetchRequestHelper.fetchClusterDatabasesNames(connectionInfo);
	
	return await async.mapLimit(databasesNames, 30, async dbName => {
		const { views, viewNames } = await getDatabaseViewNames(dbName, connectionInfo, sparkVersion, logger)
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
	});
}

const getClusterStateInfo = async (connectionInfo, logger) => {
	const clusterProperties = await fetchRequestHelper.fetchClusterProperties(connectionInfo);
	return {
		dbVersion: getDatabricksRuntimeVersion(clusterProperties.spark_version),
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

const getRuntimeVersion = (sparkVersion = '') => sparkVersion.split('.')[0];

const getDatabricksRuntimeVersion = (sparkVersion) => `Runtime ${getRuntimeVersion(sparkVersion)}`;

const isSupportUnityCatalog = (sparkVersion) => {
	const runtimeVersion = getRuntimeVersion(sparkVersion);
	const MINIMUM_UNITY_CATALOG_SUPPORT_VERSION = 11;
	return Number(runtimeVersion) >= MINIMUM_UNITY_CATALOG_SUPPORT_VERSION;
}

const getEntitiesDDL = (connectionInfo, databasesNames, collectionsNames, sparkVersion, logger) => {
	const async = dependencies.async;
	const entitiesNames = dependencies.lodash.flatMap(databasesNames, dbName => {
		return (collectionsNames[dbName] || []).map(entityName => ({ dbName, name: entityName }));
	});
	
	return async.mapLimit(entitiesNames, 40, async entity => {
		const entityName = cleanEntityName(sparkVersion, entity.name);
		logger.log('info', { db: entity.dbName, entity: entityName }, 'Getting entity DDL');

		const ddlStatement = await getEntityCreateStatement(connectionInfo, entity.dbName, entityName, logger);

		logger.log('info', { db: entity.dbName, entity: entityName }, 'DDL retrieved successfully');

		return {
			[`${entity.dbName}.${entityName}`]: ddlStatement
		};
	});
}

const getClusterData = (connectionInfo, databasesNames, collectionsNames, isManagedLocationSupports, logger) => {
	return fetchRequestHelper.fetchClusterData(connectionInfo, collectionsNames, databasesNames, isManagedLocationSupports, logger);
}

module.exports = {
	getFirstDatabaseCollectionName,
	getDatabaseCollectionNames,
	getClusterStateInfo,
	getClusterData,
	getEntitiesDDL,
	isSupportUnityCatalog,
};
