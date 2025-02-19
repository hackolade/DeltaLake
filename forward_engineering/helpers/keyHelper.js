'use strict';

/**
 * @typedef {import('forward_engineering/types/types').JsonSchema} JsonSchema
 * @typedef {import('forward_engineering/types/types').ConstraintDto} ConstraintDto
 * @typedef {import('forward_engineering/types/types').ConstraintDtoColumn} ConstraintDtoColumn
 * @typedef {import('forward_engineering/types/types').ColumnDefinition} ColumnDefinition
 */

const { isEmpty, uniq } = require('lodash');
const jsonSchemaHelper = require('./jsonSchemaHelper');

const filterPaths = (keys, paths) => paths.filter(path => keys.find(key => path[path.length - 1] === key.keyId));
const sortedKey = getNameByPath => (keys, paths) => {
	return keys.map(key => {
		const path = paths.find(path => path[path.length - 1] === key.keyId) || [];

		return {
			name: getNameByPath(path),
			type: key.type === 'ascending' ? 'ASC' : 'DESC',
		};
	});
};

const getKeyNames = (tableData, jsonSchema, definitions) => {
	const compositeClusteringKey = tableData.compositeClusteringKey || [];
	const compositePartitionKey = tableData.compositePartitionKey || [];
	const skewedby = tableData.skewedby || [];
	const sortedByKey = tableData.sortedByKey || [];

	const ids = uniq(
		[...compositeClusteringKey, ...compositePartitionKey, ...skewedby, ...sortedByKey].map(key => key.keyId),
	);

	const keysPaths = jsonSchemaHelper.getPathsByIds(ids, [jsonSchema, ...definitions]);
	const primaryKeysPath = jsonSchemaHelper.getPrimaryKeys(jsonSchema);
	const idToNameHashTable = jsonSchemaHelper.getIdToNameHashTable([jsonSchema, ...definitions]);
	const getNameByPath = jsonSchemaHelper.getNameByPath.bind(null, idToNameHashTable);

	return {
		primaryKeys: primaryKeysPath.map(getNameByPath),
		compositeClusteringKey: filterPaths(compositeClusteringKey, keysPaths).map(getNameByPath),
		compositePartitionKey: filterPaths(compositePartitionKey, keysPaths).map(getNameByPath),
		skewedby: filterPaths(skewedby, keysPaths).map(getNameByPath),
		sortedByKey: sortedKey(getNameByPath)(sortedByKey, filterPaths(sortedByKey, keysPaths)),
	};
};

/**
 * @param {string} keyId
 * @param {Record<string, JsonSchema>} properties
 * @returns {string | undefined}
 */
const findName = (keyId, properties) => {
	return Object.keys(properties).find(name => properties[name].GUID === keyId);
};

/**
 * @param {string} keyId
 * @param {Record<string, JsonSchema>} properties
 * @returns {boolean}
 */
const checkIfActivated = (keyId, properties) => {
	const property = Object.values(properties).find(prop => prop.GUID === keyId);

	return property?.isActivated ?? true;
};

/**
 * @param {Array<{ keyId: string }>} keys
 * @param {JsonSchema} jsonSchema
 * @returns {ConstraintDtoColumn[]}
 */
const getKeys = (keys, jsonSchema) => {
	return (keys || []).map(key => {
		return {
			name: findName(key.keyId, jsonSchema.properties),
			isActivated: checkIfActivated(key.keyId, jsonSchema.properties),
		};
	});
};

/**
 * @param {Record<string, unknown>} primaryKeyOptions
 * @returns {ConstraintDto}
 */
const hydratePrimaryKeyOptions = (primaryKeyOptions = {}) => {
	return {
		keyType: 'PRIMARY KEY',
		name: primaryKeyOptions.constraintName,
	};
};

/**
 * @param {Record<string, unknown>} uniqueKeyOptions
 * @returns {ConstraintDto}
 */
const hydrateUniqueOptions = (uniqueKeyOptions = {}) => {
	return {
		keyType: 'UNIQUE',
		name: uniqueKeyOptions.constraintName,
	};
};

/**
 * @param {{ jsonSchema: JsonSchema }}
 * @returns {ConstraintDto[]}
 */
const getCompositePrimaryKeys = ({ jsonSchema }) => {
	if (!Array.isArray(jsonSchema.primaryKey)) {
		return [];
	}

	return jsonSchema.primaryKey
		.filter(primaryKey => !isEmpty(primaryKey.compositePrimaryKey))
		.map(primaryKey => ({
			...hydratePrimaryKeyOptions(primaryKey),
			columns: getKeys(primaryKey.compositePrimaryKey, jsonSchema),
		}));
};

/**
 * @param {{ jsonSchema: JsonSchema }}
 * @returns {ConstraintDto[]}
 */
const getCompositeUniqueKeys = ({ jsonSchema }) => {
	if (!Array.isArray(jsonSchema.uniqueKey)) {
		return [];
	}

	return jsonSchema.uniqueKey
		.filter(uniqueKey => uniqueKey.compositeUniqueKey)
		.map(uniqueKey => ({
			...hydrateUniqueOptions(uniqueKey),
			columns: getKeys(uniqueKey.compositeUniqueKey, jsonSchema),
		}));
};

/**
 * @param {{ columnDefinition: ColumnDefinition }}
 * @returns {ConstraintDto}
 */
const getColumnPrimaryKeyConstraint = ({ columnDefinition }) => {
	const isPrimaryKey = columnDefinition.primaryKey && !columnDefinition.compositePrimaryKey;

	if (!isPrimaryKey) {
		return;
	}

	return hydratePrimaryKeyOptions(columnDefinition.primaryKeyOptions);
};

/**
 * @param {{ columnDefinition: ColumnDefinition }}
 * @returns {ConstraintDto}
 */
const getColumnUniqueKeyConstraint = ({ columnDefinition }) => {
	if (!columnDefinition.unique) {
		return;
	}

	return hydrateUniqueOptions(columnDefinition.uniqueKeyOptions);
};

/**
 * @param {{ columnDefinition: ColumnDefinition }}
 * @returns {ConstraintDto}
 */
const getColumnCheckConstraint = ({ columnDefinition }) => {
	if (!columnDefinition.check) {
		return;
	}

	return {
		keyType: 'CHECK',
		expression: columnDefinition.check,
		name: columnDefinition.checkConstraintName,
	};
};

/**
 * @param {{ columnDefinition: ColumnDefinition; jsonSchema: JsonSchema }}
 * @returns {ConstraintDto[]}
 */
const getColumnConstraints = ({ columnDefinition, jsonSchema }) => {
	const primaryKeyConstraint = getColumnPrimaryKeyConstraint({ columnDefinition });
	const uniqueKeyConstraint = getColumnUniqueKeyConstraint({ columnDefinition });
	const checkConstraint = getColumnCheckConstraint({ columnDefinition });

	return [primaryKeyConstraint, uniqueKeyConstraint, checkConstraint].filter(Boolean);
};

module.exports = {
	getKeyNames,
	getColumnConstraints,
	getCompositePrimaryKeys,
	getCompositeUniqueKeys,
};
