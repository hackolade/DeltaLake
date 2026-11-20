const _ = require('lodash');
const { generateFullEntityName, wrapInSingleQuotes } = require('../../../utils/general');
const { AlterScriptDto } = require('../../types/AlterScriptDto');
const { prepareName } = require('../../../../shared/general');
const { EntitiesThatSupportComments } = require('../../../enums/entityType');

const getColumnCommentScript = ({ ddlProvider, fullTableName, columnName, comment, isView }) => {
	if (!isView) {
		return comment
			? ddlProvider.updateCommentOnColumn({ fullTableName, columnName, comment })
			: ddlProvider.dropCommentOnColumn({ fullTableName, columnName });
	}

	const scriptGenerationConfig = {
		entityType: EntitiesThatSupportComments.COLUMN,
		entityName: `${fullTableName}.${columnName}`,
	};

	return comment
		? ddlProvider.updateComment({ ...scriptGenerationConfig, comment })
		: ddlProvider.dropComment(scriptGenerationConfig);
};

/**
 * @return {({ collection, dbVersion, isView }: { collection: Object, dbVersion: string, isView?: boolean }) => Array<AlterScriptDto>}
 * */
const getUpdatedCommentOnColumnScriptDtos =
	ddlProvider =>
	({ collection, dbVersion, isView = false }) => {
		return _.toPairs(collection.properties)
			.filter(([name, jsonSchema]) => {
				const newComment = jsonSchema.description;
				const oldName = jsonSchema.compMod?.oldField?.name || name;
				const oldComment = collection.role.properties[oldName]?.description;
				return newComment && (!oldComment || newComment !== oldComment);
			})
			.map(([name, jsonSchema]) => {
				const newComment = jsonSchema.description;
				const fullTableName = generateFullEntityName({ entity: collection, dbVersion });
				const columnName = prepareName(name);
				const isActivated = collection.role?.isActivated !== false && jsonSchema.isActivated !== false;
				return AlterScriptDto.getInstance(
					[
						getColumnCommentScript({
							ddlProvider,
							fullTableName,
							columnName,
							comment: wrapInSingleQuotes(newComment),
							isView,
						}),
					],
					isActivated,
					false,
				);
			})
			.filter(Boolean);
	};

/**
 * @return {({ collection, dbVersion, isView }: { collection: Object, dbVersion: string, isView?: boolean }) => Array<AlterScriptDto>}
 * */
const getDeletedCommentOnColumnScripts =
	ddlProvider =>
	({ collection, dbVersion, isView = false }) => {
		return _.toPairs(collection.properties)
			.filter(([name, jsonSchema]) => {
				const newComment = jsonSchema.description;
				const oldName = jsonSchema.compMod?.oldField?.name || name;
				const oldComment = collection.role.properties[oldName]?.description;
				return oldComment && !newComment;
			})
			.map(([name, jsonSchema]) => {
				const fullTableName = generateFullEntityName({ entity: collection, dbVersion });
				const columnName = prepareName(name);
				const isActivated = collection.role?.isActivated !== false && jsonSchema.isActivated !== false;
				return AlterScriptDto.getInstance(
					[
						getColumnCommentScript({
							ddlProvider,
							fullTableName,
							columnName,
							isView,
						}),
					],
					isActivated,
					true,
				);
			})
			.filter(Boolean);
	};

/**
 * @return {({ collection, dbVersion, isView }: { collection: Object, dbVersion: string, isView?: boolean }) => Array<AlterScriptDto>}
 * */
const getModifiedCommentOnColumnScriptDtos =
	ddlProvider =>
	({ collection, dbVersion, isView = false }) => {
		const updatedCommentScripts = getUpdatedCommentOnColumnScriptDtos(ddlProvider)({
			collection,
			dbVersion,
			isView,
		});
		const deletedCommentScripts = getDeletedCommentOnColumnScripts(ddlProvider)({ collection, dbVersion, isView });
		return [...updatedCommentScripts, ...deletedCommentScripts];
	};

module.exports = {
	getModifiedCommentOnColumnScriptDtos,
};
