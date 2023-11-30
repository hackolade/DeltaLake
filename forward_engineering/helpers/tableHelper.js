'use strict'

const {
	buildStatement,
	getName,
	getTab,
	replaceSpaceWithUnderscore,
	commentDeactivatedInlineKeys,
	encodeStringLiteral,
	prepareName,
	getDifferentItems,
	getFullEntityName
} = require('../utils/general');
const { getColumnsStatement, getColumns } = require('./columnHelper');
const keyHelper = require('./keyHelper');
const {getCheckConstraintsScriptsOnColumnLevel, getCheckConstraintsScriptsOnTableLevel, buildConstraints } = require("./entityHelpers/checkConstraintHelper");
const constraintHelper = require('./constrainthelper');

const getCreateStatement = (_) => ({
	dbName, tableName, isTemporary, isExternal, using, likeStatement, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
	clusteredKeys, sortedKeys, numBuckets, skewedStatement, rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement,
	isActivated, tableOptions, orReplace, ifNotExists,
}) => {
	const temporary = isTemporary ? 'TEMPORARY' : '';
	const external = isExternal ? 'EXTERNAL' : '';
	const orReplaceStatement = orReplace ? 'OR REPLACE' : '';
	const isNotExistsStatement = ifNotExists ? ' IF NOT EXISTS' : '';
	const tempExtStatement = ' ' + [orReplaceStatement, temporary, external].filter(d => d).map(item => item + ' ').join('');
	const fullTableName = dbName ? `${dbName}.${tableName}` : tableName;

	if (using && likeStatement) {
		return getCreateLikeStatement(_)({
			tempExtStatement, fullTableName, using, likeStatement, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
			clusteredKeys, sortedKeys, numBuckets, skewedStatement, rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement,
			isActivated, tableOptions, isNotExistsStatement,
		})
	}

	if (using) {
		return getCreateUsingStatement(_)({
			tempExtStatement, fullTableName, using, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
			clusteredKeys, sortedKeys, numBuckets, skewedStatement, rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement,
			isActivated, tableOptions, isNotExistsStatement,
		})
	}

	return getCreateHiveStatement(_)({
		tempExtStatement, fullTableName, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
		rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement, isActivated, tableOptions, isNotExistsStatement,
	});
};

const getCreateUsingStatement = (_) => ({
	tempExtStatement, fullTableName, using, columnStatement, primaryKeyStatement, comment, partitionedByKeys,
	clusteredKeys, sortedKeys, numBuckets, location, tableProperties, selectStatement,
	isActivated, tableOptions, isNotExistsStatement, rowFormatStatement, storedAsStatement,
}) => {
	return buildStatement(`CREATE${tempExtStatement}TABLE${isNotExistsStatement} ${fullTableName} (`, isActivated)
		(columnStatement, columnStatement + (primaryKeyStatement ? ',' : ''))
		(primaryKeyStatement, primaryKeyStatement)
		(true, ')')
		(using, `${getUsing(using)}`)
		(rowFormatStatement, `ROW FORMAT ${rowFormatStatement}`)
		(storedAsStatement, storedAsStatement)
		(partitionedByKeys, `PARTITIONED BY (${partitionedByKeys})`)
		(clusteredKeys, `CLUSTERED BY (${clusteredKeys})`)
		(sortedKeys && clusteredKeys, `SORTED BY (${sortedKeys})`)
		(numBuckets && clusteredKeys, `INTO ${numBuckets} BUCKETS`)
		(location, `LOCATION '${location}'`)
		(comment, `COMMENT '${encodeStringLiteral(comment)}'`)
		(tableProperties, `TBLPROPERTIES (${getTablePropertiesClause(_)(tableProperties)})`)
		(tableOptions, `OPTIONS ${tableOptions}`)
		(selectStatement, `AS ${selectStatement}`)
		(true, ';')
		();
}

const getCreateHiveStatement = (_) => ({
	tempExtStatement, fullTableName, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
	rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement, isActivated, tableOptions, isNotExistsStatement,
}) => {
	const isAddBrackets = columnStatement || primaryKeyStatement || foreignKeyStatement;
	return buildStatement(`CREATE${tempExtStatement}TABLE${isNotExistsStatement} ${fullTableName} `, isActivated)
		(isAddBrackets, '(')
		(columnStatement, columnStatement + (primaryKeyStatement ? ',' : ''))
		(primaryKeyStatement, primaryKeyStatement)
		(foreignKeyStatement, foreignKeyStatement)
		(isAddBrackets, ')')
		(comment, `COMMENT '${encodeStringLiteral(comment)}'`)
		(partitionedByKeys, `PARTITIONED BY (${partitionedByKeys})`)
		(rowFormatStatement, `ROW FORMAT ${rowFormatStatement}`)
		(storedAsStatement, storedAsStatement)
		(location, `LOCATION '${location}'`)
		(tableProperties, `TBLPROPERTIES (${getTablePropertiesClause(_)(tableProperties)})`)
		(tableOptions, `OPTIONS ${tableOptions}`)
		(selectStatement, `AS ${selectStatement}`)
		(true, ';')
		();
}

