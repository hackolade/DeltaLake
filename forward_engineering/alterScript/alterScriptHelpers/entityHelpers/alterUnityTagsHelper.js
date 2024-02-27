const { getUnityTagsFromCompMod, getUnsetTagsNamesParamString } = require('../../../helpers/unityTagsHelper');
const { buildTagPairs } = require('../../../helpers/unityTagsHelper');
const { AlterScriptDto } = require('../../types/AlterScriptDto');

/**
 * @callback GetAlterScriptDtoFunction
 * @param {Object} entityData
 * @param {string} entityName
 * @returns Array<AlterScriptDto>
 */

/**
 * @callback GetAlterScriptDtoFunctionForViews
 * @param {Object} viewData
 * @param {string} viewName
 * @returns Array<AlterScriptDto>
 */

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getSetUnityEntityTagsDtos = ddlProvider => (entityData, entityName) => {
	const unityTags = entityData?.role?.compMod?.unityEntityTags || {};
	const newUnityTags = unityTags.new || [];
	const oldUnityTags = unityTags.old || [];

	const setTags = getUnityTagsFromCompMod(newUnityTags, oldUnityTags);

	if (!setTags.length) {
		return [];
	}

	const script = ddlProvider.setEntityTags(entityName, buildTagPairs(setTags));

	return [AlterScriptDto.getInstance([script], true, false)];
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getUnsetUnityEntityTagsScriptsDtosFrom = ddlProvider => (entityData, entityName) => {
	const unityTags = entityData?.role?.compMod?.unityEntityTags || {};
	const newUnityTags = unityTags.new || [];
	const oldUnityTags = unityTags.old || [];

	const unsetTags = getUnityTagsFromCompMod(oldUnityTags, newUnityTags);

	if (!unsetTags.length) {
		return [];
	}

	const script = ddlProvider.unsetEntityTags(entityName, getUnsetTagsNamesParamString(unsetTags));

	return [AlterScriptDto.getInstance([script], true, true)];
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getModifyUnityEntityTagsScriptDtos = ddlProvider => (entityData, entityName) => {
	const unsetUnityTagsScriptDtosFromTable = getUnsetUnityEntityTagsScriptsDtosFrom(ddlProvider)(entityData, entityName);
	const setUnityTagsScriptDtosFromTable = getSetUnityEntityTagsDtos(ddlProvider)(entityData, entityName);

	return [...unsetUnityTagsScriptDtosFromTable, ...setUnityTagsScriptDtosFromTable].filter(Boolean);
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunctionForViews}
 */
const getSetUnityViewTagsDtos = ddlProvider => (viewData, viewName) => {
	const unityTags = viewData?.role?.compMod?.unityViewTags || {};
	const newUnityTags = unityTags.new || [];
	const oldUnityTags = unityTags.old || [];

	const setTags = getUnityTagsFromCompMod(newUnityTags, oldUnityTags);

	if (!setTags.length) {
		return [];
	}

	const script = ddlProvider.setViewTags(viewName, buildTagPairs(setTags));

	return [AlterScriptDto.getInstance([script], true, false)];
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunctionForViews}
 */
const getUnsetUnityViewTagsScriptsDtosFrom = ddlProvider => (viewData, viewName) => {
	const unityTags = viewData?.role?.compMod?.unityViewTags || {};
	const newUnityTags = unityTags.new || [];
	const oldUnityTags = unityTags.old || [];

	const unsetTags = getUnityTagsFromCompMod(oldUnityTags, newUnityTags);

	if (!unsetTags.length) {
		return [];
	}

	const script = ddlProvider.unsetViewTags(viewName, getUnsetTagsNamesParamString(unsetTags));

	return [AlterScriptDto.getInstance([script], true, true)];
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunctionForViews}
 */
const getModifyUnityViewTagsScriptDtos = ddlProvider => (viewData, viewName) => {
	const unsetUnityTagsScriptDtosFromTable = getUnsetUnityViewTagsScriptsDtosFrom(ddlProvider)(viewData, viewName);
	const setUnityTagsScriptDtosFromTable = getSetUnityViewTagsDtos(ddlProvider)(viewData, viewName);

	return [...unsetUnityTagsScriptDtosFromTable, ...setUnityTagsScriptDtosFromTable].filter(Boolean);
};

module.exports = {
	getModifyUnityEntityTagsScriptDtos,
	getModifyUnityViewTagsScriptDtos,
};
