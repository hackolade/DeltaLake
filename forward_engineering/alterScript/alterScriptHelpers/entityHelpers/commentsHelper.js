const {generateFullEntityName, wrapInSingleQuotes} = require("../../../utils/general");
const {EntitiesThatSupportComments} = require("../../../enums/entityType");
const {AlterScriptDto} = require("../../types/AlterScriptDto");


/**
 * @return {(collection: Object) => AlterScriptDto | undefined}
 * */
const getUpdatedCommentOnCollectionScriptDto = (ddlProvider) => (collection) => {
    const descriptionInfo = collection?.role.compMod?.description;
    if (!descriptionInfo) {
        return undefined;
    }

    const {old: oldComment, new: newComment} = descriptionInfo;
    if (!newComment || newComment === oldComment) {
        return undefined;
    }

    const scriptGenerationConfig = {
        entityType: EntitiesThatSupportComments.TABLE,
        entityName: generateFullEntityName(collection),
        comment: wrapInSingleQuotes(newComment),
    }
    const script = ddlProvider.updateComment(scriptGenerationConfig);
    return {
        scripts: [{
            isDropScript: false,
            script,
        }]
    }
}

/**
 * @return {(collection: Object) => AlterScriptDto | undefined}
 * */
const getDeletedCommentOnCollectionScriptDto = (ddlProvider) => (collection) => {
    const descriptionInfo = collection?.role.compMod?.description;
    if (!descriptionInfo) {
        return undefined;
    }

    const {old: oldComment, new: newComment} = descriptionInfo;
    if (!oldComment || newComment) {
        return undefined;
    }

    const scriptGenerationConfig = {
        entityType: EntitiesThatSupportComments.TABLE,
        entityName: generateFullEntityName(collection),
    }
    const script = ddlProvider.dropComment(scriptGenerationConfig);
    return {
        scripts: [{
            isDropScript: false,
            script,
        }]
    }
}


/**
 * @return {(x: Object) => Array<AlterScriptDto>}
 * */
const getModifyCollectionCommentsScripts = (ddlProvider) => collection => {
    const updatedCommentScriptDto = getUpdatedCommentOnCollectionScriptDto(ddlProvider)(collection);
    const deletedCommentScriptDto = getDeletedCommentOnCollectionScriptDto(ddlProvider)(collection);

    return [
        updatedCommentScriptDto,
        deletedCommentScriptDto
    ].filter(Boolean);
};

module.exports = {
    getModifyCollectionCommentsScripts
}
