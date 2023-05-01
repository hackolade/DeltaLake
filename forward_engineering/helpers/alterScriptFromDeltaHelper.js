const {
	getAddContainerScript,
	getDeleteContainerScript,
	getModifyContainerScript,
} = require('./alterScriptHelpers/alterContainerHelper');
const {
	getAddCollectionsScripts,
	getDeleteCollectionsScripts,
	getModifyCollectionsScripts,
	getDeleteColumnsScripts,
	getDeleteColumnScripsForOlderRuntime,
	getModifyColumnsScriptsForOlderRuntime,
	getAddColumnsScripts,
	getModifyColumnsScripts, getModifyCollectionCommentsScripts
} = require('./alterScriptHelpers/alterEntityHelper');
const {
	getAddViewsScripts,
	getDeleteViewsScripts,
	getModifyViewsScripts,
} = require('./alterScriptHelpers/alterViewHelper');
const { commentDeactivatedStatements, buildScript, doesScriptContainDropStatement} = require('./generalHelper');
const { getDBVersionNumber } = require('./alterScriptHelpers/common');
const {getModifyPkConstraintsScripts} = require("./alterScriptHelpers/entityHelpers/primaryKeyHelper");
const {getDeleteForeignKeyScripts, getAddForeignKeyScripts} = require("./alterScriptHelpers/relationshipsHelper");

/**
 * @param entity {Object}
 * @param nameProperty {string}
 * @param modify {'added' | 'deleted' | 'modified'}
 * @return Array<Object>
 * */
const getItems = (entity, nameProperty, modify) =>
	[]
		.concat(entity.properties?.[nameProperty]?.properties?.[modify]?.items)
		.filter(Boolean)
		.map(items => Object.values(items.properties)[0]);

const getAlterContainersScripts = (schema, provider) => {
	const addedScripts = getItems(schema, 'containers', 'added').map(
		getAddContainerScript
	);
	const deletedScripts = getItems(schema, 'containers', 'deleted').map(
		getDeleteContainerScript(provider)
	);
	const modifiedScripts = getItems(schema, 'containers', 'modified').flatMap(
		getModifyContainerScript(provider)
	);
	return [...deletedScripts, ...addedScripts, ...modifiedScripts];
};

const getAlterCollectionsScripts = ({ schema, definitions, provider, data, _ }) => {
	const getCollectionScripts = (items, compMode, getScript) =>
		items.filter(item => item.compMod?.[compMode]).flatMap(getScript);

	const getColumnScripts = (items, getScript) => items.filter(item => !item.compMod).flatMap(getScript);
	const dbVersionNumber = getDBVersionNumber(data.modelData[0].dbVersion);
	const getDeletedColumnsScriptsMethod = dbVersionNumber < 11 ? getDeleteColumnScripsForOlderRuntime : getDeleteColumnsScripts;
	const getModifyColumnsScriptsMethod = dbVersionNumber < 11 ? getModifyColumnsScriptsForOlderRuntime : getModifyColumnsScripts;

	const addedCollectionsScripts = getCollectionScripts(
		getItems(schema, 'entities', 'added'),
		'created',
		getAddCollectionsScripts(definitions)
	);
	const deletedCollectionsScripts = getCollectionScripts(
		getItems(schema, 'entities', 'deleted'),
		'deleted',
		getDeleteCollectionsScripts(provider)
	);
	const modifiedCollectionsScripts = getCollectionScripts(
		getItems(schema, 'entities', 'modified'),
		'modified',
		getModifyCollectionsScripts(definitions, provider)
	);
	const modifiedCollectionCommentsScripts = getItems(schema, 'entities', 'modified')
		.flatMap(item => getModifyCollectionCommentsScripts(provider)(item));
	const modifiedCollectionPrimaryKeysScripts = getItems(schema, 'entities', 'modified')
		.flatMap(item => getModifyPkConstraintsScripts(_, provider)(item));

	const addedColumnsScripts = getColumnScripts(
		getItems(schema, 'entities', 'added'),
		getAddColumnsScripts(definitions, provider)
	);
	const deletedColumnsScripts = getColumnScripts(
		getItems(schema, 'entities', 'deleted'),
		getDeletedColumnsScriptsMethod(definitions, provider)
	);
	const modifiedColumnsScripts = getColumnScripts(
		getItems(schema, 'entities', 'modified'),
		getModifyColumnsScriptsMethod(definitions, provider)
	);

	return [
		...deletedCollectionsScripts,
		...addedCollectionsScripts,
		...modifiedCollectionsScripts,
		...modifiedCollectionCommentsScripts,
		...modifiedCollectionPrimaryKeysScripts,
		...deletedColumnsScripts,
		...addedColumnsScripts,
		...modifiedColumnsScripts,
	];
};

