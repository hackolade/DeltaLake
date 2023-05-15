const {generateFullEntityName, getFullEntityName} = require("./generalHelper");
const {replaceSpaceWithUnderscore, prepareName} = require("../generalHelper");


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
 * @param ids {Array<string>}
 * @return {string[]}
 * */
const getChildColumnNames = (entity, ids) => {
    const properties = entity.role.properties || {};
    return Object.values(properties)
        .filter(property => ids.includes(property.GUID))
        .map(property => property.compMod.newField.name)
}

/**
 * @param relationship {Object}
 * @return {string}
 * */
const getRelationshipName = (relationship) => {
    return relationship.role.name;
}

/**
 * @return {(modifiedEntities: Object[], relationship: Object) => string}
 * */
const getAddSingleForeignKeyScript = (ddlProvider, _) => (modifiedEntities, relationship) => {
    const childTableId = relationship.role?.childCollection;
    const childEntity = getEntityById(modifiedEntities, childTableId);
    if (!childEntity) {
        return '';
    }
    const childEntityName = generateFullEntityName(childEntity);
    const childField = relationship.role.childField || [];
    const childColumnIds = childField.map((path) => {
        return path.filter(id => id !== childTableId);
    })
        .flat();
    const childEntityColumns = getChildColumnNames(childEntity, childColumnIds);

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
}

/**
 * @return {(modifiedEntities: Object[], addedRelationships: Array<Object>) => Array<string>}
 * */
const getAddForeignKeyScripts = (ddlProvider, _) => (modifiedEntities, addedRelationships) => {
    return addedRelationships
        .map(relationship => getAddSingleForeignKeyScript(ddlProvider, _)(modifiedEntities, relationship))
        .filter(Boolean);
}

/**
 * @return {(modifiedEntities: Object[], relationship: Object) => string}
 * */
const getDeleteSingleForeignKeyScript = (ddlProvider, _) => (modifiedEntities, relationship) => {
    const childTableId = relationship.role?.childCollection;
    const childEntity = getEntityById(modifiedEntities, childTableId);
    if (!childEntity) {
        return '';
    }
    const childEntityName = generateFullEntityName(childEntity);
    const relationshipName = getRelationshipName(relationship);
    const relationshipNameForDDL = prepareName(relationshipName);
    return ddlProvider.dropFkConstraint(childEntityName, relationshipNameForDDL);
}

/**
 * @return {(modifiedEntities: Object[], deletedRelationships: Array<Object>) => Array<string>}
 * */
const getDeleteForeignKeyScripts = (ddlProvider, _) => (modifiedEntities, deletedRelationships) => {
    return deletedRelationships
        .map(relationship => getDeleteSingleForeignKeyScript(ddlProvider, _)(modifiedEntities, relationship))
        .filter(Boolean);
}

/**
 * @return {(modifiedEntities: Object[], deletedRelationships: Array<Object>) => Array<string>}
 * */
const getModifyForeignKeyScripts = (ddlProvider, _) => (modifiedEntities, modifiedRelationships) => {
    return modifiedRelationships.map(relationship => {
        const deleteScript = getDeleteSingleForeignKeyScript(ddlProvider, _)(modifiedEntities, relationship);
        const addScript = getAddSingleForeignKeyScript(ddlProvider, _)(modifiedEntities, relationship);
        return [
            deleteScript,
            addScript,
        ]
    })
        .flat()
        .filter(Boolean);
}

module.exports = {
    getDeleteForeignKeyScripts,
    getModifyForeignKeyScripts,
    getAddForeignKeyScripts,
}
