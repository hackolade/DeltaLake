const {getFullEntityName, replaceSpaceWithUnderscore, prepareName} = require("../../utils/generalUtils");

/**
 * @return {(relationship: Object) => string}
 * */
const getAddSingleForeignKeyScript = (ddlProvider, _) => (relationship) => {
    const compMod = relationship.role.compMod;

    const parentDBName = replaceSpaceWithUnderscore(compMod.parentBucket.newName);
    const parentEntityName = replaceSpaceWithUnderscore(compMod.parentCollection.newName);
    const parentTableName = getFullEntityName(parentDBName, parentEntityName);

    const childDBName = replaceSpaceWithUnderscore(compMod.childBucket.newName);
    const childEntityName = replaceSpaceWithUnderscore(compMod.childCollection.newName);
    const childTableName = getFullEntityName(childDBName, childEntityName);

    const relationshipName = relationship.role.compMod.name?.new || '';

    const addFkConstraintDto = {
        childTableName,
        fkConstraintName: prepareName(relationshipName),
        childColumns: compMod.childFields.map(field => prepareName(field.newName)),
        parentTableName,
        parentColumns: compMod.parentFields.map(field => prepareName(field.newName)),
    };
    return ddlProvider.addFkConstraint(addFkConstraintDto);
}

/**
 * @param relationship {Object}
 * @return boolean
 * */
const canRelationshipBeAdded = (relationship) => {
    const compMod = relationship.role.compMod;
    if (!compMod) {
        return false;
    }
    return [
        compMod.name?.new,
        compMod.parentBucket,
        compMod.parentCollection,
        compMod.parentFields,
        compMod.childBucket,
        compMod.childCollection,
        compMod.childFields,
    ].every(property => Boolean(property));
}

/**
 * @return {(modifiedEntities: Object[], addedRelationships: Array<Object>) => Array<string>}
 * */
const getAddForeignKeyScripts = (ddlProvider, _) => (addedRelationships) => {
    return addedRelationships
        .filter((relationship) => canRelationshipBeAdded(relationship))
        .map(relationship => getAddSingleForeignKeyScript(ddlProvider, _)(relationship))
        .filter(Boolean);
}

/**
 * @return {(relationship: Object) => string}
 * */
const getDeleteSingleForeignKeyScript = (ddlProvider, _) => (relationship) => {
    const compMod = relationship.role.compMod;

    const childDBName = replaceSpaceWithUnderscore(compMod.childBucket.newName);
    const childEntityName = replaceSpaceWithUnderscore(compMod.childCollection.newName);
    const childTableName = getFullEntityName(childDBName, childEntityName);

    const relationshipName = relationship.role.compMod.name?.old || '';
    const relationshipNameForDDL = prepareName(relationshipName);
    return ddlProvider.dropFkConstraint(childTableName, relationshipNameForDDL);
}

const canRelationshipBeDeleted = (relationship) => {
    const compMod = relationship.role.compMod;
    if (!compMod) {
        return false;
    }
    return [
        compMod.name?.old,
        compMod.childBucket,
        compMod.childCollection,
    ].every(property => Boolean(property));
}

/**
 * @return {(deletedRelationships: Array<Object>) => Array<string>}
 * */
const getDeleteForeignKeyScripts = (ddlProvider, _) => (deletedRelationships) => {
    return deletedRelationships
        .filter((relationship) => canRelationshipBeDeleted(relationship))
        .map(relationship => getDeleteSingleForeignKeyScript(ddlProvider, _)(relationship))
        .filter(Boolean);
}

/**
 * @return {(deletedRelationships: Array<Object>) => Array<string>}
 * */
const getModifyForeignKeyScripts = (ddlProvider, _) => (modifiedRelationships) => {
    return modifiedRelationships.map(relationship => {
        const deleteScript = getDeleteSingleForeignKeyScript(ddlProvider, _)(relationship);
        const addScript = getAddSingleForeignKeyScript(ddlProvider, _)(relationship);
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
