'use strict'
const fetchRequestHelper = require('./fetchRequestHelper')
const _ = require('lodash')


const getDatabaseCollectionNames = async (connectionInfo, dbName) => {

	const dbTablesAndViewsNames = await fetchRequestHelper.fetchDatabaseTablesNames(connectionInfo, dbName);
	const dbViewsNames = await fetchRequestHelper.fetchDatabaseViewsNames(connectionInfo, dbName);

	const dbTablesNames = dbTablesAndViewsNames.filter(name => !dbViewsNames.includes(name))
	const markedViewNames = dbViewsNames.map(name => name + ' (v)')

	const dbEntitiesNames = [...dbTablesNames, ...markedViewNames];

	return {
		dbName,
		dbCollections: dbEntitiesNames,
		isEmpty: _.isEmpty(dbEntitiesNames),
	};

}

const getModelData = async (connectionInfo) => {
	const clusterProperties = await fetchRequestHelper.fetchClusterProperties(connectionInfo);
	//TODO add aws_attributes for AWS
	return {
		modelName: clusterProperties.cluster_name,
		author: clusterProperties.creator_user_name,
		host: connectionInfo.host,//TODO: investigate
		port: "",//TODO: investigate
		cluster_name: clusterProperties.cluster_name,
		min_workers: clusterProperties.num_workers,//TODO: investigate min
		max_workers: clusterProperties.num_workers,//TODO: investigate max
		spark_version: clusterProperties.spark_version,
		spark_conf: JSON.stringify(clusterProperties.spark_conf),
		node_type_id: clusterProperties.node_type_id,
		driver_node_type_id: clusterProperties.driver_node_type_id,
		custom_tags: convertCustomTags(clusterProperties.custom_tags),
		autotermination_minutes: clusterProperties.autotermination_minutes,
		enable_elastic_disk: clusterProperties.enable_elastic_disk,
		aws_attributes: ""//TODO: investigate
	};
}

const requiredClusterState = async (connectionInfo, logInfo, logger) => {
	const clusterProperties = await fetchRequestHelper.fetchClusterProperties(connectionInfo);
	logInfo('Retrieving databases and tables information', 'Cluster status: ' + clusterProperties.state, logger, logger);
	return {
		isRunning: clusterProperties.state === 'RUNNING',
		state: clusterProperties.state
	}
}

const convertCustomTags = (custom_tags) =>
	Object.keys(custom_tags).reduce((tags, tagKey) => {
		return [...tags, { customTagKey: tagKey, customtagvalue: custom_tags[tagKey] }]
	}, []);

module.exports = {
	getDatabaseCollectionNames,
	getModelData,
	requiredClusterState
};