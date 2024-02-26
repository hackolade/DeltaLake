const { getUnityTagsFromCompMod, getUnsetTagsNamesParamString } = require('../../../helpers/unityTagsHelper');
const { buildTagPairs } = require('../../../helpers/unityTagsHelper');
const { AlterScriptDto } = require('../../types/AlterScriptDto');

/**
 * @callback GetAlterScriptDtoFunction
 * @param {Object} entityData
 * @param {string} tableName
 * @param {string} columnName
 * @returns Array<AlterScriptDto>
 */

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getSetUnityColumnTagsDtos = ddlProvider => (entityData, tableName, columnName) => {
	const unityTags = {
		new: entityData?.properties?.[columnName]?.unityColumnTags,
		old: entityData?.role?.properties?.[columnName]?.unityColumnTags,
	};
	const newUnityTags = unityTags.new || [];
	const oldUnityTags = unityTags.old || [];

	const setTags = getUnityTagsFromCompMod(newUnityTags, oldUnityTags);

	if (!setTags.length) {
		return [];
	}

	const script = ddlProvider.setColumnTags(tableName, columnName, buildTagPairs(setTags));

	return [AlterScriptDto.getInstance([script], true, false)];
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getUnsetUnityColumnTagsScriptsDtosFrom = ddlProvider => (entityData, tableName, columnName) => {
	const unityTags = {
		new: entityData?.properties?.[columnName]?.unityColumnTags,
		old: entityData?.role?.properties?.[columnName]?.unityColumnTags,
	};
	const newUnityTags = unityTags.new || [];
	const oldUnityTags = unityTags.old || [];

	const unsetTags = getUnityTagsFromCompMod(oldUnityTags, newUnityTags);

	if (!unsetTags.length) {
		return [];
	}

	const script = ddlProvider.unsetColumnTags(tableName, columnName, getUnsetTagsNamesParamString(unsetTags));

	return [AlterScriptDto.getInstance([script], true, true)];
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getModifyUnityColumnTagsScriptDtos = ddlProvider => (entityData, tableName, columnName) => {
	const unsetUnityTagsScriptDtosFromTable = getUnsetUnityColumnTagsScriptsDtosFrom(ddlProvider)(
		entityData,
		tableName,
		columnName,
	);
	const setUnityTagsScriptDtosFromTable = getSetUnityColumnTagsDtos(ddlProvider)(entityData, tableName, columnName);

	return [...unsetUnityTagsScriptDtosFromTable, ...setUnityTagsScriptDtosFromTable].filter(Boolean);
};

module.exports = {
	getModifyUnityColumnTagsScriptDtos,
};
