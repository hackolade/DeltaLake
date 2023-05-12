const {generateFullEntityName, getFullEntityName} = require("./generalHelper");
const {replaceSpaceWithUnderscore, getName, prepareName} = require("../generalHelper");


/**
 * @param modifiedEntities {Object[]}
 * @param id {string}
 * @return {Object | undefined}
 * */
const getEntityById = (modifiedEntities, id) => {
    return modifiedEntities.find(entity => entity.role?.id === id);
}

/**
 * @param entity {Object}
 * @return {string[]}
 * */
const getEntityColumns = (entity) => {
    return Object.keys(entity?.role?.properties || {});
}

/**
 * @return {(modifiedEntities: Object[], addedRelationships: Array<Object>) => Array<string>}
 * */
const getAddForeignKeyScripts = (ddlProvider, _) => (modifiedEntities, addedRelationships) => {
    return addedRelationships
        .map(relationship => {
            const childTableId = relationship.role?.childCollection;
            const childEntity = getEntityById(modifiedEntities, childTableId);
            if (!childEntity) {
                return '';
            }
            const childEntityName = generateFullEntityName(childEntity);
            const childEntityColumns = getEntityColumns(childEntity);

            const compMod = relationship.role.compMod;

            const parentDBName = replaceSpaceWithUnderscore(compMod.parentBucket.newName);
            const parentEntityName = replaceSpaceWithUnderscore(compMod.parentCollection.newName);
            const parentTableName = getFullEntityName(parentDBName, parentEntityName);

            const addFkConstraintDto = {
                childTableName: childEntityName,
                fkConstraintName: prepareName(relationship.role.name),
                childColumns: childEntityColumns.map(c => prepareName(c)),
                parentTableName,
                parentColumns: compMod.parentFields.map(field => prepareName(field.newName)),
            };
            return ddlProvider.addFkConstraint(addFkConstraintDto);
        })
        .filter(Boolean);
}

/**
 * @return {(modifiedEntities: Object[], deletedRelationships: Array<Object>) => Array<string>}
 * */
const getDeleteForeignKeyScripts = (ddlProvider, _) => (modifiedEntities, deletedRelationships) => {
    return deletedRelationships
        .map(relationship => {
            const childTableId = relationship.role?.childCollection;
            const childEntity = getEntityById(modifiedEntities, childTableId);
            if (!childEntity) {
                return '';
            }
            const childEntityName = generateFullEntityName(childEntity);
            const childEntityColumns = getEntityColumns(childEntity);
            return ddlProvider.dropFkConstraint(childEntityName, childEntityColumns);
        })
        .filter(Boolean);
}

module.exports = {
    getDeleteForeignKeyScripts,
    getAddForeignKeyScripts,
}
