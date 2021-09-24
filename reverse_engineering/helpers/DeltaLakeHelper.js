'use strict'
const fetchRequestHelper = require('./fetchRequestHelper')
const SqlBaseLexer = require('../parser/SQLBase/SqlBaseLexer')
const SqlBaseParser = require('../parser/SQLBase/SqlBaseParser')
const SqlBaseToCollectionVisitor = require('../sqlBaseToCollectionsVisitor')
const ExprErrorListener = require('../antlrErrorListener');
const columnREHelper = require('./ColumnsREHelper')
const antlr4 = require('antlr4');
const { dependencies } = require('../appDependencies')

const getTableData = async (table,data, logger) => {
	const { ddl, nullableMap, indexes } = table;
	let tableData = {};
	try {
		tableData = getTableDataFromDDl(ddl);
	} catch (e) {
		logger.log('info', data, `Error parsing ddl statement: \n${ddl}\n`, data.hiddenKeys);
		return {};
	}
	const BloomIndxs = convertIndexes(indexes)
	const tablePropertiesWithNotNullConstraints = tableData.properties.map(property => ({ ...property, required: nullableMap[property.name]!== 'true' }))
	const tableSchema = tablePropertiesWithNotNullConstraints.reduce((schema, property) => ({ ...schema, [property.name]: property }), {})
	const requiredColumns = tablePropertiesWithNotNullConstraints.filter(column => column.required).map(column => column.name);
	tableData = {
		...tableData,
		properties: tablePropertiesWithNotNullConstraints,
		schema: tableSchema,
		requiredColumns
	};
	if (!dependencies.lodash.isEmpty(BloomIndxs)) {
		return Object.assign(tableData, { "propertiesPane": { ...tableData.propertiesPane, BloomIndxs } });
	}
	return tableData;
}

const getEntityCreateStatement = async (connectionInfo, dbName, entityName) => {
	const query = "var stmt = sqlContext.sql(\"SHOW CREATE TABLE `" + dbName + "`.`" + entityName + "`\").select(\"createtab_stmt\").first.getString(0)";
	return await fetchRequestHelper.fetchCreateStatementRequest(query, connectionInfo);
}

const convertIndexes = indexes => {
	const indexMap = Object.keys(indexes)
		.filter(columnName => !dependencies.lodash.isEmpty(indexes[columnName]))
		.reduce((indexMap, columnName) => {
			const indexObject = indexes[columnName];
			const indexString = `fpp = ${indexObject['delta.bloomFilter.fpp']}, numItems = ${indexObject['delta.bloomFilter.numItems']}, maxExpectedFpp = ${indexObject['delta.bloomFilter.maxExpectedFpp']}, enabled = ${indexObject['delta.bloomFilter.enabled']}`
			if (indexMap[indexString]) {
				return { ...indexMap, [indexString]: [...indexMap[indexString], columnName] }
			}
			return { ...indexMap, [indexString]: [columnName] }
		}, {});
	return Object.keys(indexMap).map(options => ({ options, forColumns: indexMap[options] }))
}

const getDatabaseCollectionNames = async (connectionInfo) => {
	const parsedDatabaseData = await fetchRequestHelper.fetchClusterDatabaseTables(connectionInfo);
	return parsedDatabaseData.map(item => ({
		dbName: item.dbName,
		dbCollections: item.dbCollections,
		isEmpty: item.isEmpty
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
	const tableProperties = parsedTableData.tableProperties[0] || {start:0, stop:0}
	return {
		properties,
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
			tableProperties: statement.slice(tableProperties.start + 1, tableProperties.stop),
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

const requiredClusterState = async (connectionInfo, logInfo, logger) => {
	const clusterProperties = await fetchRequestHelper.fetchClusterProperties(connectionInfo);
	logger.log('Retrieving databases and tables information', 'Cluster status: ' + clusterProperties.state);
	return {
		isRunning: clusterProperties.state === 'RUNNING',
		state: clusterProperties.state
	}
}

const convertCustomTags = (custom_tags, logger) => {
	try {
		return Object.keys(custom_tags).reduce((tags, tagKey) => {
			return [...tags, { customTagKey: tagKey, customtagvalue: custom_tags[tagKey] }]
		}, []);
	} catch (e) {
		logger.log('error', custom_tags, 'Error converting custom tags');
		return []
	}
}

const splitTableAndViewNames = names => {
	const namesByCategory = dependencies.lodash.partition(names, isView);

	return { views: namesByCategory[0].map(name => name.slice(0, -4)), tables: namesByCategory[1] };
};

const isView = name => name.slice(-4) === ' (v)';

const prepareNamesForInsertionIntoScalaCode = (databasesNames, collectionsNames) =>
	databasesNames.reduce((entities, dbName) => {
		const { tables } = splitTableAndViewNames(collectionsNames[dbName]);
		const tableNames = tables.map(tableName => `\"${tableName}\"`).join(', ');

		return {
			tableNames: [...entities.tableNames, `\"${dbName}\" -> List(${tableNames})`],
			dbNames: databasesNames.map(name => `\"${name}\"`)
		}
	}, { viewNames: [], tableNames: [] })

const getClusterData = (connectionInfo, databasesNames, collectionsNames) => {
	const { tableNames, dbNames } = prepareNamesForInsertionIntoScalaCode(databasesNames, collectionsNames);
	return fetchRequestHelper.fetchClusterData(connectionInfo, tableNames.join(', '), dbNames.join(', '));
}

const getEntitiesDDL = (connectionInfo, databasesNames, collectionsNames) => {
	const entitiesNames = databasesNames.reduce((entitiesNames, dbName) => {
		const { tables, views } = splitTableAndViewNames(collectionsNames[dbName]);
		const viewNames = views.map(viewName => ({ dbName, name: viewName }));
		const tableNames = tables.map(tableName => ({ dbName, name: tableName }));

		return [...entitiesNames, ...viewNames, ...tableNames]
	}, []);
	return entitiesNames.map(async entity => ({ [`${entity.dbName}.${entity.name}`]: await getEntityCreateStatement(connectionInfo, entity.dbName, entity.name) }))
}

module.exports = {
	getDatabaseCollectionNames,
	getModelData,
	requiredClusterState,
	splitTableAndViewNames,
	getTableDataFromDDl,
	getViewDataFromDDl,
	getTableData,
	getClusterData,
	getEntitiesDDL
};