const { getUnityTagsFromCompMod, getUnsetTagsNamesParamString } = require('../../../helpers/unityTagsHelper');
const { buildTagPairs } = require('../../../helpers/unityTagsHelper');
const { prepareName } = require('../../../utils/general');
const { AlterScriptDto } = require('../../types/AlterScriptDto');

/**
 * @callback GetAlterScriptDtoFunction
 * @param {{ entityData: Object, name: string }} args
 * @returns Array<AlterScriptDto>
 */

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getSetUnityCatalogTagsDtos = ({ ddlProvider }) => ({ entityData, name }) => {
	const unityTags = entityData?.role?.compMod?.unityCatalogTags || {};
	const newUnityTags = unityTags.new || [];
	const oldUnityTags = unityTags.old || [];

	const setTags = getUnityTagsFromCompMod({ tagsToFilter: newUnityTags, filterBy: oldUnityTags});

	if (!setTags.length) {
		return [];
	}

	const script = ddlProvider.setCatalogTags({ name, tags: buildTagPairs(setTags) });

	return [AlterScriptDto.getInstance([script], true, false)];
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getUnsetUnityCatalogTagsScriptsDtosFrom = ({ ddlProvider }) => ({ entityData, name }) => {
	const unityTags = entityData?.role?.compMod?.unityCatalogTags || {};
	const newUnityTags = unityTags.new || [];
	const oldUnityTags = unityTags.old || [];

	const unsetTags = getUnityTagsFromCompMod({ tagsToFilter: oldUnityTags, filterBy: newUnityTags});

	if (!unsetTags.length) {
		return [];
	}

	const script = ddlProvider.unsetCatalogTags({ name, tags: getUnsetTagsNamesParamString({ unsetTags }) });

	return [AlterScriptDto.getInstance([script], true, true)];
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getModifyUnityCatalogTagsScriptDtos = ({ ddlProvider }) => ({ entityData, name }) => {
	const unsetUnityTagsScriptDtosFromTable = getUnsetUnityCatalogTagsScriptsDtosFrom({ ddlProvider })({
		entityData,
		name,
	});
	const setUnityTagsScriptDtosFromTable = getSetUnityCatalogTagsDtos({ ddlProvider })({ entityData, name });

	return [...unsetUnityTagsScriptDtosFromTable, ...setUnityTagsScriptDtosFromTable].filter(Boolean);
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getSetUnitySchemaTagsDtos = ({ ddlProvider }) => ({ entityData, name }) => {
	const unityTags = entityData?.role?.compMod?.unitySchemaTags || {};
	const newUnityTags = unityTags.new || [];
	const oldUnityTags = unityTags.old || [];

	const setTags = getUnityTagsFromCompMod({ tagsToFilter: newUnityTags, filterBy: oldUnityTags});

	if (!setTags.length) {
		return [];
	}

	const script = ddlProvider.setSchemaTags({ name, tags: buildTagPairs(setTags) });

	return [AlterScriptDto.getInstance([script], true, false)];
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getUnsetUnitySchemaTagsScriptsDtosFrom = ({ ddlProvider }) => ({ entityData, name }) => {
	const unityTags = entityData?.role?.compMod?.unitySchemaTags || {};
	const newUnityTags = unityTags.new || [];
	const oldUnityTags = unityTags.old || [];

	const unsetTags = getUnityTagsFromCompMod({ tagsToFilter: oldUnityTags, filterBy: newUnityTags});

	if (!unsetTags.length) {
		return [];
	}

	const script = ddlProvider.unsetSchemaTags({ name, tags: getUnsetTagsNamesParamString({ unsetTags }) });

	return [AlterScriptDto.getInstance([script], true, true)];
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getModifyUnitySchemaTagsScriptDtos = ({ ddlProvider }) => ({ entityData, name }) => {
	const unsetUnityTagsScriptDtosFromTable = getUnsetUnitySchemaTagsScriptsDtosFrom({ ddlProvider })({
		entityData,
		name,
	});
	const setUnityTagsScriptDtosFromTable = getSetUnitySchemaTagsDtos({ ddlProvider })({ entityData, name });

	return [...unsetUnityTagsScriptDtosFromTable, ...setUnityTagsScriptDtosFromTable].filter(Boolean);
};

module.exports = {
	getModifyUnitySchemaTagsScriptDtos,
	getModifyUnityCatalogTagsScriptDtos,
};
