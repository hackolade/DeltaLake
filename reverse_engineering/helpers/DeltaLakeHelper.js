'use strict'
const fetchRequestHelper = require('./fetchRequestHelper')
const SqlBaseLexer = require('../parser/SQLBase/SqlBaseLexer')
const SqlBaseParser = require('../parser/SQLBase/SqlBaseParser')
const SqlBaseToCollectionVisitor = require('../sqlBaseToCollectionsVisitor')
const ExprErrorListener = require('../antlrErrorListener');
const columnREHelper = require('./ColumnsREHelper')
const antlr4 = require('antlr4');
const { dependencies } = require('../appDependencies')

const getTableData = async(connectionData, dbName, tableName, ddl, tableColumnsNullableMap) => {
	let tableData = getTableDataFromDDl(ddl);
	const tableCheckConstraints = await fetchRequestHelper.fetchTableCheckConstraints(connectionData,dbName, tableName)
	tableData.properties[0]['check'] = tableCheckConstraints;
	const indexes = await fetchRequestHelper.fetchBloomFilteredIndexes(connectionData, dbName, tableName)

	const tablePropertiesWithNotNullConstraints = tableData.properties.map(property => ({...property, required: !tableColumnsNullableMap[property.name]}))
	const tableSchema = tablePropertiesWithNotNullConstraints.reduce((schema, property) => ({...schema, [property.name]: property}),{})
	const requiredColumns = tablePropertiesWithNotNullConstraints.filter(column => column.required).map(column => column.name);
	tableData = {...tableData, properties: tablePropertiesWithNotNullConstraints, schema: tableSchema, requiredColumns};
	if(!dependencies.lodash.isEmpty(indexes)){
		return Object.assign(tableData, {"propertiesPane":{...tableData.propertiesPane,"BloomIndxs":indexes}});
	}
	return tableData;
}

const getDatabaseCollectionNames = async (connectionInfo, dbName) => {

	const dbTablesAndViewsNames = await fetchRequestHelper.fetchDatabaseTablesNames(connectionInfo, dbName);
	const dbViewsNames = await fetchRequestHelper.fetchDatabaseViewsNames(connectionInfo, dbName);

	const dbTablesNames = dbTablesAndViewsNames.filter(name => !dbViewsNames.includes(name))
	const markedViewNames = dbViewsNames.map(name => name + ' (v)')

	const dbEntitiesNames = [...dbTablesNames, ...markedViewNames];

	return {
		dbName,
		dbCollections: dbEntitiesNames,
		isEmpty: dependencies.lodash.isEmpty(dbEntitiesNames),
	};

}

const getModelData = async (connectionInfo) => {
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
		custom_tags: convertCustomTags(clusterProperties.custom_tags),
		autotermination_minutes: clusterProperties.autotermination_minutes,
		enable_elastic_disk: clusterProperties.enable_elastic_disk,
		aws_attributes: clusterProperties.aws_attributes
	};
}

const getContainerData = async (connectionInfo, dbName) => {
	const containerProperties = await fetchRequestHelper.fetchDatabaseProperties(connectionInfo, dbName)
	return {
		description:containerProperties.description,
		dbProperties:containerProperties.dbProperties,
		location: containerProperties.location
	}
}

const getFunctions = async (connectionInfo, dbName) => {
	return await fetchRequestHelper.fetchFunctionNames(connectionInfo)
}

const getTableProvider = (provider) => {
	switch (provider?.toLowerCase()) {
		case 'orc':
			return 'ORC';
		case 'parquet':
			return 'Parquet';
		case 'avro':
			return 'Avro';
		case 'rcfile':
			return 'RCfile';
		case 'jsonfile':
			return 'JSONfile';
		case 'csv':
			return 'CSVfile';
		case 'libsvm':
			return 'LIBSVM'
		default: return provider?.toLowerCase()
	}
}