const getCreateLikeStatement = (_) => ({
	tempExtStatement, fullTableName, using, columnStatement, primaryKeyStatement, foreignKeyStatement,
	rowFormatStatement, storedAsStatement, location, tableProperties, isActivated, isNotExistsStatement,
	tableOptions, likeStatement,
}) => {
	return buildStatement(`CREATE${tempExtStatement}TABLE${isNotExistsStatement} ${fullTableName} ${likeStatement} (`, isActivated)
		(columnStatement, columnStatement + (primaryKeyStatement ? ',' : ''))
		(primaryKeyStatement, primaryKeyStatement)
		(foreignKeyStatement, foreignKeyStatement)
		(true, ')')
		(using, `${getUsing(using)}`)
		(rowFormatStatement, `ROW FORMAT ${rowFormatStatement}`)
		(storedAsStatement, storedAsStatement)
		(tableProperties, `TBLPROPERTIES (${getTablePropertiesClause(_)(tableProperties)})`)
		(tableOptions, `OPTIONS ${tableOptions}`)
		(location, `LOCATION '${location}'`)
		(true, ';')
		();
}

const getClusteringKeys = (_) => (clusteredKeys, deactivatedColumnNames, isParentItemActivated) => {
	if (!Array.isArray(clusteredKeys) || !clusteredKeys.length) {
		return '';
	}
	if (!isParentItemActivated) {
		return clusteredKeys.join(', ');
	}
	const { keysString } = commentDeactivatedInlineKeys(_)(clusteredKeys, deactivatedColumnNames);
	return keysString;
};

const getSortedKeys = (_) => (sortedKeys, deactivatedColumnNames, isParentItemActivated) => {
	const getSortKeysStatement = keys => keys.map(sortedKey => `${sortedKey.name} ${sortedKey.type}`).join(', ');

	if (!Array.isArray(sortedKeys) || !sortedKeys.length) {
		return '';
	}
	const [activatedKeys, deactivatedKeys] = _.partition(sortedKeys, keyData => !deactivatedColumnNames.has(keyData.name));
	if (!isParentItemActivated || deactivatedKeys.length === 0) {
		return getSortKeysStatement(sortedKeys);
	}
	if (activatedKeys.length === 0) {
		return `/* ${getSortKeysStatement(deactivatedKeys)} */`;
	}

	return `${getSortKeysStatement(activatedKeys)} /*, ${getSortKeysStatement(deactivatedKeys)} */`;
};

const getPartitionKeyStatement = (_) => (keys, isParentActivated, using) => {
	const getKeysStatement = (keys) => {
		if(using === 'Hive'){
			return keys.map(key => `${key.name} ${key.type}`).join(', ');
		}
		return keys.map(key => key.name).join(', ');
	}

	if (!Array.isArray(keys) || !keys.length) {
		return '';
	}

	const [activatedKeys, deactivatedKeys] = _.partition(keys, key => key.isActivated);
	if (!isParentActivated || deactivatedKeys.length === 0) {
		return getKeysStatement(keys);
	}
	if (activatedKeys.length === 0) {
		return `/* ${getKeysStatement(keys)} */`;
	}

	return `${getKeysStatement(activatedKeys)} /*, ${getKeysStatement(activatedKeys)} */`;
};

const getPartitionsKeys = (columns, partitions) => {
	return partitions.map(keyName => {
		return Object.assign({}, columns[keyName] || { type: 'string' }, { name: keyName });
	}).filter(key => key);
};

const removePartitions = (columns, partitions) => {
	return partitions.reduce((columns, keyName) => {
		delete columns[keyName];

		return columns;
	}, Object.assign({}, columns));
};

const getTableColumnsStatement = (columns, using, partitionKeys) => {
	if (using === 'Hive') {
		return removePartitions(columns, partitionKeys)
	}
	return columns;
}

