const _ = require('lodash');
const {
	buildStatement,
	getName,
	getTab,
	replaceSpaceWithUnderscore,
	commentDeactivatedInlineKeys,
	encodeStringLiteral,
	prepareName,
	getDifferentItems,
	getFullEntityName,
	getDBVersionNumber,
	generateFullEntityName,
} = require('../utils/general');
const { getColumnsStatement, getColumns } = require('./columnHelper');
const keyHelper = require('./keyHelper');
const {
	getCheckConstraintsScriptsOnColumnLevel,
	getCheckConstraintsScriptsOnTableLevel,
	buildConstraints,
} = require('./entityHelpers/checkConstraintHelper');
const constraintHelper = require('./constrainthelper');
const { getColumnTagsStatement } = require('./unityTagsHelper');
const { Runtime } = require('../enums/runtime');
const { ScheduleTypesEnum } = require('../enums/scheduleTypes');

const getCreateStatement = ({
	fullTableName,
	isTemporary,
	isExternal,
	using,
	likeStatement,
	columnStatement,
	primaryKeyStatement,
	foreignKeyStatement,
	comment,
	partitionedByKeys,
	clusteredKeys,
	sortedKeys,
	numBuckets,
	skewedStatement,
	rowFormatStatement,
	storedAsStatement,
	location,
	tableProperties,
	selectStatement,
	isActivated,
	tableOptions,
	orReplace,
	ifNotExists,
	isStreaming,
	orRefresh,
	scheduleGroup,
}) => {
	const temporary = isTemporary ? 'TEMPORARY' : '';
	const external = isExternal ? 'EXTERNAL' : '';
	const streaming = isStreaming ? 'STREAMING' : '';

	let replaceRefreshStatement = '';

	if (isStreaming && orRefresh) {
		replaceRefreshStatement = 'OR REFRESH';
	} else if (orReplace && !isStreaming) {
		replaceRefreshStatement = 'OR REPLACE';
	}

	const scheduleClause = isStreaming ? getScheduleClause(scheduleGroup?.[0]) : '';

	const isNotExistsStatement = ifNotExists ? ' IF NOT EXISTS' : '';
	const modifiersStatement =
		' ' +
		[replaceRefreshStatement, temporary, external, streaming]
			.filter(d => d)
			.map(item => item + ' ')
			.join('');

	if (using && likeStatement) {
		return getCreateLikeStatement({
			modifiersStatement,
			fullTableName,
			using,
			likeStatement,
			columnStatement,
			primaryKeyStatement,
			foreignKeyStatement,
			comment,
			partitionedByKeys,
			clusteredKeys,
			sortedKeys,
			numBuckets,
			skewedStatement,
			rowFormatStatement,
			storedAsStatement,
			location,
			tableProperties,
			selectStatement,
			isActivated,
			tableOptions,
			isNotExistsStatement,
			scheduleClause,
		});
	}

	if (using) {
		return getCreateUsingStatement({
			modifiersStatement,
			fullTableName,
			using,
			columnStatement,
			primaryKeyStatement,
			foreignKeyStatement,
			comment,
			partitionedByKeys,
			clusteredKeys,
			sortedKeys,
			numBuckets,
			skewedStatement,
			rowFormatStatement,
			storedAsStatement,
			location,
			tableProperties,
			selectStatement,
			isActivated,
			tableOptions,
			isNotExistsStatement,
			scheduleClause,
		});
	}

	return getCreateHiveStatement({
		modifiersStatement,
		fullTableName,
		columnStatement,
		primaryKeyStatement,
		foreignKeyStatement,
		comment,
		partitionedByKeys,
		clusteredKeys,
		sortedKeys,
		numBuckets,
		rowFormatStatement,
		storedAsStatement,
		location,
		tableProperties,
		selectStatement,
		isActivated,
		tableOptions,
		isNotExistsStatement,
		scheduleClause,
	});
};

