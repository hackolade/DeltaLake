const { dependencies } = require('../appDependencies');

const getColumnDataFromAst = columnAst => {
	const { expression, data } = getColumnRefExpression(dependencies.lodash.get(columnAst, 'expr', {}));

	return {
		name: dependencies.lodash.get(expression, 'column', ''),
		tableName: dependencies.lodash.get(expression, 'table', ''),
		alias: columnAst.as || '',
		data,
	};
};

const getColumnRefExpression = expression => {
	switch (expression.type) {
		case 'column_ref':
			return { expression, data: {} };
		default:
			return { expression: {}, data: {} };
	}
};

const setTableName = (namesMap, name) => columnData => {
	const tableName = columnData.tableName || name;
	const columnName = columnData.name || columnData.alias;
	if (dependencies.lodash.get(namesMap, dependencies.lodash.toLower(tableName), []).includes(dependencies.lodash.toLower(columnName))) {
		return {
			...columnData,
			tableName,
		};
	}

	const sourceTableName = Object.keys(namesMap).find(tableName =>
		dependencies.lodash.get(namesMap, tableName, []).includes(dependencies.lodash.toLower(columnName)),
	);

	return {
		...columnData,
		tableName: sourceTableName || tableName,
	};
};

const getDefaultTableName = selectAst => {
	const defaultTable = dependencies.lodash.first(dependencies.lodash.get(selectAst, 'from'));

	return dependencies.lodash.get(defaultTable, 'table', '');
};

const setTableAliases = (selectAst, tables) => {
	const fromTables = dependencies.lodash.get(selectAst, 'from', []);

	return tables.map(table => {
		const tableAstData = fromTables.find(tableData => tableData.table === table.name);
		if (!tableAstData) {
			return table;
		}

		return { ...table, name: tableAstData.as || tableAstData.table };
	});
};

module.exports = { getColumnDataFromAst, setTableName, getDefaultTableName, setTableAliases };