const getSkewedKeyStatement = (_) => (skewedKeys, skewedOn, asDirectories, deactivatedColumnNames, isParentItemActivated) => {
	const getStatement = (keysString) => `SKEWED BY (${keysString}) ON ${skewedOn} ${asDirectories ? 'STORED AS DIRECTORIES' : ''}`;

	if (!Array.isArray(skewedKeys) || !skewedKeys.length) {
		return '';
	}

	if (!isParentItemActivated) {
		return getStatement(skewedKeys.join(', '));
	}

	const { isAllKeysDeactivated, keysString } = commentDeactivatedInlineKeys(_)(skewedKeys, deactivatedColumnNames);
	if (isAllKeysDeactivated) {
		return '-- ' + getStatement(keysString);
	}
	return getStatement(keysString);
};

const getRowFormat = (tableData) => {
	if (tableData.rowFormat === 'delimited') {
		return buildStatement(`DELIMITED`)
			(tableData.fieldsTerminatedBy, `FIELDS TERMINATED BY '${tableData.fieldsTerminatedBy}'`)
			(tableData.fieldsescapedBy, `ESCAPED BY '${tableData.fieldsescapedBy}'`)
			(tableData.collectionItemsTerminatedBy, `COLLECTION ITEMS TERMINATED BY '${tableData.collectionItemsTerminatedBy}'`)
			(tableData.mapKeysTerminatedBy, `MAP KEYS TERMINATED BY '${tableData.mapKeysTerminatedBy}'`)
			(tableData.linesTerminatedBy, `LINES TERMINATED BY '${tableData.linesTerminatedBy}'`)
			(tableData.nullDefinedAs, `NULL DEFINED AS '${tableData.nullDefinedAs}'`)
			();
	}
	if (tableData.rowFormat === 'SerDe') {
		return buildStatement(`SERDE '${tableData.serDeLibrary}'`)
			(tableData.serDeProperties, `WITH SERDEPROPERTIES ${tableData.serDeProperties}`)
			();
	}

	return '';
};

const getLikeStatement = (likeTableData) => {
	const like = getName(likeTableData);

	if (!like) {
		return;
	}

	return ` LIKE ${prepareName(like)}`;
}

const getStoredAsStatement = (tableData) => {
	if (!tableData.storedAsTable) {
		return '';
	}

	if (tableData.storedAsTable === 'input/output format') {
		let statement = [];

		statement.push(`STORED AS INPUTFORMAT '${tableData.inputFormatClassname}'`);
		statement.push(`OUTPUTFORMAT '${tableData.outputFormatClassname}'`);

		return statement.join('\n');
	}

	return `STORED AS ${tableData.storedAsTable.toUpperCase()}`;
};

/**
 * @return {(
 * 	containerData: any,
 * 	entityData: any,
 * 	entityJsonSchema: any,
 * 	definitions: any,
 * 	arePkFkConstraintsAvailable: boolean,
 * 	areNotNullConstraintsAvailable: boolean,
 * 	likeTableData: any,
 * ) => string}
 * */
