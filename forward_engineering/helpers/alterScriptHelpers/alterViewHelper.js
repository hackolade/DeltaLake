const { dependencies } = require('../appDependencies');
const { getViewScript } = require('../viewHelper');
const { hydrateTableProperties } = require('../tableHelper');
const {
	getEntityData,
	getEntityProperties,
	getContainerName,
	generateFullEntityName,
	getEntityName,
	prepareScript,
	getFullEntityName
} = require('../../utils/generalUtils');

let _;
const setDependencies = ({ lodash }) => _ = lodash;

const viewProperties = ['code', 'name', 'tableProperties', 'selectStatement'];
const otherViewProperties = ['viewTemporary', 'viewOrReplace', 'isGlobal', 'description'];

const compareProperties = (_) => (view, properties) => {
	const compMod = _.get(view, 'role.compMod', {});
	return properties.some(property => {
		const { new: newProperty, old: oldProperty } = compMod[property] || {};
		return (!!newProperty || !!oldProperty) && !_.isEqual(newProperty, oldProperty);
	});
};

const prepareColumnGuids = columns =>
	Object.entries(columns).reduce((columns, [name, value = {}]) => ({
			...columns,
			[name]: {
				...value,
				GUID: value.refId || '',
			}
		}), {});

const prepareRefsDefinitionsMap = definitions =>
	Object.entries(definitions).reduce((columns, [definitionId, value = {}]) => ({
		...columns,
		[definitionId]: {
			...value,
			definitionId,
		}
	}), {});

const hydrateView = view => {
	const compMod = _.get(view, 'role.compMod', {});
	const properties = prepareColumnGuids(getEntityProperties(view));
	const roleData = getEntityData(compMod, viewProperties.concat(otherViewProperties));
	const schema = { ..._.get(view, 'role', {}), ...roleData, properties };
	const collectionRefsDefinitionsMap = prepareRefsDefinitionsMap(schema.compMod?.collectionData?.collectionRefsDefinitionsMap || {});
	return {
		schema,
		collectionRefsDefinitionsMap,
		viewData: [schema],
		containerData: [{ name: getContainerName(compMod) }],
	};
};

const hydrateAlterView = view => {
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
	}
};

const getAddViewsScripts = view => {
	setDependencies(dependencies);
	const hydratedView = hydrateView(view);
	return getViewScript(hydratedView);
};

const getDeleteViewsScripts = provider => view => {
	const viewName = generateFullEntityName(view);
	return provider.dropView(viewName);
};

const getModifyViewsScripts = provider => view => {
	setDependencies(dependencies);
	const comparedProperties = compareProperties(_)(view, viewProperties);
	if (comparedProperties) {
		const hydratedAlterView = hydrateAlterView(view);
		return prepareScript(...provider.alterView(hydratedAlterView));
	}
	const viewName = generateFullEntityName(view);
	const dropView = provider.dropView(viewName);
	const hydratedView = hydrateView(view);
	const addView = getViewScript(hydratedView);
	return prepareScript(dropView, addView);
};

module.exports = {
	getAddViewsScripts,
	getDeleteViewsScripts,
	getModifyViewsScripts,
}
