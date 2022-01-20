const SqlBaseLexer = require('../parser/SQLBase/SqlBaseLexer')
const SqlBaseParser = require('../parser/SQLBase/SqlBaseParser')
const SqlBaseToCollectionVisitor = require('../sqlBaseToCollectionsVisitor')
const ExprErrorListener = require('../antlrErrorListener');
const columnREHelper = require('./columnsREHelper')
const antlr4 = require('antlr4');
const { dependencies } = require('../appDependencies');

const getTableData = async (table, data, logger) => {
	const { ddl, nullableMap, indexes } = table;
	let tableData = {};
	try {
		tableData = getTableDataFromDDl(ddl);
	} catch (e) {
		logger.log('info', data, `Error parsing ddl statement: \n${ddl}\n`, data.hiddenKeys);
		return {};
	}
	const BloomIndxs = convertIndexes(indexes)
	const tablePropertiesWithNotNullConstraints = tableData.properties.map(property => ({ ...property, required: nullableMap[property.name] !== 'true' }))
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
	const tableProperties = parsedTableData.tableProperties[0] || { start: 0, stop: 0 }
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


const getTableProvider = (provider) => {
	switch (provider?.toLowerCase()) {
		case 'orc':
			return 'ORC';
		case 'parquet':
			return 'Parquet';
		case 'avro':
			return 'Avro';
		case 'hive':
			return 'Hive';
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


module.exports = {
	getTableData
};