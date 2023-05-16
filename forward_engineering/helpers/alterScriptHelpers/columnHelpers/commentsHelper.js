const {generateFullEntityName} = require("../../../utils/generalUtils");
const {prepareName, wrapInSingleQuotes} = require("../../generalHelper");

const getUpdatedCommentOnColumnScripts = (_, ddlProvider) => (collection) => {
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

const getDeletedCommentOnColumnScripts = (_, ddlProvider) => (collection) => {
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

const getModifiedCommentOnColumnScripts = (_, ddlProvider) => (collection) => {
    const updatedCommentScripts = getUpdatedCommentOnColumnScripts(_, ddlProvider)(collection);
    const deletedCommentScripts = getDeletedCommentOnColumnScripts(_, ddlProvider)(collection);
    return [...updatedCommentScripts, ...deletedCommentScripts];
}

module.exports = {
    getModifiedCommentOnColumnScripts
}
