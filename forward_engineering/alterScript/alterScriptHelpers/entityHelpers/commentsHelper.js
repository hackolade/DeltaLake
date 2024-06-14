const { generateFullEntityName, wrapInSingleQuotes } = require('../../../utils/general');
const { EntitiesThatSupportComments } = require('../../../enums/entityType');
const { AlterScriptDto } = require('../../types/AlterScriptDto');

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => AlterScriptDto | undefined}
 * */
const getUpdatedCommentOnCollectionScriptDto =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const descriptionInfo = collection?.role?.compMod?.description;
		if (!descriptionInfo) {
			return undefined;
		}

		const { old: oldComment, new: newComment } = descriptionInfo;
		if (!newComment || newComment === oldComment) {
			return undefined;
		}

		const scriptGenerationConfig = {
			entityType: EntitiesThatSupportComments.TABLE,
			entityName: generateFullEntityName({ entity: collection, dbVersion }),
			comment: wrapInSingleQuotes(newComment),
		};
		const script = ddlProvider.updateComment(scriptGenerationConfig);
		return {
			scripts: [
				{
					isDropScript: false,
					script,
				},
			],
		};
	};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => AlterScriptDto | undefined}
 * */
const getDeletedCommentOnCollectionScriptDto =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const descriptionInfo = collection?.role?.compMod?.description;
		if (!descriptionInfo) {
			return undefined;
		}

		const { old: oldComment, new: newComment } = descriptionInfo;
		if (!oldComment || newComment) {
			return undefined;
		}

		const scriptGenerationConfig = {
			entityType: EntitiesThatSupportComments.TABLE,
			entityName: generateFullEntityName({ entity: collection, dbVersion }),
		};
		const script = ddlProvider.dropComment(scriptGenerationConfig);
		return {
			scripts: [
				{
					isDropScript: false,
					script,
				},
			],
		};
	};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getModifyCollectionCommentsScripts =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const updatedCommentScriptDto = getUpdatedCommentOnCollectionScriptDto(ddlProvider)({ collection, dbVersion });
		const deletedCommentScriptDto = getDeletedCommentOnCollectionScriptDto(ddlProvider)({ collection, dbVersion });

		return [updatedCommentScriptDto, deletedCommentScriptDto].filter(Boolean);
	};

module.exports = {
	getModifyCollectionCommentsScripts,
};
