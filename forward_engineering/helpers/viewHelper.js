'use strict'

let _;
const { dependencies } = require('./appDependencies');
const { prepareName, encodeStringLiteral } = require('../utils/generalUtils');
const { getTablePropertiesClause } = require('./tableHelper');

const setDependencies = ({ lodash }) => _ = lodash;

const getColumnNames = (collectionRefsDefinitionsMap, columns) => {
	return _.uniq(Object.keys(columns).map(name => {
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

		return `${dbName ? prepareName(dbName) + '.' : ''}${prepareName(collectionName)}.${prepareName(itemData.name)} as ${prepareName(name)}`;
	})).filter(_.identity);
};

const getFromStatement = (collectionRefsDefinitionsMap, columns) => {
	const sourceCollections = _.uniq(Object.keys(columns).map(name => {
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
	}).filter(Boolean));
	if (_.isEmpty(sourceCollections)) {
		return '';
	}

	return 'FROM ' + sourceCollections.join(' INNER JOIN ');
};

const retrivePropertyFromConfig = (config, tab, propertyName, defaultValue = "") => ((config || [])[tab] || {})[propertyName] || defaultValue;

const retrieveContainerName = (containerConfig) => retrivePropertyFromConfig(
	containerConfig, 0, "code",
	retrivePropertyFromConfig(containerConfig, 0, "name", "")
);

const replaceSpaceWithUnderscore = (name = '') => {
	return name.replace(/\s/g, '_');
}

module.exports = {
	getViewScript({
		schema,
		viewData,
		containerData,
		collectionRefsDefinitionsMap,
	}) {
		setDependencies(dependencies);
		let script = [];
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
		const createStatement = `CREATE ${(orReplace && !ifNotExists) ? 'OR REPLACE ' : ''}${isGlobal ? 'GLOBAL ' : ''}${isTemporary ? 'TEMPORARY ' : ''}VIEW${ifNotExists ? ' IF NOT EXISTS' : ''} ${name}`;
		const comment = schema.description;
		let tablePropertyStatements = '';
		const tableProperties = schema.tableProperties && Array.isArray(schema.tableProperties) ? filterRedundantProperties(schema.tableProperties, ['transient_lastDdlTime']) : [];

		if (tableProperties.length) {
			tablePropertyStatements = ` TBLPROPERTIES (${getTablePropertiesClause(tableProperties)})`;
		};
		script.push(createStatement);
		if (schema.selectStatement) {
			const columnList = view.columnList ? ` (${view.columnList})` : ' ';
			return createStatement + `${columnList} ${comment ? ' COMMENT \'' + encodeStringLiteral(comment) + '\'' : ''} ${tablePropertyStatements} AS ${schema.selectStatement};\n\n`;
		}

		if (_.isEmpty(columns)) {
			return;
		}

		if (comment) {
			script.push(`COMMENT '${encodeStringLiteral(comment)}'`);
		}

		if (tablePropertyStatements) {
			script.push(tablePropertyStatements);
		}

		if (!_.isEmpty(columns)) {
			const fromStatement = getFromStatement(collectionRefsDefinitionsMap, columns);
			const columnsNames = getColumnNames(collectionRefsDefinitionsMap, columns);

			if (fromStatement && columnsNames?.length) {
				script.push(`AS SELECT ${columnsNames.join(', ')}`);
				script.push(fromStatement);
			} else {
				return;
			}
		}

		return script.join('\n  ') + ';\n\n\n\n\n'
	},
};

const filterRedundantProperties = (tableProperties, propertiesList) => {
	if (!Array.isArray(tableProperties)) {
		return tableProperties;
	}

	return tableProperties.filter(prop => !propertiesList.includes(prop.propertyKey));
};
