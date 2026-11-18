'use strict';
/**
 * @typedef {Record<string, unknown>} ViewData
 * @typedef {Record<string, unknown>} JsonSchema
 * @typedef {Record<string, { definitionId: string }>} CollectionRefsDefinitionsMap
 */
const _ = require('lodash');
const { getKeyNames } = require('./keyHelper');
const { getColumns } = require('./columnHelper');
const { getPartitionKeyStatement, getPartitionsKeys, getClusteringKeys } = require('./tableHelper');
const {
	encodeStringLiteral,
	commentDeactivatedStatement,
	getEntityNameWithTemporaryFlag,
} = require('../utils/general');
const { prepareName } = require('../../shared/general');

const getColumnRefData = (collectionRefsDefinitionsMap, definition) => {
	const itemDataId = Object.keys(collectionRefsDefinitionsMap).find(viewFieldId => {
		const definitionData = collectionRefsDefinitionsMap[viewFieldId];

		return definitionData.definitionId === definition.GUID;
	});

	return collectionRefsDefinitionsMap[definition.refId] || collectionRefsDefinitionsMap[itemDataId] || {};
};

const isSourceCollectionActivated = itemData =>
	_.first(itemData?.collection)?.isActivated !== false && _.first(itemData?.bucket)?.isActivated !== false;

const isSourceColumnActivated = itemData => itemData?.definition?.isActivated !== false;

/**
 * @param {{ columns: JsonSchema; collectionRefsDefinitionsMap: CollectionRefsDefinitionsMap; isParentActivated: boolean }}
 * @returns {JsonSchema}
 */
const getViewColumnsWithActivation = ({ columns, collectionRefsDefinitionsMap, isParentActivated }) =>
	_.mapValues(columns, definition => {
		const source = getColumnRefData(collectionRefsDefinitionsMap, definition);

		return {
			...definition,
			isActivated:
				!isParentActivated ||
				(definition.isActivated !== false &&
					isSourceCollectionActivated(source) &&
					isSourceColumnActivated(source)),
		};
	});

const getColumnNames = (collectionRefsDefinitionsMap, columns) => {
	return _.uniq(
		Object.entries(columns).map(([name, definition]) => {
			const itemData = getColumnRefData(collectionRefsDefinitionsMap, definition);

			if (!itemData.name) {
				return prepareName(itemData.name);
			}
			const collection = _.first(itemData.collection) || {};
			const collectionName = collection.code || collection.collectionName;
			const db = _.first(itemData.bucket) || {};
			const dbName = db.code || db.name;
			const tablePrefix = getEntityNameWithTemporaryFlag({
				containerName: prepareName(dbName),
				entityName: prepareName(collectionName),
				isTemporary: collection.temporaryTable,
			});
			const fullColumnName = `${tablePrefix}.${prepareName(itemData.name)} as ${prepareName(name)}`;
			return commentDeactivatedStatement(fullColumnName, definition.isActivated);
		}),
	).filter(_.identity);
};

const getFromStatement = (collectionRefsDefinitionsMap, columns, isParentActivated) => {
	const sourceCollections = Object.keys(columns).reduce((result, name) => {
		const source = getColumnRefData(collectionRefsDefinitionsMap, columns[name]);
		const collection = _.first(source?.collection) || {};

		if (_.isEmpty(collection)) {
			return result;
		}

		const bucket = _.first(source?.bucket) || {};
		const collectionName = prepareName(collection.collectionName || collection.code);
		const bucketName = prepareName(bucket.name || bucket.code || '');
		const fullCollectionName = getEntityNameWithTemporaryFlag({
			containerName: bucketName,
			entityName: collectionName,
			isTemporary: collection.temporaryTable,
		});
		const columnActivated = !isParentActivated || columns[name].isActivated !== false;
		const existing = result.find(item => item.name === fullCollectionName);

		if (existing) {
			existing.isActivated = existing.isActivated || columnActivated;
		} else {
			result.push({ name: fullCollectionName, isActivated: columnActivated });
		}

		return result;
	}, []);
	if (_.isEmpty(sourceCollections)) {
		return '';
	}

	const [activatedCollections, deactivatedCollections] = _.partition(sourceCollections, 'isActivated');
	if (_.isEmpty(activatedCollections)) {
		return 'FROM ' + sourceCollections.map(({ name }) => name).join(' INNER JOIN ');
	}

	const deactivatedJoins = deactivatedCollections.map(({ name }) => ` /* INNER JOIN ${name} */`).join('');

	return 'FROM ' + activatedCollections.map(({ name }) => name).join(' INNER JOIN ') + deactivatedJoins;
};

