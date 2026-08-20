'use strict';

const _ = require('lodash');
const async = require('async');
const fetchRequestHelper = require('./fetchRequestHelper');
const { convertCustomTags, cleanEntityName, isSupportGettingListOfViews } = require('./utils');

const getEntityCreateStatement = (connectionInfo, dbName, entityName, logger, ddlOptions = {}) => {
	return fetchRequestHelper.fetchCreateStatementRequest(
		`\`${dbName}\`.\`${entityName}\``,
		connectionInfo,
		logger,
		ddlOptions,
	);
};

/**
 * `SHOW DATABASES` runs on the workspace default catalog, the user is not always have access to;
 * use actual catalog name if specified
 */
const probeCatalogsOrSchemas = async ({ connectionInfo, sparkVersion, logger }) => {
	if (!isSupportUnityCatalog(sparkVersion)) {
		return fetchRequestHelper.fetchClusterDatabasesNames({ connectionInfo, logger });
	}

	if (!connectionInfo.catalogName) {
		const catalogNames = await fetchRequestHelper.fetchClusterCatalogNames({ connectionInfo, logger });
		logger.log('info', catalogNames, 'Catalogs');
		return [];
	}

	await fetchRequestHelper.useCatalog({ connectionInfo, logger });

	if (connectionInfo.databaseName) {
		return [connectionInfo.databaseName];
	}

	return fetchRequestHelper.fetchClusterDatabasesNames({ connectionInfo, logger });
};

const getFirstDatabaseCollectionName = async (connectionInfo, sparkVersion, logger) => {
	const databasesNames = await probeCatalogsOrSchemas({ connectionInfo, sparkVersion, logger });
	if (_.isEmpty(databasesNames)) {
		return;
	}

	logger.log('info', databasesNames, `Schemas`);

	const firstDatabaseName = _.first(databasesNames);

	const tableNames = await fetchRequestHelper.fetchClusterTablesNames({
		dbName: firstDatabaseName,
		connectionInfo,
		logger,
	});
	logger.log('info', tableNames, `Tables list in ${firstDatabaseName} schema`);
	const viewNames = await getDatabaseViewNames(firstDatabaseName, connectionInfo, sparkVersion, logger);
	logger.log('info', viewNames, `Views list in ${firstDatabaseName} schema`);
};

const fetchViewNamesFallback = async (dbName, connectionInfo, logger) => {
	try {
		const viewNamesResponse = await fetchRequestHelper.fetchDatabaseViewsNamesViaPython({
			dbName,
			connectionInfo,
			logger,
		});
		const viewNames = JSON.parse(viewNamesResponse);
		return viewNames.map(name => [dbName, name]);
	} catch (error) {
		logger.log('warning', error, `Error getting view names from ${dbName} schema via Python.`);
		return [];
	}
};

const fetchViewNames = (dbName, connectionInfo, logger) => {
	try {
		return fetchRequestHelper.fetchDatabaseViewsNames({ dbName, connectionInfo, logger });
	} catch (error) {
		logger.log(
			'warning',
			error,
			`Error getting view names from ${dbName} schema via SQL. Run fallback via Python.`,
		);
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
	if (isSupportUnityCatalog(sparkVersion)) {
		await fetchRequestHelper.useCatalog({ connectionInfo, logger });
	}

	const databasesNames = connectionInfo.databaseName
		? [connectionInfo.databaseName]
		: await fetchRequestHelper.fetchClusterDatabasesNames({ connectionInfo, logger });

	return await async.mapLimit(databasesNames, 30, async dbName => {
		const { views, viewNames } = await getDatabaseViewNames(dbName, connectionInfo, sparkVersion, logger);
		const tablesResult = await fetchRequestHelper.fetchClusterTablesNames({ dbName, connectionInfo, logger });
		const tables = tablesResult.reduce((databaseTables, [dbName, tableName]) => {
			if (viewNames.includes(tableName)) {
				return databaseTables;
			}
			return [...databaseTables, tableName];
		}, []);

		const dbCollections = [...tables, ...views];

		return {
			dbName,
			dbCollections,
			isEmpty: _.isEmpty(dbCollections),
		};
	});
};

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
		state: clusterProperties.state,
		data_security_mode: clusterProperties.data_security_mode,
	};
};

const getRuntimeVersion = (sparkVersion = '') => sparkVersion.split('.')[0];

const getDatabricksRuntimeVersion = sparkVersion => `Runtime ${getRuntimeVersion(sparkVersion)}`;

const isSupportUnityCatalog = sparkVersion => {
	const runtimeVersion = getRuntimeVersion(sparkVersion);
	const MINIMUM_UNITY_CATALOG_SUPPORT_VERSION = 11;
	return Number(runtimeVersion) >= MINIMUM_UNITY_CATALOG_SUPPORT_VERSION;
};

const isEnabledUnityCatalog = data_security_mode => ['SINGLE_USER', 'USER_ISOLATION'].includes(data_security_mode);

const getEntitiesDDL = (connectionInfo, databasesNames, collectionsNames, sparkVersion, logger, clusterData) => {
	const entitiesNames = _.flatMap(databasesNames, dbName => {
		return (collectionsNames[dbName] || []).map(entityName => ({ dbName, name: entityName }));
	});

	return async.mapLimit(entitiesNames, 40, async entity => {
		const entityName = cleanEntityName(sparkVersion, entity.name);
		logger.log('info', { db: entity.dbName, entity: entityName }, 'Getting entity DDL');

		const resolvedCatalogName = _.get(clusterData, [entity.dbName, 'dbProperties', 'catalogName']);
		const ddlStatement = await getEntityCreateStatement(connectionInfo, entity.dbName, entityName, logger, {
			resolvedCatalogName,
		});

		logger.log('info', { db: entity.dbName, entity: entityName }, 'DDL retrieved successfully');

		return {
			[`${entity.dbName}.${entityName}`]: ddlStatement,
		};
	});
};

const getClusterData = (connectionInfo, databasesNames, collectionsNames, isManagedLocationSupports, logger) => {
	return fetchRequestHelper.fetchClusterData(
		connectionInfo,
		collectionsNames,
		databasesNames,
		isManagedLocationSupports,
		logger,
	);
};

module.exports = {
	getFirstDatabaseCollectionName,
	getDatabaseCollectionNames,
	getClusterStateInfo,
	getClusterData,
	getEntitiesDDL,
	isSupportUnityCatalog,
	isEnabledUnityCatalog,
};
