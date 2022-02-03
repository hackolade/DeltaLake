const { dependencies } = require('../appDependencies');
const { Parser } = require('flora-sql-parser');
const { getColumnDataFromAst, setTableName, getDefaultTableName } = require('./columnAstHelper');

const getViewInfoFromAsSelect = (tables, view, views = []) => {
	const selectAst = parseSelectStatement(view.selectStatement);
	const collectionName = getDefaultTableName(selectAst);
	const selectedTables = dependencies.lodash.get(selectAst, 'from', []).map(table => ({ ...table, tableName: table.table }));
	const columns = dependencies.lodash.get(selectAst, 'columns', []);
	const columnsData = getViewColumnsData(columns, tables, selectedTables, views);
	const columnsNamesByTables = selectedTables
		.map(table => table.tableName)
		.reduce(
			(namesMap, tableName) => ({
				...namesMap,
				[dependencies.lodash.toLower(tableName)]: getColumns(findTable(tables, tableName)).map(column =>
					dependencies.lodash.toLower(dependencies.lodash.get(column, 'name', '')),
				),
			}),
			{},
		);

	const viewFields = columnsData
		.map(setTableName(columnsNamesByTables, collectionName))
		.map(setBucketName(selectedTables))
		.map(getCollectionReference(selectedTables))
		.filter(Boolean)
        .reduce((viewProperties, property) => {
            return {
                ...viewProperties,
                [property.name]: property,
            };
        }, {});

	return {
		options: {
			viewOn: collectionName,
		},
		jsonSchema: {
			properties: viewFields
		}
	}
};

const getAllColumns = (tables, selectedTables) => {
	const selectedTablesNames = selectedTables.map(table => table.table);

	return dependencies.lodash.flatten(
		selectedTablesNames
			.map(name => findTable(tables, name))
			.map(table =>
				getColumns(table).map(column => {
					return {
						name: dependencies.lodash.get(column, 'name', ''),
						tableName: dependencies.lodash.get(table, 'collectionName', ''),
						alias: '',
						data: {},
					};
				}),
			),
	);
};

const findTable = (tables, name) => {
    const getTableName = table => table.collectionName || table.tableName;
    return tables.find(table => dependencies.lodash.toUpper(getTableName(table)) === dependencies.lodash.toUpper(name));
};

const setBucketName = tables => columnData => {
	const tableFrom = findTable(tables, columnData.tableName);

	return {
		...columnData,
		bucketName: dependencies.lodash.get(tableFrom, 'db'),
	};
};

const getCollectionReference =
	selectedTables =>
	({ name, tableName, alias, bucketName }) => {
		if (!name || !tableName) {
			return;
		}

		const table = selectedTables.find(table => table.as === tableName);

		return {
			name: alias || name,
			type: 'reference',
			refType: 'collectionReference',
			$ref: `#collection/definitions/${dependencies.lodash.get(table, 'tableName', tableName)}/${name}`,
			bucketName,
		};
	};

const parseSelectStatement = statement =>
	new Parser().parse(dependencies.lodash.flow(removeUnsupportedFunctions, removeDbNameFromFullColumnName)(statement));

const removeUnsupportedFunctions = statement => {
	return statement.replace(/\s+WITH\s+CHECK\s+OPTION(\s+|$)/gim, ' ').replace(/\(TITLE\s+'.*?'\)\s*/g, ' ');
};

const removeDbNameFromFullColumnName = statement => {
	return statement.replace(/[`'"][\s\w]+?[`'"]\.([`'"][\s\w]+?[`'"]\.[`'"][\s\w]+?[`'"])/g, '$1');
};

const getColumns = table => {
    const tableProperties = dependencies.lodash.get(table, 'validation.jsonSchema.properties', {});

    if (dependencies.lodash.isEmpty(tableProperties)) {
        return [];
    }

    return Object.values(tableProperties);
};

const setViewColumnTableName = tablesData => columnData => {
	const table = tablesData.find(tableData => tableData.as === columnData.tableName);
	if (!table) {
		return columnData;
	}
	return {
		...columnData,
		tableName: table.table || columnData.tableName,
	};
};

const getViewColumnsData = (columns, tables, selectedTables, views) => {
	let columnsData = [];
	if (columns === '*') {
		columnsData = getAllColumns(tables, selectedTables);
	} else {
		columnsData = columns.reduce((acc, column) => {
			if (dependencies.lodash.get(column, 'expr.column') === '*') {
				const columnsData = getAllColumns(tables, [{ table: column.expr.table }]);
				return [...acc, ...columnsData];
			}
			const columnData = getColumnDataFromAst(column);
			return [...acc, columnData];
		}, []);
	}
	return columnsData.map(setViewColumnTableName(selectedTables)).filter(filterViewToViewColumn(views));
};

const filterViewToViewColumn =
	(views = []) =>
	column => {
		const refViews = views.find(view => view.name === column.tableName);
		return !refViews;
	};


module.exports = { getViewInfoFromAsSelect };