const {generateFullEntityName} = require("../generalHelper");
const {wrapInTicks} = require("../../generalHelper");

/**
 * @param columnName {string}
 * @return string
 * */
const getCheckConstraintNameForDdlProvider = (columnName) => {
    const columnNameNoTicks = columnName.replaceAll('`', '');
    const constraintName = `${columnNameNoTicks}_constraint`;
    return wrapInTicks(constraintName);
}


const getModifyCheckConstraintsScripts = (_) => (collection, ddlProvider) => {
    const fullTableName = generateFullEntityName(collection);

    const addCheckConstraintsScripts = _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const currentCheckConstraintOnColumn = jsonSchema.check;
            const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
            return currentCheckConstraintOnColumn && !previousCheckConstraintOnColumn;
        })
        .map(([columnName, jsonSchema]) => {
            const constraintName = getCheckConstraintNameForDdlProvider(columnName);
            return ddlProvider.setCheckConstraint(fullTableName, constraintName, jsonSchema.check);
        });

    const modifyCheckConstraintsScripts = _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const currentCheckConstraintOnColumn = jsonSchema.check;
            const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
            return currentCheckConstraintOnColumn && previousCheckConstraintOnColumn
                && currentCheckConstraintOnColumn !== previousCheckConstraintOnColumn;
        })
        .map(([columnName, jsonSchema]) => {
            const oldColumnName = jsonSchema.compMod.oldField.name;
            const oldConstraintName = getCheckConstraintNameForDdlProvider(oldColumnName);
            const dropOldConstraint = ddlProvider.dropCheckConstraint(fullTableName, oldConstraintName);

            const newConstraintName = getCheckConstraintNameForDdlProvider(columnName);
            const createNewConstraint = ddlProvider.setCheckConstraint(fullTableName, newConstraintName, jsonSchema.check);

            return [dropOldConstraint, createNewConstraint];
        })
        .flat();

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
        });

    return [...addCheckConstraintsScripts, ...modifyCheckConstraintsScripts, ...removeCheckConstraintScripts];
}

module.exports = {
    getModifyCheckConstraintsScripts,
}
