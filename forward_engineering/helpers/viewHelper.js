'use strict';

const { prepareName, encodeStringLiteral, commentDeactivatedStatement } = require('../utils/general');
const { getTablePropertiesClause } = require('./tableHelper');
const { getViewTagsStatement } = require('./unityTagsHelper');
const ddlTemplates = require('../ddlProvider/ddlTemplates');
const assignTemplates = require('../utils/assignTemplates');

const getColumnNames = _ => (collectionRefsDefinitionsMap, columns) => {
	return _.uniq(
		Object.entries(columns).map(([name, definition]) => {
			const id = _.get(columns, [name, 'GUID']);

			const itemDataId = Object.keys(collectionRefsDefinitionsMap).find(viewFieldId => {
				const definitionData = collectionRefsDefinitionsMap[viewFieldId];

				return definitionData.definitionId === id;
			});
			const itemData = collectionRefsDefinitionsMap[itemDataId] || {};
			if (!itemData.name) {
				return prepareName(itemData.name);
			}
			const collection = _.first(itemData.collection) || {};
			const collectionName = collection.code || collection.collectionName;
			const db = _.first(itemData.bucket) || {};
			const dbName = db.code || db.name;
			const fullColumnName = `${dbName ? prepareName(dbName) + '.' : ''}${prepareName(collectionName)}.${prepareName(itemData.name)} as ${prepareName(name)}`;

			return commentDeactivatedStatement(fullColumnName, definition.isActivated);
		}),
	).filter(_.identity);
};

const getFromStatement = _ => (collectionRefsDefinitionsMap, columns) => {
	const sourceCollections = _.uniq(
		Object.keys(columns)
			.map(name => {
				const refId = columns[name].refId;
				const source = collectionRefsDefinitionsMap[refId];
				if (!source) {
					return;
				}
				const collection = _.first(source?.collection) || {};
				const bucket = _.first(source?.bucket) || {};
				const collectionName = prepareName(collection.collectionName || collection.code);
				const bucketName = prepareName(bucket.name || bucket.code || '');
				const fullCollectionName = bucketName ? `${bucketName}.${collectionName}` : `${collectionName}`;

				return fullCollectionName;
			})
			.filter(Boolean),
	);
	if (_.isEmpty(sourceCollections)) {
		return '';
	}

	return 'FROM ' + sourceCollections.join(' INNER JOIN ');
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
	return comment ? `\nCOMMENT '${encodeStringLiteral(comment)}'` : '';
}

function getDefaultColumnList(properties) {
	const list = Object.entries(properties)
		.reduce((columnList, [name, property]) => {
			columnList.push({
				name: `${prepareName(name)}`,
				comment: property.description,
				isActivated: property.isActivated,
			});

			return columnList;
		}, [])
		.map(({ name, comment, isActivated }) => {
			return commentDeactivatedStatement(`${name} ${getCommentStatement(comment)}`, isActivated);
		})
		.join(',\n');

	return list ? `\n(${list})` : '';
}

function getTableSelectStatement({ _, collectionRefsDefinitionsMap, columns }) {
	const fromStatement = getFromStatement(_)(collectionRefsDefinitionsMap, columns);
	const columnsNames = getColumnNames(_)(collectionRefsDefinitionsMap, columns);

	if (fromStatement && columnsNames?.length) {
		return `\nAS SELECT ${joinColumnNames(columnsNames)}\n${fromStatement}`;
	}

	return '';
}

module.exports = {
	getViewScript({ _, schema, viewData, containerData, collectionRefsDefinitionsMap }) {
		const columns = schema.properties || {};
		const view = _.first(viewData) || {};

		if (!view.isActivated) {
			return;
		}

		const bucketName = replaceSpaceWithUnderscore(prepareName(retrieveContainerName(containerData)));
		const viewName = replaceSpaceWithUnderscore(prepareName(view.code || view.name));
		const isGlobal = schema.viewGlobal && schema.viewTemporary;
		const isTemporary = schema.viewTemporary;
		const orReplace = schema.viewOrReplace;
		const ifNotExists = view.viewIfNotExist;
		const name = bucketName ? `${bucketName}.${viewName}` : `${viewName}`;
		const tableProperties =
			schema.tableProperties && Array.isArray(schema.tableProperties)
				? filterRedundantProperties(schema.tableProperties, ['transient_lastDdlTime'])
				: [];
		const viewUnityTagsStatements =
			schema.unityViewTags && getViewTagsStatement({ viewSchema: schema, viewName: name });

		return assignTemplates(ddlTemplates.createView, {
			orReplace: orReplace && !ifNotExists ? ' OR REPLACE ' : '',
			global: isGlobal ? 'GLOBAL ' : '',
			temporary: isTemporary ? 'TEMPORARY ' : '',
			ifNotExists: ifNotExists ? ' IF NOT EXISTS' : '',
			name,
			columnList: view.columnList ? `\n(${view.columnList})` : getDefaultColumnList(columns),
			schemaBinding: '',
			comment: getCommentStatement(schema.description),
			tablePropertyStatements: tableProperties.length
				? `\nTBLPROPERTIES (${getTablePropertiesClause(_)(tableProperties)})`
				: '',
			query: schema.selectStatement
				? `\nAS ${schema.selectStatement}`
				: getTableSelectStatement({
						_,
						collectionRefsDefinitionsMap,
						columns,
					}),
			viewUnityTagsStatements: viewUnityTagsStatements ? `\n${viewUnityTagsStatements};` : '',
		});
	},
};

const filterRedundantProperties = (tableProperties, propertiesList) => {
	if (!Array.isArray(tableProperties)) {
		return tableProperties;
	}

	return tableProperties.filter(prop => !propertiesList.includes(prop.propertyKey));
};
