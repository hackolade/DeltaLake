const { generateFullEntityName, wrapInTicks } = require('../../../utils/general');
const { AlterScriptDto } = require('../../types/AlterScriptDto');

/**
 * @typedef GetAlterScriptDtoFunction
 * @param fullTableName {string}
 * @param collection {Object}
 * @returns Array<AlterScriptDto>
 */

/**
 * @param constraintName {string}
 * @param columnName {string}
 * @return string
 * */
const getCheckConstraintNameForDdlProvider = (constraintName = '', columnName) => {
    const columnNameNoTicks = columnName.replaceAll('`', '');
    const constraintNameNoTicks = constraintName.replaceAll('`', '');
    const appliedConstraintName = constraintNameNoTicks || `${columnNameNoTicks}_constraint`;

    return wrapInTicks(appliedConstraintName);
};

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
            const constraintName = getCheckConstraintNameForDdlProvider(jsonSchema.checkConstraintName, columnName);
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
            const oldConstraintName = collection.role.properties[name]?.checkConstraintName;
            const constraintName = getCheckConstraintNameForDdlProvider(oldConstraintName, name);
            return ddlProvider.dropCheckConstraint(fullTableName, constraintName);
        })
        .map(script => AlterScriptDto.getInstance([script], true, true));
};

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
            const oldConstraintName = collection.role.properties[oldColumnName]?.checkConstraintName;
            const constraintName = getCheckConstraintNameForDdlProvider(oldConstraintName, oldColumnName);
            const dropOldConstraint = ddlProvider.dropCheckConstraint(fullTableName, constraintName);

            const newConstraintName = getCheckConstraintNameForDdlProvider(jsonSchema.checkConstraintName, columnName);
            const createNewConstraint = ddlProvider.setCheckConstraint(fullTableName, newConstraintName, jsonSchema.check);

            return [
                AlterScriptDto.getInstance([dropOldConstraint], true, true),
                AlterScriptDto.getInstance([createNewConstraint], true, false)
            ];
        });
};

const didCheckConstraintsChange = (_) => (collection) => {
    const checkConstraints = collection?.role?.compMod?.chkConstr || {};
    const newCheckConstraints = checkConstraints.new || [];
    const oldCheckConstraints = checkConstraints.old || [];

    if (newCheckConstraints.length !== oldCheckConstraints.length) {
        return true;
    }

    if (newCheckConstraints.length === 0 && oldCheckConstraints.length === 0) {
        return false;
    }

    const areConstraintArraysEqual = _(oldCheckConstraints).differenceWith(newCheckConstraints, _.isEqual).isEmpty();

    return !areConstraintArraysEqual;
};

const getAddCheckConstraintsScriptsDtosFromTable = (ddlProvider) => (fullTableName, newCheckConstraints) => {
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

const getRemoveCheckConstraintsScriptsDtosFromTable = (ddlProvider) => (fullTableName, oldCheckConstraints) => {
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


    if (!didCheckConstraintsChange(_)(collection)) {
        return modifyCheckConstraintsScriptDtosFromColumns;
    }

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
        ...removeCheckConstraintScripts,
        ...modifyCheckConstraintsScripts,
        ...addCheckConstraintsScriptDtos
    ].filter(Boolean);
};

module.exports = {
    getModifyCheckConstraintsScriptDtos,
};
