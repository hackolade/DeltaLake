const _ = require('lodash');
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
 * @param {Object} relationship
 * @return {Array<string>}
 **/
const getChildFieldIds = relationship => {
	return relationship.childField
		.map(path => path.filter(elementId => elementId !== relationship.childCollection))
		.flat();
};

/**
 * @param {Object} relationship
 * @return {Array<string>}
 **/
const getParentFieldIds = relationship => {
	return relationship.parentField
		.map(path => path.filter(elementId => elementId !== relationship.parentCollection))
		.flat();
};

/**
 * @returns {({ relationship: Object, jsonSchemas: Record<string, Object>, relatedSchemas?: Record<string, Object> }) => string}
 */
const createSingleRelationship =
	(_, ddlProvider) =>
	({ relationship, jsonSchemas, relatedSchemas }) => {
		const parentTable =
			jsonSchemas[relationship.parentCollection] ?? relatedSchemas?.[relationship.parentCollection];
		const childTable = jsonSchemas[relationship.childCollection];
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
 * @returns {({ relationships: Object[], jsonSchemas: Record<string, Object>, relatedSchemas?: Record<string, Object> }) => Array<string>}
 */
const getCreateRelationshipScripts =
	app =>
	({ relationships, jsonSchemas, relatedSchemas }) => {
		const ddlProvider = require('../ddlProvider/ddlProvider')(app);
		return relationships
			.map(relationship =>
				createSingleRelationship(
					_,
					ddlProvider,
				)({
					relationship,
					jsonSchemas,
					relatedSchemas,
				}),
			)
			.filter(Boolean);
	};

module.exports = {
	getCreateRelationshipScripts,
};
