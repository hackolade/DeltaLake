const {prepareScript, generateFullEntityName} = require("../generalHelper");
const {EntitiesThatSupportComments} = require("../../../enums/entityType");
const {wrapInSingleQuotes} = require("../../generalHelper");

const getUpdatedCommentOnCollectionScript = (collection, ddlProvider) => {
    const descriptionInfo = collection?.role.compMod?.description;
    if (!descriptionInfo) {
        return '';
    }

    const {old: oldComment, new: newComment} = descriptionInfo;
    if (!newComment || newComment === oldComment) {
        return '';
    }

    const scriptGenerationConfig = {
        entityType: EntitiesThatSupportComments.TABLE,
        entityName: generateFullEntityName(collection),
        comment: wrapInSingleQuotes(newComment),
    }
    return ddlProvider.updateComment(scriptGenerationConfig);
}

const getDeletedCommentOnCollectionScript = (collection, ddlProvider) => {
    const descriptionInfo = collection?.role.compMod?.description;
    if (!descriptionInfo) {
        return '';
    }

    const {old: oldComment, new: newComment} = descriptionInfo;
    if (!oldComment || newComment) {
        return '';
    }

    const scriptGenerationConfig = {
        entityType: EntitiesThatSupportComments.TABLE,
        entityName: generateFullEntityName(collection),
    }
    return ddlProvider.dropComment(scriptGenerationConfig);
}



/**
 * @return {(x: Object) => Array<string>}
 * */
const getModifyCollectionCommentsScripts = (ddlProvider) => collection => {
    const updatedCommentScript = getUpdatedCommentOnCollectionScript(collection, ddlProvider);
    const deletedCommentScript = getDeletedCommentOnCollectionScript(collection, ddlProvider);

    return prepareScript(
        updatedCommentScript,
        deletedCommentScript
    );
};

module.exports = {
    getModifyCollectionCommentsScripts
}
