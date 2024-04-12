const { AlterScriptDto } = require('../../types/AlterScriptDto');
const {generateFullEntityName, prepareName} = require("../../../utils/general");

/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getUpdatedDefaultColumnValueScriptDtos = (_, ddlProvider) => ({ collection, dbVersion }) => {
    return _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const newDefaultValue = jsonSchema.default;
            const oldName = jsonSchema.compMod.oldField.name;
            const oldDefaultValue = collection.role.properties[oldName]?.default;
            return newDefaultValue && (!oldDefaultValue || newDefaultValue !== oldDefaultValue);
        })
        .map(([name, jsonSchema]) => {
            const newDefaultValue = jsonSchema.default;
            const scriptGenerationConfig = {
                fullTableName: generateFullEntityName({ entity: collection, dbVersion }),
                columnName: prepareName(name),
                defaultValue: newDefaultValue,
            }
            return ddlProvider.updateColumnDefaultValue(scriptGenerationConfig);
        })
        .map(script => AlterScriptDto.getInstance([script], true, false))
        .filter(Boolean);
}

/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getDeletedDefaultColumnValueScriptDtos = (_, ddlProvider) => ({ collection, dbVersion }) => {
    return _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const newDefault = jsonSchema.default;
            const oldName = jsonSchema.compMod.oldField.name;
            const oldDefault = collection.role.properties[oldName]?.default;
            return oldDefault && !newDefault;
        })
        .map(([name, jsonSchema]) => {
            const scriptGenerationConfig = {
                fullTableName: generateFullEntityName({ entity: collection, dbVersion }),
                columnName: prepareName(name),
            }
            return ddlProvider.dropColumnDefaultValue(scriptGenerationConfig);
        })
        .map(script => AlterScriptDto.getInstance([script], true, true))
        .filter(Boolean);
}


/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getModifiedDefaultColumnValueScriptDtos = (_, ddlProvider) => ({ collection, dbVersion }) => {
    const updatedDefaultValuesScriptDtos = getUpdatedDefaultColumnValueScriptDtos(_, ddlProvider)({ collection, dbVersion });
    const dropDefaultValuesScriptDtos = getDeletedDefaultColumnValueScriptDtos(_, ddlProvider)({ collection, dbVersion });
    return [
        ...updatedDefaultValuesScriptDtos,
        ...dropDefaultValuesScriptDtos,
    ];
}

module.exports = {
    getModifiedDefaultColumnValueScriptDtos,
}
