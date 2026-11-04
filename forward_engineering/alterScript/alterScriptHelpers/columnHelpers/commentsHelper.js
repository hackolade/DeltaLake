const _ = require('lodash');
const { generateFullEntityName, wrapInSingleQuotes } = require('../../../utils/general');
const { AlterScriptDto } = require('../../types/AlterScriptDto');
const { prepareName } = require('../../../../shared/general');

/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getUpdatedCommentOnColumnScriptDtos =
	ddlProvider =>
	({ collection, dbVersion }) => {
		return _.toPairs(collection.properties)
			.filter(([name, jsonSchema]) => {
				const newComment = jsonSchema.description;
				const oldName = jsonSchema.compMod.oldField.name;
				const oldComment = collection.role.properties[oldName]?.description;
				return newComment && (!oldComment || newComment !== oldComment);
			})
			.map(([name, jsonSchema]) => {
				const newComment = jsonSchema.description;
				const scriptGenerationConfig = {
					fullTableName: generateFullEntityName({ entity: collection, dbVersion }),
					columnName: prepareName(name),
					comment: wrapInSingleQuotes(newComment),
				};
				const isActivated = collection.role?.isActivated !== false && jsonSchema.isActivated !== false;
				return AlterScriptDto.getInstance(
					[ddlProvider.updateCommentOnColumn(scriptGenerationConfig)],
					isActivated,
					false,
				);
			})
			.filter(Boolean);
	};

/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getDeletedCommentOnColumnScripts =
	ddlProvider =>
	({ collection, dbVersion }) => {
		return _.toPairs(collection.properties)
			.filter(([name, jsonSchema]) => {
				const newComment = jsonSchema.description;
				const oldName = jsonSchema.compMod.oldField.name;
				const oldComment = collection.role.properties[oldName]?.description;
				return oldComment && !newComment;
			})
			.map(([name, jsonSchema]) => {
				const scriptGenerationConfig = {
					fullTableName: generateFullEntityName({ entity: collection, dbVersion }),
					columnName: prepareName(name),
				};
				const isActivated = collection.role?.isActivated !== false && jsonSchema.isActivated !== false;
				return AlterScriptDto.getInstance(
					[ddlProvider.dropCommentOnColumn(scriptGenerationConfig)],
					isActivated,
					true,
				);
			})
			.filter(Boolean);
	};

/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getModifiedCommentOnColumnScriptDtos =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const updatedCommentScripts = getUpdatedCommentOnColumnScriptDtos(ddlProvider)({ collection, dbVersion });
		const deletedCommentScripts = getDeletedCommentOnColumnScripts(ddlProvider)({ collection, dbVersion });
		return [...updatedCommentScripts, ...deletedCommentScripts];
	};

module.exports = {
	getModifiedCommentOnColumnScriptDtos,
};
