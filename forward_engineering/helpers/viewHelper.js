'use strict'

let _;
const { dependencies } = require('./appDependencies');
const { prepareName } = require('./generalHelper');

const setDependencies = ({ lodash }) => _ = lodash;

const getColumnNames = (collectionRefsDefinitionsMap, columns) => {
	return _.uniq(Object.keys(columns).map(name => {
		const id = _.get(columns, [name, 'GUID']);

		const itemDataId = Object.keys(collectionRefsDefinitionsMap).find(viewFieldId => {
			const definitionData = collectionRefsDefinitionsMap[viewFieldId];

			return definitionData.definitionId === id;
		});
		const itemData = collectionRefsDefinitionsMap[itemDataId] || {};
		if (!itemData.name || itemData.name === name) {
			return prepareName(itemData.name);
		}
		const collection = _.first(itemData.collection) || {};
		const collectionName = collection.collectionName || collection.code;

		return `${prepareName(collectionName)}.${prepareName(itemData.name)} as ${prepareName(name)}`;
	})).filter(_.identity);
};

const getFromStatement = (collectionRefsDefinitionsMap, columns) => {
	const sourceCollections = _.uniq(Object.keys(columns).map(name => {
		const refId = columns[name].refId;
		const source = collectionRefsDefinitionsMap[refId];
		const collection = _.first(source.collection) || {};
		const bucket = _.first(source.bucket) || {};
		const collectionName = prepareName(collection.collectionName || collection.code);
		const bucketName = prepareName(bucket.name || bucket.code || '');
		const fullCollectionName = bucketName ? `${bucketName}.${collectionName}` : `${collectionName}`;

		return fullCollectionName;
	}));
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

		const bucketName = replaceSpaceWithUnderscore(prepareName(retrieveContainerName(containerData)));
		const viewName = replaceSpaceWithUnderscore(prepareName(view.code || view.name));
		const isGlobal = schema.viewGlobal && schema.viewTemporary;
		const isTemporary = schema.viewTemporary;
		const orReplace = schema.viewOrReplace
		const fromStatement = getFromStatement(collectionRefsDefinitionsMap, columns);
		const name = bucketName ? `${bucketName}.${viewName}` : `${viewName}`;
		const createStatement = `CREATE ${orReplace ? 'OR REPLACE ' : ''}${isGlobal ? 'GLOBAL ' : ''}${isTemporary ? 'TEMPORARY ' : ''}VIEW IF NOT EXISTS ${name}`;
		const comment = schema.description;
		script.push(createStatement);
		if (schema.selectStatement) {
			return createStatement + `${comment ? ' COMMENT \'' + comment + '\'' : ''} AS ${schema.selectStatement};\n\n`;
		}

		if (_.isEmpty(columns)) {
			return;
		}

		if (comment) {
			script.push(`COMMENT '${comment}'`);
		}

		if (!_.isEmpty(columns)) {
			const columnsNames = getColumnNames(collectionRefsDefinitionsMap, columns);
			script.push(`AS SELECT ${columnsNames.join(', ')}`);
			script.push(fromStatement);
		}

		return script.join('\n  ') + ';\n\n\n\n\n'
	},

	getViewAlterScripts({
		schema,
		viewData,
		containerData,
		collectionRefsDefinitionsMap,
	}) {
		setDependencies(dependencies);
		const view = _.first(viewData) || {};
		const bucketName = replaceSpaceWithUnderscore(prepareName(retrieveContainerName(containerData)));
		const viewName = replaceSpaceWithUnderscore(prepareName(view.code || view.name));
		const columns = schema.properties || {};
		const name = bucketName ? `${bucketName}.${viewName}` : `${viewName}`;
		const fromStatement = getFromStatement(collectionRefsDefinitionsMap, columns);
		let viewScripts = []
		if (schema.selectStatement) {
			viewScripts.push(`ALTER VIEW ${name} AS ${schema.selectStatement};\n\n`);
		} else if (!_.isEmpty(columns)) {
			const columnsNames = getColumnNames(collectionRefsDefinitionsMap, columns);
			viewScripts.push(`ALTER VIEW ${name} AS SELECT ${columnsNames} ${fromStatement};\n\n`);
		}
		return viewScripts;
	}

	};
