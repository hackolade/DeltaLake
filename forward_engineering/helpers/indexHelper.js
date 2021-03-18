'use strict'

const { getTab, buildStatement, getName, replaceSpaceWithUnderscore } = require('./generalHelper');
const schemaHelper = require('./jsonSchemaHelper');
const { getItemByPath } = require('./jsonSchemaHelper');
const { dependencies } = require('./appDependencies');
let _;

const setDependencies = ({ lodash }) => _ = lodash;

const getIndexStatement = ({
	name, tableName, dbName, columns, indexHandler, comment, withDeferredRebuild,
	idxProperties, inTable, isActivated
}) => {
	return buildStatement(`CREATE INDEX ${name} ON TABLE ${dbName}.${tableName} (${columns}) AS '${indexHandler}'`, isActivated)
		(withDeferredRebuild, 'WITH DEFERRED REBUILD')
		(idxProperties, `IDXPROPERTIES ${idxProperties}`)
		(inTable, inTable)
		(comment, `COMMENT '${comment}'`)
		(true, ';')
		();
};

const getIndexKeys = (keys, jsonSchema, definitions) => {
	if (!Array.isArray(keys)) {
		return '';
	}

	const paths = schemaHelper.getPathsByIds(keys.map(key => key.keyId), [jsonSchema, ...definitions]);
	const idToNameHashTable = schemaHelper.getIdToNameHashTable([jsonSchema, ...definitions]);
	const [activatedKeys, deactivatedKeys] = _.partition(paths, path => {
		const item = getItemByPath(path, jsonSchema);
		return item ? item.isActivated : true;
	});
	const joinColumnNamesByPath = paths => {
		return paths
			.map(path => schemaHelper.getNameByPath(idToNameHashTable, path))
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
		columns: `${joinColumnNamesByPath(
			activatedKeys
		)} /*, ${joinColumnNamesByPath(deactivatedKeys)}*/`,
	};
};

const getIndexes = (containerData, entityData, jsonSchema, definitions) => {
	setDependencies(dependencies);
	const dbData = getTab(0, containerData);
	const dbName = replaceSpaceWithUnderscore(getName(dbData));
	const tableData = getTab(0, entityData);
	const indexesData = getTab(1, entityData).SecIndxs || [];
	const tableName = replaceSpaceWithUnderscore(getName(tableData));

	return indexesData
		.map((indexData) => {
			const { columns, isIndexActivated = true } = getIndexKeys(
				indexData.SecIndxKey,
				jsonSchema,
				definitions
			);

			return getIndexStatement({
				name: replaceSpaceWithUnderscore(indexData.name),
				dbName: dbName,
				tableName: tableName,
				columns,
				indexHandler: indexData.SecIndxHandler,
				inTable: indexData.SecIndxTable,
				comment: indexData.SecIndxComments,
				withDeferredRebuild: indexData.SecIndxWithDeferredRebuild,
				isActivated:
					isIndexActivated &&
					tableData.isActivated &&
					dbData.isActivated,
			});
		})
		.join('\n\n');
};

module.exports = {
	getIndexes
};
