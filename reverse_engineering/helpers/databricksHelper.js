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
	logger.log('info', databasesNames, `Database list`);
	if (_.isEmpty(databasesNames)) {
		return;
	}

	const firstDatabaseName = _.first(databasesNames);
	
	const tableNames = await fetchRequestHelper.fetchClusterTablesNames(firstDatabaseName, connectionInfo);
	logger.log('info', tableNames, `Tables list in ${firstDatabaseName} database`);
	const viewNames = await getDatabaseViewNames(firstDatabaseName, connectionInfo, sparkVersion, logger);
	logger.log('info', viewNames, `Views list in ${firstDatabaseName} database`);
};

const fetchViewNamesFallback = async (dbName, connectionInfo, logger) => {
	try {
		const viewNamesResponse = await fetchRequestHelper.fetchDatabaseViewsNamesViaPython(dbName, connectionInfo);
		const viewNames = JSON.parse(viewNamesResponse);
		return viewNames.map(name => [ dbName, name ]);
	} catch (error) {
		logger.log('warning', error, `Error getting view names from ${dbName} database via Python.`);
		return [];
	}
};

const fetchViewNames = (dbName, connectionInfo, logger) => {
	try {
		return fetchRequestHelper.fetchDatabaseViewsNames(dbName, connectionInfo);
	} catch (error) {
		logger.log('warning', error, `Error getting view names from ${dbName} database via SQL. Run fallback via Python.`);
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
	const databasesNames = await fetchRequestHelper.fetchClusterDatabasesNames(connectionInfo);
	logger.log('info', databasesNames, 'Database names list');
	return await Promise.all(databasesNames.map(async dbName => {
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
	}));
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

const getDatabricksRuntimeVersion = (sparkVersion = '') => {
	const runtimeVersion = sparkVersion.split('.')[0];
	return `Runtime ${runtimeVersion}`;
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
	getFirstDatabaseCollectionName,
	getDatabaseCollectionNames,
	getClusterStateInfo,
	getClusterData,
	getEntitiesDDL
};