const getCreateUsingStatement = ({
	modifiersStatement,
	fullTableName,
	using,
	columnStatement,
	primaryKeyStatement,
	comment,
	partitionedByKeys,
	clusteredKeys,
	sortedKeys,
	numBuckets,
	location,
	tableProperties,
	selectStatement,
	isActivated,
	tableOptions,
	isNotExistsStatement,
	rowFormatStatement,
	storedAsStatement,
	scheduleClause,
}) => {
	return buildStatement(`CREATE${modifiersStatement}TABLE${isNotExistsStatement} ${fullTableName} (`, isActivated)(
		columnStatement,
		columnStatement + (primaryKeyStatement ? ',' : ''),
	)(primaryKeyStatement, primaryKeyStatement)(true, ')')(using, `${getUsing(using)}`)(
		rowFormatStatement,
		`ROW FORMAT ${rowFormatStatement}`,
	)(storedAsStatement, storedAsStatement)(partitionedByKeys, `PARTITIONED BY (${partitionedByKeys})`)(
		!numBuckets && clusteredKeys,
		`CLUSTER BY (${clusteredKeys})`,
	)(numBuckets && clusteredKeys, `CLUSTERED BY (${clusteredKeys})`)(
		numBuckets && sortedKeys && clusteredKeys,
		`SORTED BY (${sortedKeys})`,
	)(numBuckets && clusteredKeys, `INTO ${numBuckets} BUCKETS`)(location, `LOCATION '${location}'`)(
		comment,
		`COMMENT '${encodeStringLiteral(comment)}'`,
	)(checkTablePropertiesDefined(tableProperties), `TBLPROPERTIES (${getTablePropertiesClause(tableProperties)})`)(
		tableOptions,
		`OPTIONS ${tableOptions}`,
	)(scheduleClause, scheduleClause)(selectStatement, `AS ${selectStatement}`)(true, ';')();
};

const getCreateHiveStatement = ({
	modifiersStatement,
	fullTableName,
	columnStatement,
	primaryKeyStatement,
	foreignKeyStatement,
	comment,
	partitionedByKeys,
	clusteredKeys,
	sortedKeys,
	numBuckets,
	rowFormatStatement,
	storedAsStatement,
	location,
	tableProperties,
	selectStatement,
	isActivated,
	tableOptions,
	isNotExistsStatement,
	scheduleClause,
}) => {
	const isAddBrackets = columnStatement || primaryKeyStatement || foreignKeyStatement;
	return buildStatement(`CREATE${modifiersStatement}TABLE${isNotExistsStatement} ${fullTableName} `, isActivated)(
		isAddBrackets,
		'(',
	)(columnStatement, columnStatement + (primaryKeyStatement ? ',' : ''))(primaryKeyStatement, primaryKeyStatement)(
		foreignKeyStatement,
		foreignKeyStatement,
	)(isAddBrackets, ')')(comment, `COMMENT '${encodeStringLiteral(comment)}'`)(
		partitionedByKeys,
		`PARTITIONED BY (${partitionedByKeys})`,
	)(!numBuckets && clusteredKeys, `CLUSTER BY (${clusteredKeys})`)(
		numBuckets && clusteredKeys,
		`CLUSTERED BY (${clusteredKeys})`,
	)(numBuckets && sortedKeys && clusteredKeys, `SORTED BY (${sortedKeys})`)(
		numBuckets && clusteredKeys,
		`INTO ${numBuckets} BUCKETS`,
	)(rowFormatStatement, `ROW FORMAT ${rowFormatStatement}`)(storedAsStatement, storedAsStatement)(
		location,
		`LOCATION '${location}'`,
	)(checkTablePropertiesDefined(tableProperties), `TBLPROPERTIES (${getTablePropertiesClause(tableProperties)})`)(
		tableOptions,
		`OPTIONS ${tableOptions}`,
	)(scheduleClause, scheduleClause)(selectStatement, `AS ${selectStatement}`)(true, ';')();
};

