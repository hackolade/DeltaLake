const {generateFullEntityName} = require("../generalHelper");
const {prepareName, wrapInSingleQuotes} = require("../../generalHelper");

const getUpdatedCommentOnColumnScripts = (_) => (collection, ddlProvider) => {
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
                fullTableName: generateFullEntityName(collection),
                columnName: prepareName(name),
                comment: wrapInSingleQuotes(newComment),
            }
            return ddlProvider.updateCommentOnColumn(scriptGenerationConfig);
        });
}

const getDeletedCommentOnColumnScripts = (_) => (collection, ddlProvider) => {
    return _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const newComment = jsonSchema.description;
            const oldName = jsonSchema.compMod.oldField.name;
            const oldComment = collection.role.properties[oldName]?.description;
            return oldComment && !newComment;
        })
        .map(([name, jsonSchema]) => {
            const scriptGenerationConfig = {
                fullTableName: generateFullEntityName(collection),
                columnName: prepareName(name),
            }
            return ddlProvider.dropCommentOnColumn(scriptGenerationConfig);
        });
}

const getModifiedCommentOnColumnScripts = (_) => (collection, ddlProvider) => {
    const updatedCommentScripts = getUpdatedCommentOnColumnScripts(_)(collection, ddlProvider);
    const deletedCommentScripts = getDeletedCommentOnColumnScripts(_)(collection, ddlProvider);
    return [...updatedCommentScripts, ...deletedCommentScripts];
}

module.exports = {
    getModifiedCommentOnColumnScripts
}
