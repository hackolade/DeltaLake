'use strict'

const jsonSchemaHelper = require('./jsonSchemaHelper');

const filterPaths = (keys, paths) => paths.filter(path => keys.find(key => path[path.length - 1] === key.keyId));
const sortedKey = getNameByPath => (keys, paths) => {
	return keys.map(key => {
		const path = paths.find(path => path[path.length - 1] === key.keyId);

		return {
			name: getNameByPath(path),
			type: key.type === 'ascending' ? 'ASC' : 'DESC'
		};
	});
};

const getKeyNames = (tableData, jsonSchema, definitions) => {
	const compositeClusteringKey = tableData.compositeClusteringKey || [];
	const compositePartitionKey = tableData.compositePartitionKey || [];
	const skewedby = tableData.skewedby || [];
	const sortedByKey = tableData.sortedByKey || [];

	const ids = [
		...compositeClusteringKey,
		...compositePartitionKey,
		...skewedby,
		...sortedByKey,
	].map(key => key.keyId);

	const keysPaths = jsonSchemaHelper.getPathsByIds(ids, [jsonSchema, ...definitions]);
	const primaryKeysPath = jsonSchemaHelper.getPrimaryKeys(jsonSchema)
		.filter(pkPath => !keysPaths.find(path => path[path.length - 1] === pkPath[pkPath.length - 1]));
	const idToNameHashTable = jsonSchemaHelper.getIdToNameHashTable([jsonSchema, ...definitions]);
	const getNameByPath = jsonSchemaHelper.getNameByPath.bind(null, idToNameHashTable);

	return {
		primaryKeys: primaryKeysPath.map(getNameByPath),
		compositeClusteringKey: filterPaths(compositeClusteringKey, keysPaths).map(getNameByPath),
		compositePartitionKey: filterPaths(compositePartitionKey, keysPaths).map(getNameByPath),
		skewedby: filterPaths(skewedby, keysPaths).map(getNameByPath),
		sortedByKey: sortedKey(getNameByPath)(sortedByKey, filterPaths(sortedByKey, keysPaths))
	};
};

module.exports = {
	getKeyNames
};