const getCreateLikeStatement = ({
	modifiersStatement,
	fullTableName,
	using,
	columnStatement,
	primaryKeyStatement,
	foreignKeyStatement,
	rowFormatStatement,
	storedAsStatement,
	location,
	tableProperties,
	isActivated,
	isNotExistsStatement,
	tableOptions,
	likeStatement,
	scheduleClause,
}) => {
	return buildStatement(
		`CREATE${modifiersStatement}TABLE${isNotExistsStatement} ${fullTableName} ${likeStatement} (`,
		isActivated,
	)(columnStatement, columnStatement + (primaryKeyStatement ? ',' : ''))(primaryKeyStatement, primaryKeyStatement)(
		foreignKeyStatement,
		foreignKeyStatement,
	)(true, ')')(using, `${getUsing(using)}`)(rowFormatStatement, `ROW FORMAT ${rowFormatStatement}`)(
		storedAsStatement,
		storedAsStatement,
	)(checkTablePropertiesDefined(tableProperties), `TBLPROPERTIES (${getTablePropertiesClause(tableProperties)})`)(
		tableOptions,
		`OPTIONS ${tableOptions}`,
	)(location, `LOCATION '${location}'`)(scheduleClause, scheduleClause)(true, ';')();
};

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
	const [activatedKeys, deactivatedKeys] = _.partition(
		sortedKeys,
		keyData => !deactivatedColumnNames.has(keyData.name),
	);
	if (!isParentItemActivated || deactivatedKeys.length === 0) {
		return getSortKeysStatement(sortedKeys);
	}
	if (activatedKeys.length === 0) {
		return `/* ${getSortKeysStatement(deactivatedKeys)} */`;
	}

	return `${getSortKeysStatement(activatedKeys)} /*, ${getSortKeysStatement(deactivatedKeys)} */`;
};

const getPartitionKeyStatement = (keys, isParentActivated, using) => {
	const getKeysStatement = keys => {
		if (using === 'Hive') {
			return keys.map(key => `${key.name} ${key.type}`).join(', ');
		}
		return keys.map(key => key.name).join(', ');
	};

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
	return partitions
		.map(keyName => {
			return { ...(columns[keyName] || { type: 'string' }), name: keyName };
		})
		.filter(key => key);
};

const removePartitions = (columns, partitions) => {
	return partitions.reduce(
		(columns, keyName) => {
			delete columns[keyName];

			return columns;
		},
		{ ...columns },
	);
};

const getTableColumnsStatement = (columns, using, partitionKeys) => {
	if (using === 'Hive') {
		return removePartitions(columns, partitionKeys);
	}
	return columns;
};

const getSkewedKeyStatement = (skewedKeys, skewedOn, asDirectories, deactivatedColumnNames, isParentItemActivated) => {
	const getStatement = keysString =>
		`SKEWED BY (${keysString}) ON ${skewedOn} ${asDirectories ? 'STORED AS DIRECTORIES' : ''}`;

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

const getRowFormat = tableData => {
	if (tableData.rowFormat === 'delimited') {
		return buildStatement(`DELIMITED`)(
			tableData.fieldsTerminatedBy,
			`FIELDS TERMINATED BY '${tableData.fieldsTerminatedBy}'`,
		)(tableData.fieldsescapedBy, `ESCAPED BY '${tableData.fieldsescapedBy}'`)(
			tableData.collectionItemsTerminatedBy,
			`COLLECTION ITEMS TERMINATED BY '${tableData.collectionItemsTerminatedBy}'`,
		)(tableData.mapKeysTerminatedBy, `MAP KEYS TERMINATED BY '${tableData.mapKeysTerminatedBy}'`)(
			tableData.linesTerminatedBy,
			`LINES TERMINATED BY '${tableData.linesTerminatedBy}'`,
		)(tableData.nullDefinedAs, `NULL DEFINED AS '${tableData.nullDefinedAs}'`)();
	}
	if (tableData.rowFormat === 'SerDe') {
		return buildStatement(`SERDE '${tableData.serDeLibrary}'`)(
			tableData.serDeProperties,
			`WITH SERDEPROPERTIES ${tableData.serDeProperties}`,
		)();
	}

	return '';
};

const getLikeStatement = likeTableData => {
	const like = getName(likeTableData);

	if (!like) {
		return;
	}

	return ` LIKE ${prepareName(like)}`;
};

const getStoredAsStatement = tableData => {
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
 *  dbVersion: string,
 *	isCalledFromAlterScript: boolean,
 * ) => string}
 * */
