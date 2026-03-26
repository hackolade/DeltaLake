const { EntitiesThatSupportComments } = require('../../../enums/entityType');
const { replaceSpaceWithUnderscore, wrapInSingleQuotes } = require('../../../utils/general');
const { AlterScriptDto } = require('../../types/AlterScriptDto');
const { prepareName } = require('../../../../shared/general');

/**
 * @return {{
 *     old?: string,
 *     new?: string,
 * }}
 * */
const extractDescription = container => {
	return container?.role?.compMod?.description || {};
};

/**
 * @return {(container: Object) => AlterScriptDto | undefined}
 * */
const getUpsertCommentsScriptDto = ddlProvider => container => {
	const description = extractDescription(container);
	if (description.new && description.new !== description.old) {
		const schemaName = prepareName(container.role.code || container.role.name);
		const script = ddlProvider.updateComment({
			entityType: EntitiesThatSupportComments.SCHEMA,
			entityName: replaceSpaceWithUnderscore(schemaName),
			comment: wrapInSingleQuotes(description.new),
		});
		return {
			scripts: [
				{
					isDropScript: false,
					script,
				},
			],
		};
	}
	return undefined;
};

/**
 * @return {(container: Object) => AlterScriptDto | undefined}
 * */
const getDropCommentsScriptDto = ddlProvider => container => {
	const description = extractDescription(container);
	if (description.old && !description.new) {
		const schemaName = prepareName(container.role.code || container.role.name);
		const script = ddlProvider.dropComment({
			entityType: EntitiesThatSupportComments.SCHEMA,
			entityName: replaceSpaceWithUnderscore(schemaName),
		});
		return {
			scripts: [
				{
					isDropScript: true,
					script,
				},
			],
		};
	}
	return undefined;
};

/**
 * @return {(container: Object) => Array<AlterScriptDto>}
 * */
const getAlterCommentsScriptDtos = ddlProvider => container => {
	const upsertCommentScriptDto = getUpsertCommentsScriptDto(ddlProvider)(container);
	const dropCommentScriptDto = getDropCommentsScriptDto(ddlProvider)(container);
	return [upsertCommentScriptDto, dropCommentScriptDto].filter(Boolean);
};

module.exports = {
	getAlterCommentsScriptDtos,
};