const getTableDataFromDDl = (statement) => {
	const chars = new antlr4.InputStream(statement);
	const lexer = new SqlBaseLexer.SqlBaseLexer(chars);
	lexer.removeErrorListeners();
	lexer.addErrorListener(new ExprErrorListener());
	const tokens = new antlr4.CommonTokenStream(lexer);
	const parser = new SqlBaseParser.SqlBaseParser(tokens);
	parser.removeErrorListeners();
	parser.addErrorListener(new ExprErrorListener());
	const tree = parser.singleStatement();
	const sqlBaseToCollectionVisitor = new SqlBaseToCollectionVisitor();
	let parsedTableData = tree.accept(sqlBaseToCollectionVisitor);
	if (!dependencies.lodash.isEmpty(parsedTableData.query)) {
		parsedTableData.query = statement.substring(parsedTableData.query.select.start, parsedTableData.query.select.stop)
	}
	const properties = parsedTableData.colList.map(column => columnREHelper.reverseTableColumn(column));
	const schema = parsedTableData.colList.reduce((properties, column) => ({...properties, [column.colName]:columnREHelper.reverseTableColumn(column)}),{});
	return {
		properties,
		schema,
		propertiesPane: {
			code: parsedTableData.table,
			temporaryTable: parsedTableData.isTemporary,
			externalTable: parsedTableData.isExternal,
			using: getTableProvider(parsedTableData.using),
			storedAsTable: getTableProvider(parsedTableData.tableProvider),
			rowFormat: parsedTableData.rowFormat,
			fieldsTerminatedBy: parsedTableData.fieldsTerminatedBy,
			fieldsescapedBy: parsedTableData.escapedBy,
			collectionItemsTerminatedBy: parsedTableData.collectionItemsTerminatedBy,
			mapKeysTerminatedBy: parsedTableData.keysTerminatedBy,
			linesTerminatedBy: parsedTableData.linesSeparatedBy,
			nullDefinedAs: parsedTableData.nullDefinedAs,
			serDeLibrary: parsedTableData.serDeLibrary,
			serDeProperties: parsedTableData.serDeProperties,
			inputFormatClassname: parsedTableData.createFileFormat?.inputFormatClassname,
			outputFormatClassname: parsedTableData.createFileFormat?.outputFormatClassname,
			compositePartitionKey: parsedTableData.partitionBy?.map(key => ({ name: key })),
			compositeClusteringKey: parsedTableData.clusteredBy?.map(key => ({ name: key })),
			sortedByKey: parsedTableData.sortedBy,
			numBuckets: parsedTableData.bucketsNum,
			skewedby: parsedTableData.skewedBy?.map(key => ({ name: key })),
			skewedOn: parsedTableData.skewedOn,
			location: parsedTableData.location,
			tableProperties: parsedTableData.tableProperties,
			comments: parsedTableData.commentSpec,
		}
	}

}

const getViewDataFromDDl = statement => {
	const chars = new antlr4.InputStream(statement);
	const lexer = new SqlBaseLexer.SqlBaseLexer(chars);
	lexer.removeErrorListeners();
	lexer.addErrorListener(new ExprErrorListener());
	const tokens = new antlr4.CommonTokenStream(lexer);
	const parser = new SqlBaseParser.SqlBaseParser(tokens);
	parser.removeErrorListeners();
	parser.addErrorListener(new ExprErrorListener());
	const tree = parser.singleStatement();

	const sqlBaseToCOllectionVisitor = new SqlBaseToCollectionVisitor();
	let parsedViewData = tree.accept(sqlBaseToCOllectionVisitor);
	if (!dependencies.lodash.isEmpty(parsedViewData.selectStatement)) {
		parsedViewData.selectStatement = statement.substring(parsedViewData.selectStatement.select.start, parsedViewData.selectStatement.select.stop)
	}
	return {
		code: parsedViewData.identifier,
		global: parsedViewData.global,
		viewOrReplace: parsedViewData.orReplace,
		viewIfNotExist: parsedViewData.ifNotExists,
		viewTemporary: parsedViewData.temporary,
		description: parsedViewData.comment,
		selectStatement: parsedViewData.selectStatement,
		tableProperties: parsedViewData.tblProperties
	}
}

const fetchLimitByCount = async (connectionInfo, collectionName, dbName) => {
	const countResult = await fetchRequestHelper.fetchLimitByCount(connectionInfo, collectionName, dbName);
	const countExtractionRegex = /stmt: Array\[org.apache.spark.sql.Row\] = Array\(\[(\d+)\]\)/gm;
	const numberOfRows = dependencies.lodash.get(countExtractionRegex.exec(countResult), '1', '')
	return numberOfRows;
}


const requiredClusterState = async (connectionInfo, logInfo, logger) => {
	const clusterProperties = await fetchRequestHelper.fetchClusterProperties(connectionInfo);
	logger.log('Retrieving databases and tables information', 'Cluster status: ' + clusterProperties.state);
	return {
		isRunning: clusterProperties.state === 'RUNNING',
		state: clusterProperties.state
	}
}

const convertCustomTags = (custom_tags) =>
	Object.keys(custom_tags).reduce((tags, tagKey) => {
		return [...tags, { customTagKey: tagKey, customtagvalue: custom_tags[tagKey] }]
	}, []);

const getEntityCreateStatement = async (connectionInfo, dbName, entityName) => {
	const query = "var stmt = sqlContext.sql(\"SHOW CREATE TABLE `" + dbName + "`.`" + entityName + "`\").select(\"createtab_stmt\").first.getString(0)";
	return await fetchRequestHelper.fetchCreateStatementRequest(query, connectionInfo);
}

const splitTableAndViewNames = names => {
	const namesByCategory = dependencies.lodash.partition(names, isView);

	return { views: namesByCategory[0].map(name => name.slice(0, -4)), tables: namesByCategory[1] };
};

const isView = name => name.slice(-4) === ' (v)';

module.exports = {
	getDatabaseCollectionNames,
	getModelData,
	requiredClusterState,
	getEntityCreateStatement,
	splitTableAndViewNames,
	getContainerData,
	getTableDataFromDDl,
	getViewDataFromDDl,
	fetchLimitByCount,
	getTableData
};