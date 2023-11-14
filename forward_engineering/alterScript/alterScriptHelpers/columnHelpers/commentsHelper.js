const {generateFullEntityName, prepareName, wrapInSingleQuotes} = require("../../../utils/general");
const {AlterScriptDto} = require("../../types/AlterScriptDto");

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getUpdatedCommentOnColumnScriptDtos = (_, ddlProvider) => (collection) => {
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
        })
        .map(script => AlterScriptDto.getInstance([script], true, false))
        .filter(Boolean);
}

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
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
        })
        .map(script => AlterScriptDto.getInstance([script], true, true))
        .filter(Boolean);
}

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getModifiedCommentOnColumnScriptDtos = (_, ddlProvider) => (collection) => {
    const updatedCommentScripts = getUpdatedCommentOnColumnScriptDtos(_, ddlProvider)(collection);
    const deletedCommentScripts = getDeletedCommentOnColumnScripts(_, ddlProvider)(collection);
    return [...updatedCommentScripts, ...deletedCommentScripts];
}

module.exports = {
    getModifiedCommentOnColumnScriptDtos
}
