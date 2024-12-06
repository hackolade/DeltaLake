'use strict';

const _ = require('lodash');
const { getTab, buildStatement, prepareName, getName, replaceSpaceWithUnderscore } = require('../utils/general');
const schemaHelper = require('./jsonSchemaHelper');
const { getItemByPath } = require('./jsonSchemaHelper');

const getIndexStatement = ({ tableName, dbName, columns, options, isActivated }) => {
	return buildStatement(
		`CREATE BLOOMFILTER INDEX ON TABLE ${dbName}.${tableName} FOR COLUMNS (${columns})`,
		isActivated,
	)(options, `OPTIONS (${options})`)(true, ';')();
};

const getIndexKeys = (keys, jsonSchema, definitions) => {
	if (!Array.isArray(keys)) {
		return '';
	}
	const paths = schemaHelper.getPathsByIds(
		keys.map(key => key.keyId),
		[jsonSchema, ...definitions],
	);
	const idToNameHashTable = schemaHelper.getIdToNameHashTable([jsonSchema, ...definitions]);
	const [activatedKeys, deactivatedKeys] = _.partition(paths, path => {
		const item = getItemByPath(path, jsonSchema);
		return item ? item.isActivated : true;
	});
	const joinColumnNamesByPath = paths => {
		return paths
			.map(path => prepareName(replaceSpaceWithUnderscore(schemaHelper.getNameByPath(idToNameHashTable, path))))
			.join(', ');
	};
	const columns = joinColumnNamesByPath(paths);
	if (deactivatedKeys.length === 0) {
		return { isIndexActivated: true, columns };
	}
	if (activatedKeys.length === 0) {
		return { isIndexActivated: false, columns };
	}
	return {
		isIndexActivated: true,
		columns: `${joinColumnNamesByPath(activatedKeys)} /*, ${joinColumnNamesByPath(deactivatedKeys)}*/`,
	};
};

/**
 * @return {(containerData: any, entityData: any, jsonSchema: any, definitions: any) => string}
 * */
const getIndexes = (containerData, entityData, jsonSchema, definitions) => {
	const dbData = getTab(0, containerData);
	const dbName = replaceSpaceWithUnderscore(prepareName(getName(dbData)));
	const tableData = getTab(0, entityData);
	const indexesData = getTab(2, entityData).BloomIndxs || [];
	const tableName = replaceSpaceWithUnderscore(prepareName(getName(tableData)));
	return indexesData
		.filter(indexData => !_.isEmpty(indexData.forColumns))
		.map(indexData => {
			const { columns, isIndexActivated = true } = getIndexKeys(indexData.forColumns, jsonSchema, definitions);
			return getIndexStatement({
				dbName: dbName || 'default',
				tableName: tableName,
				columns,
				options: indexData.options,
				isActivated: isIndexActivated && tableData.isActivated && (_.isEmpty(dbData) || dbData.isActivated),
			});
		})
		.join('\n\n');
};

module.exports = {
	getIndexes,
};
