const {generateFullEntityName, wrapInTicks} = require("../../../utils/general");
const {AlterScriptDto} = require("../types/AlterScriptDto");

/**
 * @param columnName {string}
 * @return string
 * */
const getCheckConstraintNameForDdlProvider = (columnName) => {
    const columnNameNoTicks = columnName.replaceAll('`', '');
    const constraintName = `${columnNameNoTicks}_constraint`;
    return wrapInTicks(constraintName);
}

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getModifyCheckConstraintsScriptDtos = (_, ddlProvider) => (collection) => {
    const fullTableName = generateFullEntityName(collection);

    const addCheckConstraintsScriptDtos = _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const currentCheckConstraintOnColumn = jsonSchema.check;
            const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
            return currentCheckConstraintOnColumn && !previousCheckConstraintOnColumn;
        })
        .map(([columnName, jsonSchema]) => {
            const constraintName = getCheckConstraintNameForDdlProvider(columnName);
            return ddlProvider.setCheckConstraint(fullTableName, constraintName, jsonSchema.check);
        })
        .map(script => AlterScriptDto.getInstance([script], true, false));

    const modifyCheckConstraintsScripts = _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const currentCheckConstraintOnColumn = jsonSchema.check;
            const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
            return currentCheckConstraintOnColumn && previousCheckConstraintOnColumn
                && currentCheckConstraintOnColumn !== previousCheckConstraintOnColumn;
        })
        .flatMap(([columnName, jsonSchema]) => {
            const oldColumnName = jsonSchema.compMod.oldField.name;
            const oldConstraintName = getCheckConstraintNameForDdlProvider(oldColumnName);
            const dropOldConstraint = ddlProvider.dropCheckConstraint(fullTableName, oldConstraintName);

            const newConstraintName = getCheckConstraintNameForDdlProvider(columnName);
            const createNewConstraint = ddlProvider.setCheckConstraint(fullTableName, newConstraintName, jsonSchema.check);

            return [
                AlterScriptDto.getInstance([dropOldConstraint], true, true),
                AlterScriptDto.getInstance([createNewConstraint], true, false)
            ];
        });

    const removeCheckConstraintScripts = _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const currentCheckConstraintOnColumn = jsonSchema.check;
            const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
            return previousCheckConstraintOnColumn && !currentCheckConstraintOnColumn;
        })
        .map(([name]) => {
            const constraintName = getCheckConstraintNameForDdlProvider(name);
            return ddlProvider.dropCheckConstraint(fullTableName, constraintName);
        })
        .map(script => AlterScriptDto.getInstance([script], true, true));

    return [
        ...addCheckConstraintsScriptDtos,
        ...modifyCheckConstraintsScripts,
        ...removeCheckConstraintScripts
    ].filter(Boolean);
}

module.exports = {
    getModifyCheckConstraintsScriptDtos,
}