const getTableStatement =
	app =>
	(
		containerData,
		entityData,
		entityJsonSchema,
		definitions,
		arePkFkConstraintsAvailable,
		areNotNullConstraintsAvailable,
		likeTableData,
		dbVersion,
		isCalledFromAlterScript = false,
	) => {
		const { getEntityTagsStatement } = require('../helpers/unityTagsHelper');

		const dbName = replaceSpaceWithUnderscore(prepareName(getName(getTab(0, containerData))));
		const tableData = getTab(0, entityData);
		const container = getTab(0, containerData);
		const isTableActivated =
			tableData.isActivated && (typeof container.isActivated === 'boolean' ? container.isActivated : true);
		const tableName = replaceSpaceWithUnderscore(prepareName(getName(tableData)));
		const fullTableName = isCalledFromAlterScript
			? generateFullEntityName({ entity: { role: tableData }, dbVersion })
			: getFullEntityName(dbName, tableName);
		const { columns, deactivatedColumnNames } = getColumns(entityJsonSchema, definitions, dbVersion);
		const keyNames = keyHelper.getKeyNames(tableData, entityJsonSchema, definitions);
		const tableColumns = getTableColumnsStatement(columns, tableData.using, keyNames.compositePartitionKey);
		const primaryKeyStatement = arePkFkConstraintsAvailable
			? constraintHelper.getPrimaryKeyStatement(
					entityJsonSchema,
					keyNames.primaryKeys,
					deactivatedColumnNames,
					isTableActivated,
				)
			: '';

		let tableStatement = getCreateStatement({
			fullTableName,
			isTemporary: tableData.temporaryTable,
			isExternal: tableData.externalTable,
			orReplace: tableData.orReplace,
			ifNotExists: tableData.tableIfNotExists,
			using: tableData.using,
			primaryKeyStatement,
			likeStatement: getLikeStatement(getTab(0, likeTableData)),
			columnStatement: getColumnsStatement(tableColumns, isTableActivated),
			comment: tableData.description,
			partitionedByKeys: getPartitionKeyStatement(
				getPartitionsKeys(columns, keyNames.compositePartitionKey),
				isTableActivated,
				tableData.using,
			),
			clusteredKeys: getClusteringKeys(keyNames.compositeClusteringKey, deactivatedColumnNames, isTableActivated),
			sortedKeys: getSortedKeys(keyNames.sortedByKey, deactivatedColumnNames, isTableActivated),
			numBuckets: tableData.numBuckets,
			skewedStatement: getSkewedKeyStatement(
				keyNames.skewedby,
				tableData.skewedOn,
				tableData.skewStoredAsDir,
				deactivatedColumnNames,
				isTableActivated,
			),
			rowFormatStatement: getRowFormat(tableData),
			storedAsStatement: getStoredAsStatement(tableData),
			location: tableData.location,
			tableProperties: tableData.tableProperties,
			selectStatement: '',
			isActivated: isTableActivated,
			tableOptions: tableData.tableOptions,
			isStreaming: tableData.streamingTable,
			scheduleGroup: tableData.scheduleGroup,
			orRefresh: tableData.orRefresh,
		});

		if (getDBVersionNumber(dbVersion) >= Runtime.MINIMUM_UNITY_TAGS_SUPPORT_VERSION) {
			const entityUnityTags = getEntityTagsStatement(entityJsonSchema, fullTableName);
			tableStatement = tableStatement + entityUnityTags;
		}

		const constraintsStatementsOnColumns = getCheckConstraintsScriptsOnColumnLevel(app)(
			columns,
			fullTableName,
		).join('\n');
		const constraintsStatementsOnTable = getCheckConstraintsScriptsOnTableLevel(app)(
			entityJsonSchema,
			fullTableName,
		).join('\n');
		const constraintsStatements = buildConstraints(constraintsStatementsOnTable, constraintsStatementsOnColumns);

		if (!_.isEmpty(constraintsStatements)) {
			tableStatement = tableStatement + `USE ${dbName};\n\n` + constraintsStatements;
		}

		if (getDBVersionNumber(dbVersion) >= Runtime.MINIMUM_UNITY_TAGS_SUPPORT_VERSION) {
			const columnsUnityTags = getColumnTagsStatement(entityJsonSchema.properties, fullTableName);
			tableStatement = [tableStatement, ...columnsUnityTags].join('\n');
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
			return 'CSV';
		case 'Hive':
			return 'HIVE';
		case 'JSONfile':
			return 'JSON';
		case 'JDBC':
			return 'JDBC';
		case 'LIBSVM':
			return 'LIBSVM';
		case 'ORC':
			return 'ORC';
		case 'Parquet':
			return 'PARQUET';
		case 'textfile':
			return 'TEXT';
		default:
			return 'DELTA';
	}
};

/**
 * @return {(tableProperties: Array<{
 *      propertyKey: string,
 *      propertyValue: any | undefined
 * }>) => string}
 * */
