const {EntitiesThatSupportComments} = require("../../../enums/entityType");
const {replaceSpaceWithUnderscore, wrapInSingleQuotes} = require("../../../utils/generalUtils");

/**
 * @return {{
 *     old?: string,
 *     new?: string,
 * }}
 * */
const extractDescription = (container) => {
    return container?.role?.compMod?.description || {};
}

/**
 * @return string
 * */
const getUpsertCommentsScript = (container, ddlProvider) => {
    const description = extractDescription(container);
    if (description.new && description.new !== description.old) {
        return ddlProvider.updateComment({
            entityType: EntitiesThatSupportComments.SCHEMA,
            entityName: replaceSpaceWithUnderscore(container.role.name),
            comment: wrapInSingleQuotes(description.new),
        })
    }
    return '';
}

/**
 * @return string
 * */
const getDropCommentsScript = (container, ddlProvider) => {
    const description = extractDescription(container);
    if (description.old && !description.new) {
        return ddlProvider.dropComment({
            entityType: EntitiesThatSupportComments.SCHEMA,
            entityName: replaceSpaceWithUnderscore(container.role.name)
        })
    }
    return '';
}

const getAlterCommentsScript = (ddlProvider) => (container) => {
    const upsertCommentScript = getUpsertCommentsScript(container, ddlProvider);
    const dropCommentScript = getDropCommentsScript(container, ddlProvider);
    return [
        upsertCommentScript,
        dropCommentScript
    ].filter(Boolean).join('\n\n');
}

module.exports = {
    getAlterCommentsScript,
}
