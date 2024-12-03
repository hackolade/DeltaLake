const { hydrateTableProperties } = require('../../helpers/tableHelper');
const {
	getEntityData,
	getEntityProperties,
	getContainerName,
	generateFullEntityName,
	getEntityName,
	prepareScript,
	getFullEntityName,
} = require('../../utils/general');
const { AlterScriptDto } = require('../types/AlterScriptDto');
const { getModifyUnityViewTagsScriptDtos } = require('./entityHelpers/alterUnityTagsHelper');

const viewProperties = ['code', 'name', 'tableProperties', 'selectStatement', 'unityViewTags'];
const otherViewProperties = ['viewTemporary', 'viewOrReplace', 'isGlobal', 'description'];

const compareProperties = _ => (view, properties) => {
	const compMod = _.get(view, 'role.compMod', {});
	return properties.some(property => {
		const { new: newProperty, old: oldProperty } = compMod[property] || {};
		return (!!newProperty || !!oldProperty) && !_.isEqual(newProperty, oldProperty);
	});
};

const prepareColumnGuids = columns =>
	Object.entries(columns).reduce(
		(columns, [name, value = {}]) => ({
			...columns,
			[name]: {
				...value,
				GUID: value.refId || '',
			},
		}),
		{},
	);

const prepareRefsDefinitionsMap = definitions =>
	Object.entries(definitions).reduce(
		(columns, [definitionId, value = {}]) => ({
			...columns,
			[definitionId]: {
				...value,
				definitionId,
			},
		}),
		{},
	);

const hydrateView = _ => view => {
	const compMod = _.get(view, 'role.compMod', {});
	const properties = prepareColumnGuids(getEntityProperties(view));
	const roleData = getEntityData(compMod, viewProperties.concat(otherViewProperties));
	const schema = { ..._.get(view, 'role', {}), ...roleData, properties };
	const collectionRefsDefinitionsMap = prepareRefsDefinitionsMap(
		schema.compMod?.collectionData?.collectionRefsDefinitionsMap || {},
	);
	return {
		schema,
		collectionRefsDefinitionsMap,
		viewData: [schema],
		containerData: [{ name: getContainerName(compMod) }],
	};
};

/**
 * @return {function(*): {dataProperties: {add: string, drop: *}, rename: {newName: string, oldName: string}, dbName: *, fullName: string, selectStatement: *|string}}
 * */
const hydrateAlterView = _ => view => {
	const compMod = _.get(view, 'role.compMod', {});
	const rename = getEntityName(compMod, 'name');
	const dbName = getContainerName(compMod);
	const fullName = getFullEntityName(dbName, rename.newName);
	const tableProperties = _.get(compMod, 'tableProperties', '');
	const { new: newSelect, old: oldSelect } = _.get(compMod, 'selectStatement', '');
	const { dataProperties } = hydrateTableProperties(_)(tableProperties, fullName);

	return {
		selectStatement: !_.isEqual(newSelect, oldSelect) && newSelect ? newSelect : '',
		dataProperties,
		fullName,
		dbName,
		rename,
	};
};

/**
 * @return {(view: Object) => AlterScriptDto}
 * */
const getAddViewsScripts = (provider, _) => view => {
	const hydratedView = hydrateView(_)(view);
	const script = provider.createView(hydratedView);

	return {
		isActivated: true,
		scripts: [
			{
				isDropScript: false,
				script,
			},
		],
	};
};

/**
 * @return {(view: Object) => AlterScriptDto}
 * */
const getDeleteViewsScripts = (provider, dbVersion) => view => {
	const viewName = generateFullEntityName({ entity: view, dbVersion });
	const script = provider.dropView(viewName);
	return {
		isActivated: true,
		scripts: [
			{
				isDropScript: true,
				script,
			},
		],
	};
};

/**
 * @return {(view: Object) => Array<AlterScriptDto>}
 * */
const getModifyViewsScripts = (provider, _, dbVersion) => view => {
	const comparedProperties = compareProperties(_)(view, viewProperties);
	const viewName = generateFullEntityName({ entity: view, dbVersion });
	if (comparedProperties) {
		const hydratedAlterView = hydrateAlterView(_)(view);
		const alterViewScript = prepareScript(...provider.alterView(hydratedAlterView));
		const alterUnityViewTagsScriptDtos = getModifyUnityViewTagsScriptDtos({ ddlProvider: provider })({
			viewData: view,
			viewName,
		});
		const alterViewScriptDtos = alterViewScript.map(script => AlterScriptDto.getInstance([script], true, false));

		return [...alterViewScriptDtos, ...alterUnityViewTagsScriptDtos];
	}
	const dropViewScript = provider.dropView(viewName);
	const hydratedView = hydrateView(_)(view);
	const addViewScript = provider.createView(hydratedView);
	const dropViewScriptDto = AlterScriptDto.getInstance([dropViewScript], true, true);
	const addViewScriptDto = AlterScriptDto.getInstance([addViewScript], true, false);

	return [dropViewScriptDto, addViewScriptDto].filter(Boolean);
};

module.exports = {
	getAddViewsScripts,
	getDeleteViewsScripts,
	getModifyViewsScripts,
};
