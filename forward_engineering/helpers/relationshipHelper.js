const {
	getFullEntityName,
	replaceSpaceWithUnderscore,
	getName,
	prepareName,
	getRelationshipName,
	commentDeactivatedStatements,
	wrapInTicks,
} = require('../utils/general');

/**
 * @return {(collection: Object, propertiesIds: Array<string>) => Array<string>}
 * */
const getCollectionPropertyNamesByIds = _ => (collection, propertiesIds) => {
	return _.toPairs(collection.properties)
		.filter(([name, jsonSchema]) => propertiesIds.includes(jsonSchema.GUID))
		.map(([name]) => name);
};

/**
 * @param relationship {Object}
 * @return {Array<string>}
 **/
const getChildFieldIds = relationship => {
	return relationship.childField
		.map(path => path.filter(elementId => elementId !== relationship.childCollection))
		.flat();
};

/**
 * @param relationship {Object}
 * @return {Array<string>}
 **/
const getParentFieldIds = relationship => {
	return relationship.parentField
		.map(path => path.filter(elementId => elementId !== relationship.parentCollection))
		.flat();
};

/**
 * @return {(relationship: Object, entitiesJsonSchema: Object) => string}
 **/
const createSingleRelationship = (_, ddlProvider) => (relationship, entitiesJsonSchema) => {
	const parentTable = entitiesJsonSchema[relationship.parentCollection];
	const childTable = entitiesJsonSchema[relationship.childCollection];
	const childBucketName = prepareName(childTable?.bucketName);
	const parentBucketName = prepareName(parentTable?.bucketName);

	if (!parentTable || !childTable) {
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
	const childTableNameForDDL = prepareName(replaceSpaceWithUnderscore(getName(childTable)));
	const parentBucketNameForDDL = replaceSpaceWithUnderscore(parentBucketName);
	const parentTableNameForDDL = prepareName(replaceSpaceWithUnderscore(getName(parentTable)));

	const addFkScript = ddlProvider.addFkConstraint({
		childTableName: getFullEntityName(childBucketNameForDDL, childTableNameForDDL),
		childColumns: childColumnNames.map(name => prepareName(name)),
		fkConstraintName: wrapInTicks(getRelationshipName(relationship)),
		parentColumns: parentColumnNames.map(name => prepareName(name)),
		parentTableName: getFullEntityName(parentBucketNameForDDL, parentTableNameForDDL),
	});
	if (relationship.isActivated === false) {
		return commentDeactivatedStatements(addFkScript, false);
	}
	return addFkScript;
};

/**
 * @return {(relationships: Array<Object>, entitiesJsonSchema: Object) => Array<string>}
 **/
const getCreateRelationshipScripts = app => (relationships, entitiesJsonSchema) => {
	const _ = app.require('lodash');
	const ddlProvider = require('../ddlProvider/ddlProvider')(app);
	return relationships
		.map(relationship => createSingleRelationship(_, ddlProvider)(relationship, entitiesJsonSchema))
		.filter(Boolean);
};

module.exports = {
	getCreateRelationshipScripts,
};
