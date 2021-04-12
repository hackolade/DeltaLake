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

module.exports = {
	getDatabaseCollectionNames,
};