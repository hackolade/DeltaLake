const {getFullEntityName, replaceSpaceWithUnderscore, prepareName, commentDeactivatedStatements} = require("../../utils/generalUtils");

/**
 * @return {(relationship: Object) => string}
 * */
const getAddSingleForeignKeyScript = (ddlProvider, _) => (relationship) => {
    const compMod = relationship.role.compMod;

    const parentDBName = replaceSpaceWithUnderscore(compMod.parent.bucketName);
    const parentEntityName = replaceSpaceWithUnderscore(compMod.parent.collectionName);
    const parentTableName = getFullEntityName(parentDBName, parentEntityName);

    const childDBName = replaceSpaceWithUnderscore(compMod.child.bucketName);
    const childEntityName = replaceSpaceWithUnderscore(compMod.child.collectionName);
    const childTableName = getFullEntityName(childDBName, childEntityName);

    const relationshipName = compMod.name?.new || relationship.name || '';

    const addFkConstraintDto = {
        childTableName,
        fkConstraintName: prepareName(relationshipName),
        childColumns: compMod.child.fieldNames.map(name => prepareName(name)),
        parentTableName,
        parentColumns: compMod.parent.fieldNames.map(name => prepareName(name)),
    };
    const addFkConstraintScript = ddlProvider.addFkConstraint(addFkConstraintDto);
    if (compMod.isActivated?.new === true) {
        return addFkConstraintScript;
    }
    return commentDeactivatedStatements(addFkConstraintScript, false);
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
        (compMod.name?.new || relationship.name),
        compMod.parent?.bucketName,
        compMod.parent?.collectionName,
        compMod.parent?.fieldNames?.length,
        compMod.child?.bucketName,
        compMod.child?.collectionName,
        compMod.child?.fieldNames?.length,
        compMod.isActivated?.new,
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

    const childDBName = replaceSpaceWithUnderscore(compMod.child.bucketName);
    const childEntityName = replaceSpaceWithUnderscore(compMod.child.collectionName);
    const childTableName = getFullEntityName(childDBName, childEntityName);

    const relationshipName = compMod.name?.old || relationship.name || '';
    const relationshipNameForDDL = prepareName(relationshipName);
    return ddlProvider.dropFkConstraint(childTableName, relationshipNameForDDL);
}

const canRelationshipBeDeleted = (relationship) => {
    const compMod = relationship.role.compMod;
    if (!compMod) {
        return false;
    }
    return [
        (compMod.name?.old || relationship.name),
        compMod.child?.bucketName,
        compMod.child?.collectionName,
        compMod.isActivated?.new,
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
    return modifiedRelationships
        .filter(relationship => canRelationshipBeAdded(relationship) && canRelationshipBeDeleted(relationship))
        .map(relationship => {
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