const getTablePropertiesClause = tableProperties => {
	const isText = _.overEvery([value => _.isNaN(_.toNumber(value)), value => value !== 'true' && value !== 'false']);
	const tablePropertyStatements = (tableProperties || [])
		.filter(({ propertyKey, propertyValue }) => propertyKey?.trim?.() && propertyValue?.trim?.())
		.map(({ propertyKey, propertyValue }) => {
			let value = propertyValue;
			if (isText(value)) {
				value = `'${adjustPropertyValue(value)}'`;
			}
			return `${adjustPropertyKey(propertyKey)} = ${value}`;
		});
	return tablePropertyStatements.join(', ');
};

const getDeleteTablePropertiesClause = tableProperties => {
	const tablePropertyStatements = (tableProperties || [])
		.filter(({ propertyKey }) => propertyKey?.trim?.())
		.map(({ propertyKey }) => adjustPropertyKey(propertyKey));

	return tablePropertyStatements.join(', ');
};

const checkTablePropertiesDefined = tableProperties => {
	return Boolean(
		tableProperties?.length &&
		tableProperties?.some(property => property.propertyKey?.trim?.() && property.propertyValue?.trim?.()),
	);
};

const hydrateTableProperties = ({ new: newItems, old: oldItems }, name) => {
	const preparePropertiesName = properties => _.map(properties, ({ propertyKey }) => propertyKey).join(', ');
	const { add, drop } = getDifferentItems(newItems, oldItems);
	const dataProperties = {
		add: getTablePropertiesClause(add),
		drop: preparePropertiesName(drop),
	};
	return { dataProperties, name };
};

const adjustPropertyKey = propertyKey => {
	if (/^\s*\(/.test(propertyKey) && !/\)\s*$/.test(propertyKey)) {
		return propertyKey.replace(/^\s*\(([\s\S]+)/, '$1');
	} else {
		return propertyKey;
	}
};

const adjustPropertyValue = propertyValue => {
	if (/\)\s*$/.test(propertyValue) && !/^\s*\(/.test(propertyValue)) {
		return propertyValue.replace(/([\s\S]+)\)\s*$/, '$1');
	} else {
		return propertyValue;
	}
};

const buildEveryClause = scheduleGroup => {
	const { scheduleEveryUnit, scheduleEveryValueHours, scheduleEveryValueDays, scheduleEveryValueWeeks } =
		scheduleGroup;

	let value = '';
	if (scheduleEveryUnit === 'HOURS') value = scheduleEveryValueHours;
	if (scheduleEveryUnit === 'DAYS') value = scheduleEveryValueDays;
	if (scheduleEveryUnit === 'WEEKS') value = scheduleEveryValueWeeks;

	if (!value) return '';
	return `SCHEDULE REFRESH EVERY ${value} ${scheduleEveryUnit}`;
};

const buildCronClause = scheduleGroup => {
	const { scheduleCronString, scheduleTimeZone } = scheduleGroup;

	if (!scheduleCronString) return '';
	const timezone = scheduleTimeZone ? ` AT TIME ZONE '${scheduleTimeZone}'` : '';
	return `SCHEDULE REFRESH CRON '${scheduleCronString}'${timezone}`;
};

const buildTriggerClause = scheduleGroup => {
	const { triggerIntervalUnit, triggerIntervalValue } = scheduleGroup;

	if (triggerIntervalValue && triggerIntervalUnit) {
		return `TRIGGER ON UPDATE AT MOST EVERY ${triggerIntervalValue} ${triggerIntervalUnit}`;
	}
	return 'TRIGGER ON UPDATE';
};

const getScheduleClause = scheduleGroup => {
	if (!scheduleGroup?.scheduleType || scheduleGroup.scheduleType === ScheduleTypesEnum.NONE) {
		return '';
	}

	switch (scheduleGroup.scheduleType) {
		case ScheduleTypesEnum.CRON:
			return buildCronClause(scheduleGroup);
		case ScheduleTypesEnum.EVERY:
			return buildEveryClause(scheduleGroup);
		case ScheduleTypesEnum.TRIGGER_ON_UPDATE_BETA:
		case ScheduleTypesEnum.TRIGGER_ON_UPDATE:
			return buildTriggerClause(scheduleGroup);

		default:
			return '';
	}
};

module.exports = {
	getTableStatement,
	getTablePropertiesClause,
	hydrateTableProperties,
	checkTablePropertiesDefined,
	getDeleteTablePropertiesClause,
	getPartitionKeyStatement,
	getClusteringKeys,
	getPartitionsKeys,
};
