'use strict'

const {
	buildStatement,
	getName,
	getTab,
	indentString,
	replaceSpaceWithUnderscore,
	commentDeactivatedInlineKeys,
	removeRedundantTrailingCommaFromStatement,
	encodeStringLiteral
} = require('./generalHelper');
const { getColumnsStatement, getColumnStatement, getColumns } = require('./columnHelper');
const keyHelper = require('./keyHelper');
const { dependencies } = require('./appDependencies');

let _;
const setDependencies = ({ lodash }) => _ = lodash;

const getCreateStatement = ({
	dbName, tableName, isTemporary, isExternal, using, likeStatement, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
	clusteredKeys, sortedKeys, numBuckets, skewedStatement, rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement,
	isActivated
}) => {
	const temporary = isTemporary ? 'TEMPORARY' : '';
	const external = isExternal ? 'EXTERNAL' : '';
	const tempExtStatement = ' ' + [temporary, external].filter(d => d).map(item => item + ' ').join('');
	const fullTableName = dbName ? `${dbName}.${tableName}` : tableName;

	if (using && likeStatement) {
		return getCreateLikeStatement({
			tempExtStatement, fullTableName, using, likeStatement, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
			clusteredKeys, sortedKeys, numBuckets, skewedStatement, rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement,
			isActivated
		})
	}

	if (using) {
		return getCreateUsingStatement({
			tempExtStatement, fullTableName, using, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
			clusteredKeys, sortedKeys, numBuckets, skewedStatement, rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement,
			isActivated
		})
	}

	return getCreateHiveStatement({
		tempExtStatement, fullTableName, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
		rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement, isActivated
	});
};

const getCreateUsingStatement = ({
	tempExtStatement, fullTableName, using, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
	clusteredKeys, sortedKeys, numBuckets, skewedStatement, rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement,
	isActivated
}) => {
	return buildStatement(`CREATE${tempExtStatement}TABLE IF NOT EXISTS ${fullTableName} (`, isActivated)
		(columnStatement, columnStatement + (primaryKeyStatement ? ',' : ''))
		(true, ')')
		(using, `USING ${getCorrectUsing(using)}`)
		(partitionedByKeys, `PARTITIONED BY (${partitionedByKeys})`)
		(clusteredKeys, `CLUSTERED BY (${clusteredKeys})`)
		(sortedKeys && clusteredKeys, `SORTED BY (${sortedKeys})`)
		(numBuckets && clusteredKeys, `INTO ${numBuckets} BUCKETS`)
		(location, `LOCATION '${location}'`)
		(comment, `COMMENT '${encodeStringLiteral(comment)}'`)
		(tableProperties, `TBLPROPERTIES ${tableProperties}`)
		(selectStatement, `AS ${selectStatement}`)
		(true, ';')
		();
}

const getCreateHiveStatement = ({
	tempExtStatement, fullTableName, columnStatement, primaryKeyStatement, foreignKeyStatement, comment, partitionedByKeys,
	rowFormatStatement, storedAsStatement, location, tableProperties, selectStatement, isActivated
}) => {
	return buildStatement(`CREATE${tempExtStatement}TABLE IF NOT EXISTS ${fullTableName} (`, isActivated)
		(columnStatement, columnStatement + (primaryKeyStatement ? ',' : ''))
		(primaryKeyStatement, primaryKeyStatement)
		(foreignKeyStatement, foreignKeyStatement)
		(true, ')')
		(comment, `COMMENT '${encodeStringLiteral(comment)}'`)
		(partitionedByKeys, `PARTITIONED BY (${partitionedByKeys})`)
		(rowFormatStatement, `ROW FORMAT ${rowFormatStatement}`)
		(storedAsStatement, storedAsStatement)
		(location, `LOCATION '${location}'`)
		(tableProperties, `TBLPROPERTIES ${tableProperties}`)
		(selectStatement, `AS ${selectStatement}`)
		(true, ';')
		();
}

const getCreateLikeStatement = ({
	tempExtStatement, fullTableName, using, columnStatement, primaryKeyStatement, foreignKeyStatement,
	rowFormatStatement, storedAsStatement, location, tableProperties, isActivated
}) => {
	return buildStatement(`CREATE${tempExtStatement}TABLE IF NOT EXISTS ${fullTableName} (`, isActivated)
		(columnStatement, columnStatement + (primaryKeyStatement ? ',' : ''))
		(primaryKeyStatement, primaryKeyStatement)
		(foreignKeyStatement, foreignKeyStatement)
		(true, ')')
		(using, `USING '${getCorrectUsing(using)}'`)
		(rowFormatStatement, `ROW FORMAT ${rowFormatStatement}`)
		(storedAsStatement, storedAsStatement)
		(tableProperties, `TBLPROPERTIES ${tableProperties}`)
		(location, `LOCATION '${location}'`)
		(true, ';')
		();
}