const getTableStatement = (app) => (
	containerData,
	entityData,
	entityJsonSchema,
	definitions,
	arePkFkConstraintsAvailable,
	areNotNullConstraintsAvailable,
	likeTableData,
) => {
	const _ = app.require('lodash');
	const ddlProvider = require('../ddlProvider/ddlProvider')(app);

	const dbName = replaceSpaceWithUnderscore(prepareName(getName(getTab(0, containerData))));
	const tableData = getTab(0, entityData);
	const container = getTab(0, containerData);
	const isTableActivated = tableData.isActivated && (typeof container.isActivated === 'boolean' ? container.isActivated : true);
	const tableName = replaceSpaceWithUnderscore(prepareName(getName(tableData)));
	const fullTableName = getFullEntityName(dbName, tableName);
	const { columns, deactivatedColumnNames } = getColumns(entityJsonSchema, arePkFkConstraintsAvailable, areNotNullConstraintsAvailable, definitions);
	const keyNames = keyHelper.getKeyNames(tableData, entityJsonSchema, definitions);
	const tableColumns = getTableColumnsStatement(columns, tableData.using, keyNames.compositePartitionKey);
	const primaryKeyStatement = arePkFkConstraintsAvailable
		? constraintHelper.getPrimaryKeyStatement(_)(entityJsonSchema, keyNames.primaryKeys, deactivatedColumnNames, isTableActivated)
		: '';
	let tableStatement = getCreateStatement(_)({
		dbName,
		tableName,
		isTemporary: tableData.temporaryTable,
		isExternal: tableData.externalTable,
		orReplace: tableData.orReplace,
		ifNotExists: tableData.tableIfNotExists,
		using: tableData.using,
		primaryKeyStatement,
		likeStatement: getLikeStatement(getTab(0, likeTableData)),
		columnStatement: getColumnsStatement(tableColumns, isTableActivated),
		comment: tableData.description,
		partitionedByKeys: getPartitionKeyStatement(_)(getPartitionsKeys(columns, keyNames.compositePartitionKey), isTableActivated, tableData.using),
		clusteredKeys: getClusteringKeys(_)(keyNames.compositeClusteringKey, deactivatedColumnNames, isTableActivated),
		sortedKeys: getSortedKeys(_)(keyNames.sortedByKey, deactivatedColumnNames, isTableActivated),
		numBuckets: tableData.numBuckets,
		skewedStatement: getSkewedKeyStatement(_)(keyNames.skewedby, tableData.skewedOn, tableData.skewStoredAsDir, deactivatedColumnNames, isTableActivated),
		rowFormatStatement: getRowFormat(tableData),
		storedAsStatement: getStoredAsStatement(tableData),
		location: tableData.location,
		tableProperties: tableData.tableProperties,
		selectStatement: '',
		isActivated: isTableActivated,
		tableOptions: tableData.tableOptions,
	});

	const statementsDelimiter = ';\n';

	const constraintsStatementsOnColumns = getCheckConstraintsScriptsOnColumnLevel(ddlProvider)(columns, fullTableName).join('\n');
	const constraintsStatementsOnTable = getCheckConstraintsScriptsOnTableLevel(ddlProvider)(entityJsonSchema, fullTableName).join('\n');
	const constraintsStatements = buildConstraints(constraintsStatementsOnTable, constraintsStatementsOnColumns);

	if (!_.isEmpty(constraintsStatements)) {
		tableStatement = tableStatement + `USE ${dbName};\n\n` + constraintsStatements;
	}

	return tableStatement;
};

const getUsing = using => {
	if (using === 'delta') {
		return '';
	}

	return `USING ${getCorrectUsing(using)}`;
};

const getCorrectUsing = using => {
	switch (using) {
		case 'CSVfile':
			return 'CSV'
		case 'Hive':
			return 'HIVE'
		case 'JSONfile':
			return 'JSON'
		case 'JDBC':
			return 'JDBC'
		case 'LIBSVM':
			return 'LIBSVM'
		case 'ORC':
			return 'ORC'
		case 'Parquet':
			return 'PARQUET'
		case 'textfile':
			return 'TEXT'
		default:
			return 'DELTA';
	}
}

/**
 * @return {(tableProperties: Array<{
 *      propertyKey: string,
 *      propertyValue: any | undefined
 * }>) => string}
 * */
const getTablePropertiesClause = (_) => tableProperties => {
	const isText = _.overEvery([value => _.isNaN(_.toNumber(value)), value => value !== 'true' && value !== 'false']);
	const tablePropertyStatements = (tableProperties || []).map(({ propertyKey, propertyValue = undefined }) => {
		let value = propertyValue;
		if (value === undefined) {
			return propertyKey;
		}
		if (isText(value)) {
			value = `'${adjustPropertyValue(value)}'`;
		}
		return `${adjustPropertyKey(propertyKey)} = ${value}`;
	});
	return tablePropertyStatements.join(', ');
}

const hydrateTableProperties = (_) => ({new: newItems, old: oldItems}, name) => {
	const preparePropertiesName = properties => _.map(properties, ({propertyKey}) => propertyKey).join(', ');
	const {add, drop} = getDifferentItems(_)(newItems, oldItems);
	const dataProperties = {
		add: getTablePropertiesClause(_)(add),
		drop: preparePropertiesName(drop),
	};
	return {dataProperties, name};
};

const adjustPropertyKey = (propertyKey) => {
	if (/^\s*\(/.test(propertyKey) && !/\)\s*$/.test(propertyKey)) {
		return propertyKey.replace(/^\s*\(([\s\S]+)/, '$1');
	} else {
		return propertyKey;
	}
};

const adjustPropertyValue = (propertyValue) => {
	if (/\)\s*$/.test(propertyValue) && !/^\s*\(/.test(propertyValue)) {
		return propertyValue.replace(/([\s\S]+)\)\s*$/, '$1');
	} else {
		return propertyValue;
	}
};


module.exports = {
	getTableStatement,
	getTablePropertiesClause,
	hydrateTableProperties,
};
