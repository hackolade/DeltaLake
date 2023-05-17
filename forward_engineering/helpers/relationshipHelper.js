const {
    getFullEntityName,
    replaceSpaceWithUnderscore,
    getName,
    prepareName,
    getRelationshipName
} = require("../utils/generalUtils");


/**
 * @return {(collection: Object, propertiesIds: Array<string>) => Array<string>}
 * */
const getCollectionPropertyNamesByIds = (_) => (collection, propertiesIds) => {
    return _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => propertiesIds.includes(jsonSchema.GUID))
        .map(([name]) => name);
}

/**
 * @param relationship {Object}
 * @return {Array<string>}
 **/
const getChildFieldIds = (relationship) => {
    return relationship.childField
        .map(path => path.filter(elementId => elementId !== relationship.childCollection))
        .flat();
}

/**
 * @param relationship {Object}
 * @return {Array<string>}
 **/
const getParentFieldIds = (relationship) => {
    return relationship.parentField
        .map(path => path.filter(elementId => elementId !== relationship.parentCollection))
        .flat();
}

/**
 * @return {(relationship: Object, entitiesJsonSchema: Object) => string}
 **/
const createSingleRelationship = (_, ddlProvider) => (relationship, entitiesJsonSchema) => {
    const parentTable = entitiesJsonSchema[relationship.parentCollection];
    const childTable = entitiesJsonSchema[relationship.childCollection];
    const childBucketName = childTable?.bucketName;
    const parentBucketName = parentTable?.bucketName;

    if (!parentTable || !childTable || !childBucketName || !parentBucketName) {
        return '';
    }
    const childFieldIds = getChildFieldIds(relationship);
    const parentFieldIds = getParentFieldIds(relationship);

    const parentColumnNames = getCollectionPropertyNamesByIds(_)(parentTable, parentFieldIds);
    const childColumnNames = getCollectionPropertyNamesByIds(_)(childTable, childFieldIds);
    if (!parentColumnNames?.length || !childColumnNames?.length) {
        return '';
    }

    const childBucketNameForDDL = replaceSpaceWithUnderscore(childBucketName);
    const childTableNameForDDL = replaceSpaceWithUnderscore(getName(childTable));
    const parentBucketNameForDDL = replaceSpaceWithUnderscore(parentBucketName);
    const parentTableNameForDDL = replaceSpaceWithUnderscore(getName(parentTable));

    return ddlProvider.addFkConstraint({
        childTableName: getFullEntityName(childBucketNameForDDL, childTableNameForDDL),
        childColumns: childColumnNames.map(name => prepareName(name)),
        fkConstraintName: prepareName(getRelationshipName(relationship)),
        parentColumns: parentColumnNames.map(name => prepareName(name)),
        parentTableName: getFullEntityName(parentBucketNameForDDL, parentTableNameForDDL),
    });
}

/**
 * @return {(relationships: Array<Object>, entitiesJsonSchema: Object) => Array<string>}
 **/
const getCreateRelationshipScripts = (app) => (relationships, entitiesJsonSchema) => {
    const _ = app.require('lodash');
    const ddlProvider = require('../ddlProvider/ddlProvider')(app);
    return relationships
        .map(relationship => createSingleRelationship(_, ddlProvider)(relationship, entitiesJsonSchema))
        .filter(Boolean);

}

module.exports = {
    getCreateRelationshipScripts
}