const getClusteringKeys = (clusteredKeys, deactivatedColumnNames, isParentItemActivated) => {
	if (!Array.isArray(clusteredKeys) || !clusteredKeys.length) {
		return '';
	}
	if (!isParentItemActivated) {
		return clusteredKeys.join(', ');
	}
	const { keysString } = commentDeactivatedInlineKeys(clusteredKeys, deactivatedColumnNames);
	return keysString;
};

const getSortedKeys = (sortedKeys, deactivatedColumnNames, isParentItemActivated) => {
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

const getPartitionKeyStatement = (keys, isParentActivated) => {
	const getKeysStatement = (keys) => keys.map(getColumnStatement).join(',');

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

const getSkewedKeyStatement = (skewedKeys, skewedOn, asDirectories, deactivatedColumnNames, isParentItemActivated) => {
	const getStatement = (keysString) => `SKEWED BY (${keysString}) ON ${skewedOn} ${asDirectories ? 'STORED AS DIRECTORIES' : ''}`;

	if (!Array.isArray(skewedKeys) || !skewedKeys.length) {
		return '';
	}

	if (!isParentItemActivated) {
		return getStatement(skewedKeys.join(', '));
	}

	const { isAllKeysDeactivated, keysString } = commentDeactivatedInlineKeys(skewedKeys, deactivatedColumnNames);
	if (isAllKeysDeactivated) {
		return '-- ' + getStatement(keysString);
	}
	return getStatement(keysString);
};

const getRowFormat = (tableData) => {
	if (tableData.storedAsTable !== 'textfile') {
		return '';
	}

	if (tableData.rowFormat === 'delimited') {
		return buildStatement(`DELIMITED`)
			(tableData.fieldsTerminatedBy, `FIELDS TERMINATED BY '${tableData.fieldsTerminatedBy}'`)
			(tableData.fieldsescapedBy, `ESCAPED BY '${tableData.fieldsescapedBy}'`)
			(tableData.collectionItemsTerminatedBy, `COLLECTION ITEMS TERMINATED BY '${tableData.collectionItemsTerminatedBy}'`)
			(tableData.mapKeysTerminatedBy, `MAP KEYS TERMINATED BY '${tableData.mapKeysTerminatedBy}'`)
			(tableData.linesTerminatedBy, `LINES TERMINATED BY '${tableData.linesTerminatedBy}'`)
			(tableData.nullDefinedAs, `NULL DEFINED AS '${tableData.nullDefinedAs}'`)
			();
	} else if (tableData.rowFormat === 'SerDe') {
		return buildStatement(`SERDE '${tableData.serDeLibrary}'`)
			(tableData.serDeProperties, `WITH SERDEPROPERTIES (${tableData.serDeProperties})`)
			();
	}
};

const getLikeStatement = (like) => {
	if (!like) {
		return;
	}
}

const getStoredAsStatement = (tableData) => {
	if (!tableData.storedAsTable) {
		return '';
	}

	if (tableData.storedAsTable === 'input/output format') {
		return `STORED AS INPUTFORMAT '${tableData.inputFormatClassname}' OUTPUTFORMAT '${tableData.outputFormatClassname}'`;
	}

	return `STORED AS ${tableData.storedAsTable.toUpperCase()}`;
};

const getTableStatement = (containerData, entityData, jsonSchema, definitions, areColumnConstraintsAvailable) => {
	setDependencies(dependencies);

	const dbName = replaceSpaceWithUnderscore(getName(getTab(0, containerData)));
	const tableData = getTab(0, entityData);
	const container = getTab(0, containerData);
	const isTableActivated = tableData.isActivated && (typeof container.isActivated === 'boolean' ? container.isActivated : true);
	const tableName = replaceSpaceWithUnderscore(getName(tableData));
	const { columns, deactivatedColumnNames } = getColumns(jsonSchema, areColumnConstraintsAvailable, definitions);
	const keyNames = keyHelper.getKeyNames(tableData, jsonSchema, definitions);
	let tableStatement = getCreateStatement({
		dbName,
		tableName,
		isTemporary: tableData.temporaryTable,
		isExternal: tableData.externalTable,
		using: tableData.using,
		likeStatement: getLikeStatement(tableData.like),
		columnStatement: getColumnsStatement(removePartitions(columns, keyNames.compositePartitionKey), isTableActivated),
		comment: tableData.description,
		partitionedByKeys: getPartitionKeyStatement(getPartitionsKeys(columns, keyNames.compositePartitionKey, isTableActivated)),
		clusteredKeys: getClusteringKeys(keyNames.compositeClusteringKey, deactivatedColumnNames, isTableActivated),
		sortedKeys: getSortedKeys(keyNames.sortedByKey, deactivatedColumnNames, isTableActivated),
		numBuckets: tableData.numBuckets,
		skewedStatement: getSkewedKeyStatement(keyNames.skewedby, tableData.skewedOn, tableData.skewStoredAsDir, deactivatedColumnNames, isTableActivated),
		rowFormatStatement: getRowFormat(tableData),
		storedAsStatement: getStoredAsStatement(tableData),
		location: tableData.location,
		tableProperties: tableData.tableProperties,
		selectStatement: '',
		isActivated: isTableActivated,
	});

	const constraintsStatements = Object.keys(columns).map(colName => ({ colName: colName.replaceAll('`', ''), ...columns[colName] })).filter(column => column.constraints.check).map(column => `ALTER TABLE ${tableName} ADD CONSTRAINT \`${column.colName}_constraint\` CHECK (${column.constraints.check})`).join(';\n')
	if (!_.isEmpty(constraintsStatements)) {
		tableStatement = tableStatement + `USE ${dbName};\n\n` + constraintsStatements + ';\n';
	}
	return removeRedundantTrailingCommaFromStatement(tableStatement);
};

const getTableAlterStatements = (containerData, entityData, jsonSchema, definitions, foreignKeyStatement, areColumnConstraintsAvailable, areForeignPrimaryKeyConstraintsAvailable) => {
	setDependencies(dependencies);
	let tableStatements = []

	const dbName = replaceSpaceWithUnderscore(getName(getTab(0, containerData)));
	const tableData = getTab(0, entityData);
	const container = getTab(0, containerData);
	const isTableActivated = tableData.isActivated && (typeof container.isActivated === 'boolean' ? container.isActivated : true);
	const tableName = replaceSpaceWithUnderscore(getName(tableData));
	const { columns, deactivatedColumnNames } = getColumns(jsonSchema, areColumnConstraintsAvailable, definitions);
	const keyNames = keyHelper.getKeyNames(tableData, jsonSchema, definitions);
	const fullTableName = dbName ? `${dbName}.${tableName}` : tableName;

	if (columns) {
		tableStatements.push(`ALTER TABLE ${fullTableName} ADD COLUMNS (${getColumnsStatement(removePartitions(columns, keyNames.compositePartitionKey), isTableActivated)});\n\n`)
	}

	if (tableData.tableProperties) {
		tableStatements.push(`ALTER TABLE ${fullTableName} SET TBLPROPERTIES (${tableData.tableProperties});\n\n`)
	}
	if (tableData.serDeLibrary) {
		tableStatements.push(`ALTER TABLE ${fullTableName} SET SERDE '${tableData.serDeLibrary}'${tableData.serDeProperties ? `WITH SERDEPROPERTIES (${tableData.serDeProperties})` : ''};\n\n`)
	} else if (tableData.serDeProperties) {
		tableStatements.push(`ALTER TABLE ${fullTableName} SET SERDEPROPERTIES (${tableData.serDeProperties});\n\n`)
	}
	if (tableData.location) {
		tableStatements.push(`ALTER TABLE ${fullTableName} SET LOCATION '${tableData.location}';\n\n`)
	}

	return tableStatements;
};

const getCorrectUsing = using => {
	switch (using) {
		case 'delta':
			return 'DELTA'
		case 'textfile':
			return 'TEXT'
		case 'delta':
			return 'DELTA'
		case 'CSVfile':
			return 'CSV'
		case 'JSONfile':
			return 'JSON'
		case 'JDBC':
			return 'JDBC'
		case 'Parquet':
			return 'PARQUET'
		case 'ORC':
			return 'ORC'
		case 'LIBSVM':
			return 'LIBSVM'
		default:
			return '';
	}
}


module.exports = {
	getTableStatement,
	getTableAlterStatements
};
