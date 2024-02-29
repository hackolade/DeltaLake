const { getUnityTagsFromCompMod, getUnsetTagsNamesParamString } = require('../../../helpers/unityTagsHelper');
const { buildTagPairs } = require('../../../helpers/unityTagsHelper');
const { AlterScriptDto } = require('../../types/AlterScriptDto');

/**
 * @callback GetAlterScriptDtoFunction
 * @param {{ entityData: Object, tableName: string, columnName: string }} args
 * @returns Array<AlterScriptDto>
 */

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getSetUnityColumnTagsDtos = ({ ddlProvider }) =>
	({ entityData, tableName, columnName }) => {
		const unityTags = {
			new: entityData?.properties?.[columnName]?.unityColumnTags,
			old: entityData?.role?.properties?.[columnName]?.unityColumnTags,
		};
		const newUnityTags = unityTags.new || [];
		const oldUnityTags = unityTags.old || [];

		const setTags = getUnityTagsFromCompMod({ tagsToFilter: newUnityTags, filterBy: oldUnityTags});

		if (!setTags.length) {
			return [];
		}

		const script = ddlProvider.setColumnTags({ tableName, columnName, tags: buildTagPairs(setTags) });

		return [AlterScriptDto.getInstance([script], true, false)];
	};//

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getUnsetUnityColumnTagsScriptsDtosFrom = ({ ddlProvider }) =>
	({ entityData, tableName, columnName }) => {
		const unityTags = {
			new: entityData?.properties?.[columnName]?.unityColumnTags,
			old: entityData?.role?.properties?.[columnName]?.unityColumnTags,
		};
		const newUnityTags = unityTags.new || [];
		const oldUnityTags = unityTags.old || [];

		const unsetTags = getUnityTagsFromCompMod({ tagsToFilter: oldUnityTags, filterBy: newUnityTags});

		if (!unsetTags.length) {
			return [];
		}

		const script = ddlProvider.unsetColumnTags({ tableName, columnName, tags: getUnsetTagsNamesParamString({ unsetTags }) });

		return [AlterScriptDto.getInstance([script], true, true)];
	};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getModifyUnityColumnTagsScriptDtos = ({ ddlProvider }) =>
	({ entityData, tableName, columnName }) => {
		const unsetUnityTagsScriptDtosFromTable = getUnsetUnityColumnTagsScriptsDtosFrom({ ddlProvider })({
			entityData,
			tableName,
			columnName,
		});

		const setUnityTagsScriptDtosFromTable = getSetUnityColumnTagsDtos({ ddlProvider })({
			entityData,
			tableName,
			columnName,
		});

		return [...unsetUnityTagsScriptDtosFromTable, ...setUnityTagsScriptDtosFromTable].filter(Boolean);
	};

module.exports = {
	getModifyUnityColumnTagsScriptDtos,
};
