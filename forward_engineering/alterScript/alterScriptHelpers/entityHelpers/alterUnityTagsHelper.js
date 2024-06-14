const { getUnityTagsFromCompMod, getUnsetTagsNamesParamString } = require('../../../helpers/unityTagsHelper');
const { buildTagPairs } = require('../../../helpers/unityTagsHelper');
const { AlterScriptDto } = require('../../types/AlterScriptDto');

/**
 * @callback GetAlterScriptDtoFunction
 * @param {{ entityData: Object, name: string }} args
 * @returns Array<AlterScriptDto>
 */

/**
 * @callback GetAlterScriptDtoFunctionForViews
 * @param {{ viewData: Object, viewName: string }} args
 * @returns Array<AlterScriptDto>
 */

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getSetUnityEntityTagsDtos =
	({ ddlProvider }) =>
	({ entityData, name }) => {
		const unityTags = entityData?.role?.compMod?.unityEntityTags || {};
		const newUnityTags = unityTags.new || [];
		const oldUnityTags = unityTags.old || [];

		const setTags = getUnityTagsFromCompMod({ tagsToFilter: newUnityTags, filterBy: oldUnityTags });

		if (!setTags.length) {
			return [];
		}

		const script = ddlProvider.setEntityTags({ name, tags: buildTagPairs(setTags) });

		return [AlterScriptDto.getInstance([script], true, false)];
	};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getUnsetUnityEntityTagsScriptsDtosFrom =
	({ ddlProvider }) =>
	({ entityData, name }) => {
		const unityTags = entityData?.role?.compMod?.unityEntityTags || {};
		const newUnityTags = unityTags.new || [];
		const oldUnityTags = unityTags.old || [];

		const unsetTags = getUnityTagsFromCompMod({ tagsToFilter: oldUnityTags, filterBy: newUnityTags });

		if (!unsetTags.length) {
			return [];
		}

		const script = ddlProvider.unsetEntityTags({ name, tags: getUnsetTagsNamesParamString({ unsetTags }) });

		return [AlterScriptDto.getInstance([script], true, true)];
	};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getModifyUnityEntityTagsScriptDtos =
	({ ddlProvider }) =>
	({ entityData, name }) => {
		const unsetUnityTagsScriptDtosFromTable = getUnsetUnityEntityTagsScriptsDtosFrom({ ddlProvider })({
			entityData,
			name,
		});
		const setUnityTagsScriptDtosFromTable = getSetUnityEntityTagsDtos({ ddlProvider })({ entityData, name });

		return [...unsetUnityTagsScriptDtosFromTable, ...setUnityTagsScriptDtosFromTable].filter(Boolean);
	};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunctionForViews}
 */
const getSetUnityViewTagsDtos =
	({ ddlProvider }) =>
	({ viewData, viewName }) => {
		const unityTags = viewData?.role?.compMod?.unityViewTags || {};
		const newUnityTags = unityTags.new || [];
		const oldUnityTags = unityTags.old || [];

		const setTags = getUnityTagsFromCompMod({ tagsToFilter: newUnityTags, filterBy: oldUnityTags });

		if (!setTags.length) {
			return [];
		}

		const script = ddlProvider.setViewTags({ name: viewName, tags: buildTagPairs(setTags) });

		return [AlterScriptDto.getInstance([script], true, false)];
	};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunctionForViews}
 */
const getUnsetUnityViewTagsScriptsDtosFrom =
	({ ddlProvider }) =>
	({ viewData, viewName }) => {
		const unityTags = viewData?.role?.compMod?.unityViewTags || {};
		const newUnityTags = unityTags.new || [];
		const oldUnityTags = unityTags.old || [];

		const unsetTags = getUnityTagsFromCompMod({ tagsToFilter: oldUnityTags, filterBy: newUnityTags });

		if (!unsetTags.length) {
			return [];
		}

		const script = ddlProvider.unsetViewTags({ name: viewName, tags: getUnsetTagsNamesParamString({ unsetTags }) });

		return [AlterScriptDto.getInstance([script], true, true)];
	};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunctionForViews}
 */
const getModifyUnityViewTagsScriptDtos =
	({ ddlProvider }) =>
	({ viewData, viewName }) => {
		const unsetUnityTagsScriptDtosFromTable = getUnsetUnityViewTagsScriptsDtosFrom({ ddlProvider })({
			viewData,
			viewName,
		});
		const setUnityTagsScriptDtosFromTable = getSetUnityViewTagsDtos({ ddlProvider })({ viewData, viewName });

		return [...unsetUnityTagsScriptDtosFromTable, ...setUnityTagsScriptDtosFromTable].filter(Boolean);
	};

module.exports = {
	getModifyUnityEntityTagsScriptDtos,
	getModifyUnityViewTagsScriptDtos,
};