const retrievePropertyFromConfig = (config, tab, propertyName, defaultValue = '') =>
	((config || [])[tab] || {})[propertyName] || defaultValue;

const retrieveContainerName = containerConfig =>
	retrievePropertyFromConfig(containerConfig, 0, 'code', retrievePropertyFromConfig(containerConfig, 0, 'name', ''));

const replaceSpaceWithUnderscore = (name = '') => {
	return name.replace(/\s/g, '_');
};

function joinColumnNames(statements) {
	const lastNonCommentIndex = statements.findLastIndex(statement => !statement.startsWith('--'));

	if (lastNonCommentIndex === -1) {
		return statements.join('\n');
	}

	return statements
		.map((st, index) => {
			const isNotLast = index !== statements.length - 1;

			if (lastNonCommentIndex === index && isNotLast) {
				return `${st} -- ,`;
			}

			return `${st}${isNotLast ? ',' : ''}`;
		})
		.join('\n');
}

function getCommentStatement(comment) {
	return comment ? `COMMENT '${encodeStringLiteral(comment)}'` : '';
}

function getDefaultColumnList(properties) {
	const list = Object.entries(properties)
		.reduce((columnList, [name, property]) => {
			columnList.push({
				name: `${prepareName(name)}`,
				comment: property.refDescription || property.description,
				isActivated: property.isActivated,
			});

			return columnList;
		}, [])
		.map(({ name, comment, isActivated }) => {
			return commentDeactivatedStatement(`${name} ${getCommentStatement(comment)}`, isActivated);
		});

	return list.length ? `\n(${joinColumnNames(list)}\n)` : '';
}

function getTableSelectStatement({ collectionRefsDefinitionsMap, columns, isParentActivated = true }) {
	const fromStatement = getFromStatement(collectionRefsDefinitionsMap, columns, isParentActivated);
	const columnsNames = getColumnNames(collectionRefsDefinitionsMap, columns);

	if (fromStatement && columnsNames?.length) {
		return `\nAS SELECT ${joinColumnNames(columnsNames)}\n${fromStatement}`;
	}

	return '';
}

const filterRedundantProperties = (tableProperties, propertiesList) => {
	if (!Array.isArray(tableProperties)) {
		return tableProperties;
	}

	return tableProperties.filter(prop => !propertiesList.includes(prop.propertyKey));
};

/**
 * @param {{ viewData: ViewData; collectionRefsDefinitionsMap: CollectionRefsDefinitionsMap }}
 * @returns {ViewData}
 */
const replaceReferenceKeyIds = ({ viewData, collectionRefsDefinitionsMap }) => {
	const replaceKeyId = (keys = []) =>
		keys.map(key => ({
			...key,
			keyId: collectionRefsDefinitionsMap[key.keyId]?.definitionId || key.keyId,
		}));

	return {
		...viewData,
		compositeClusteringKey: replaceKeyId(viewData.compositeClusteringKey),
		compositePartitionKey: replaceKeyId(viewData.compositePartitionKey),
	};
};

/**
 * @param {{ viewData: ViewData; jsonSchema: JsonSchema; collectionRefsDefinitionsMap: CollectionRefsDefinitionsMap }}
 * @returns {{ partitioningKeyClause: string; clusteringKeyClause: string }}
 */
const getCompositeKeyClauses = ({ viewData, jsonSchema, collectionRefsDefinitionsMap }) => {
	if (!viewData.materialized) {
		return {
			partitioningKeyClause: '',
			clusteringKeyClause: '',
		};
	}

	const getKeyClause = (clause, keys) => (keys ? `\n${clause} (${keys})` : '');
	const view = replaceReferenceKeyIds({ viewData, collectionRefsDefinitionsMap });
	const { compositeClusteringKey, compositePartitionKey } = getKeyNames(view, jsonSchema, []);
	const { columns, deactivatedColumnNames } = getColumns(jsonSchema, [], '');
	const partitioningKeys = getPartitionKeyStatement(
		getPartitionsKeys(columns, compositePartitionKey),
		viewData.isActivated,
	);
	const clusteringKeys = getClusteringKeys(compositeClusteringKey, deactivatedColumnNames, viewData.isActivated);

	return {
		partitioningKeyClause: getKeyClause('PARTITIONED BY', partitioningKeys),
		clusteringKeyClause: getKeyClause('CLUSTER BY', clusteringKeys),
	};
};

module.exports = {
	getTableSelectStatement,
	retrieveContainerName,
	filterRedundantProperties,
	getDefaultColumnList,
	getCommentStatement,
	getCompositeKeyClauses,
	getViewColumnsWithActivation,
};