const getAlterViewsScripts = (schema, provider) => {
	const getViewScripts = (views, compMode, getScript) =>
		views
			.map(view => ({ ...view, ...(view.role || {}) }))
			.filter(view => view.compMod?.[compMode]).map(getScript);

	const getColumnScripts = (items, getScript) => items
		.map(view => ({ ...view, ...(view.role || {}) }))
		.filter(view => !view.compMod?.created && !view.compMod?.deleted).flatMap(getScript);

	const addedViewScripts = getViewScripts(
		getItems(schema, 'views', 'added'),
		'created',
		getAddViewsScripts
	);
	const deletedViewScripts = getViewScripts(
		getItems(schema, 'views', 'deleted'),
		'deleted',
		getDeleteViewsScripts(provider)
	);
	const modifiedViewScripts = getColumnScripts(
		getItems(schema, 'views', 'modified'),
		getModifyViewsScripts(provider)
	);

	return [
		...deletedViewScripts,
		...addedViewScripts,
		...modifiedViewScripts,
	];
};

/**
 * @return Array<string>
 * */
const getAlterRelationshipsScripts = ({ schema, ddlProvider, _ }) => {
	const modifiedEntities = getItems(schema, 'entities', 'modified');

	const deletedRelationships = getItems(schema, 'relationships', 'deleted')
		.filter(relationship => relationship.role?.compMod?.deleted);
	const addedRelationships = getItems(schema, 'relationships', 'added')
		.filter(relationship => relationship.role?.compMod?.created);
	const modifiedRelationships = getItems(schema, 'relationships', 'modified');

	const deleteFkScripts = getDeleteForeignKeyScripts(ddlProvider, _)(modifiedEntities, deletedRelationships);
	const addFkScripts = getAddForeignKeyScripts(ddlProvider, _)(modifiedEntities, addedRelationships);

	return [
		...deleteFkScripts,
		...addFkScripts,
	];
}

const getAlterScript = (schema, definitions, data, app) => {
	const provider = require('./alterScriptHelpers/provider')(app);
	const _ = app.require('lodash');
	const containersScripts = getAlterContainersScripts(schema, provider);
	const collectionsScripts = getAlterCollectionsScripts({ schema, definitions, provider, data, _ });
	const viewsScripts = getAlterViewsScripts(schema, provider);
	const relationshipsScripts = getAlterRelationshipsScripts({ schema, ddlProvider: provider, _ });
	let scripts = containersScripts
		.concat(collectionsScripts, viewsScripts, relationshipsScripts)
		.filter(Boolean)
		.map(script => script.trim());
	scripts = getCommentedDropScript(scripts, data);
	return builds(scripts)
};

const getCommentedDropScript = (scripts, data) => {
	const { additionalOptions = [] } = data.options || {};
	const applyDropStatements = (additionalOptions.find(option => option.id === 'applyDropStatements') || {}).value;
	if (applyDropStatements) {
		return scripts;
	}
	return scripts.map(script => {
		const isDrop = doesScriptContainDropStatement(script);
		return !isDrop ? script : commentDeactivatedStatements(script, false);
	});
};

const builds = scripts => {
	const formatScripts = buildScript(scripts);
	return formatScripts.split(';').map(script => script.trim()).join(';\n\n');
};

module.exports = {
	getAlterScript
}
