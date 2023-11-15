const { generateFullEntityName, wrapInTicks } = require('../../../utils/general');
const { AlterScriptDto } = require('../../types/AlterScriptDto');

/**
 * @typedef GetAlterScriptDtoFunction
 * @param fullTableName {string}
 * @param collection {Object}
 * @returns Array<AlterScriptDto>
 */

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
 * @param ddlProvider {Object}
 * @param _ {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getAddCheckConstraintsScriptsDtosFromColumns = (ddlProvider, _) => (fullTableName, collection) => {
    return _.toPairs(collection.properties)
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
};

/**
 * @param ddlProvider {Object}
 * @param _ {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getRemoveCheckConstraintsScriptsDtosFromColumns = (ddlProvider, _) => (fullTableName, collection) => {
    return _.toPairs(collection.properties)
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
}

/**
 * @param ddlProvider {Object}
 * @param _ {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getModifyCheckConstraintsScriptDtosFromColumns = (ddlProvider, _) => (fullTableName, collection) => {
    return _.toPairs(collection.properties)
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
};

getAddCheckConstraintsScriptsDtosFromTable = (ddlProvider) => (fullTableName, newCheckConstraints) => {
    return newCheckConstraints
        .map(newCheckConstraint => {
            return ddlProvider.setCheckConstraint(
                fullTableName,
                newCheckConstraint.chkConstrName,
                newCheckConstraint.constrExpression
            );
        })
        .filter(Boolean)
        .map(script => AlterScriptDto.getInstance([script], true, false));
};

getRemoveCheckConstraintsScriptsDtosFromTable = (ddlProvider) => (fullTableName, oldCheckConstraints) => {
    return oldCheckConstraints
        .map(oldCheckConstraint => {
            return ddlProvider.dropCheckConstraint(
                fullTableName,
                oldCheckConstraint.chkConstrName
            );
        })
        .filter(Boolean)
        .map(script => AlterScriptDto.getInstance([script], true, true));
};

/**
 * @param ddlProvider {Object}
 * @param _ {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getAllModifyCheckConstraintsScriptDtos = (ddlProvider, _) => (fullTableName, collection) => {
    const checkConstraintsFromTableCompMod = collection?.role?.compMod?.chkConstr || {};
    const newTableCheckConstraints = checkConstraintsFromTableCompMod.new || [];
    const oldTableCheckConstraints = checkConstraintsFromTableCompMod.old || [];

    const modifyCheckConstraintsScriptDtosFromColumns = getModifyCheckConstraintsScriptDtosFromColumns(ddlProvider, _)(fullTableName, collection);
    const removeCheckConstraintsScriptDtosFromTable = getRemoveCheckConstraintsScriptsDtosFromTable(ddlProvider)(fullTableName, oldTableCheckConstraints);
    const addCheckConstraintsScriptDtosFromTable = getAddCheckConstraintsScriptsDtosFromTable(ddlProvider)(fullTableName, newTableCheckConstraints);

    return [
        ...removeCheckConstraintsScriptDtosFromTable,
        ...addCheckConstraintsScriptDtosFromTable,
        ...modifyCheckConstraintsScriptDtosFromColumns
    ];
};

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getModifyCheckConstraintsScriptDtos = (_, ddlProvider) => (collection) => {
    const fullTableName = generateFullEntityName(collection);
    const pairedProperties = _.toPairs(collection.properties);

    const addCheckConstraintsScriptDtos = getAddCheckConstraintsScriptsDtosFromColumns(ddlProvider, _)(fullTableName, collection);
    const modifyCheckConstraintsScripts = getAllModifyCheckConstraintsScriptDtos(ddlProvider, _)(fullTableName, collection);
    const removeCheckConstraintScripts = getRemoveCheckConstraintsScriptsDtosFromColumns(ddlProvider, _)(fullTableName, collection);

    return [
        ...addCheckConstraintsScriptDtos,
        ...modifyCheckConstraintsScripts,
        ...removeCheckConstraintScripts
    ].filter(Boolean);
};

module.exports = {
    getModifyCheckConstraintsScriptDtos,
};
