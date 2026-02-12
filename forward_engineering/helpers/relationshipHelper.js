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
const getCollectionPropertyNamesByIds = (collection, propertiesIds) => {
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
 * Extracts and resolves relationship data (tables, columns) from a relationship definition
 * @param {Object} relationship
 * @param {Record<string, Object>} jsonSchemas
 * @param {Record<string, Object>} relatedSchemas
 * @return {{
 *   parentColumnNames: Array<string>,
 *   childColumnNames: Array<string>,
 *   childTableName: string,
 *   parentTableName: string,
 *   constraintName: string,
 *   isValid: boolean
 * } | null}
 */
const getRelationshipData = (relationship, jsonSchemas, relatedSchemas) => {
	const parentTable = jsonSchemas[relationship.parentCollection] ?? relatedSchemas?.[relationship.parentCollection];
	const childTable = jsonSchemas[relationship.childCollection];

	if (!parentTable || !childTable) {
		return null;
	}

	const childFieldIds = getChildFieldIds(relationship);
	const parentFieldIds = getParentFieldIds(relationship);

	const parentColumnNames = getCollectionPropertyNamesByIds(parentTable, parentFieldIds);
	const childColumnNames = getCollectionPropertyNamesByIds(childTable, childFieldIds);

	if (!parentColumnNames?.length || !childColumnNames?.length) {
		return null;
	}

	const childBucketName = prepareName(childTable?.bucketName);
	const parentBucketName = prepareName(parentTable?.bucketName);
	const childBucketNameForDDL = replaceSpaceWithUnderscore(childBucketName);
	const childTableNameForDDL = prepareName(replaceSpaceWithUnderscore(getName(childTable)));
	const parentBucketNameForDDL = replaceSpaceWithUnderscore(parentBucketName);
	const parentTableNameForDDL = prepareName(replaceSpaceWithUnderscore(getName(parentTable)));
	const constraintName = getRelationshipName(relationship);

	return {
		constraintName: constraintName ? `CONSTRAINT ${wrapInTicks(constraintName)}` : '',
		parentColumnNames: parentColumnNames.map(name => prepareName(name)),
		childColumnNames: childColumnNames.map(name => prepareName(name)),
		childTableName: getFullEntityName(childBucketNameForDDL, childTableNameForDDL),
		parentTableName: getFullEntityName(parentBucketNameForDDL, parentTableNameForDDL),
		isValid: true,
	};
};

/**
 * @returns {({ relationships: Object[], jsonSchemas: Record<string, Object>, relatedSchemas?: Record<string, Object> }) => Array<string>}
 */
const getCreateRelationshipScripts =
	app =>
	({ relationships, jsonSchemas, relatedSchemas }) => {
		const ddlProvider = require('../ddlProvider/ddlProvider')(app);
		return relationships
			.map(relationship => {
				const relationshipData = getRelationshipData(relationship, jsonSchemas, relatedSchemas);

				if (!relationshipData) {
					return '';
				}

				const addFkScript = ddlProvider.addFkConstraint({
					childTableName: relationshipData.childTableName,
					childColumns: relationshipData.childColumnNames,
					fkConstraintName: relationshipData.constraintName,
					parentColumns: relationshipData.parentColumnNames,
					parentTableName: relationshipData.parentTableName,
				});

				if (relationship.isActivated === false) {
					return commentDeactivatedStatements(addFkScript, false);
				}
				return addFkScript;
			})
			.filter(Boolean);
	};

/**
 * @returns {({ relationships: Object[], jsonSchemas: Record<string, Object>, relatedSchemas?: Record<string, Object> }) => Array<string>}
 */
const getCreateInlineRelationshipScripts =
	app =>
	({ relationships, jsonSchemas, relatedSchemas }) => {
		const ddlProvider = require('../ddlProvider/ddlProvider')(app);
		return relationships
			.filter(relationship => relationship.isActivated !== false)
			.map(relationship => {
				const relationshipData = getRelationshipData(relationship, jsonSchemas, relatedSchemas);

				if (!relationshipData) {
					return '';
				}

				return ddlProvider.addInlineFkConstraint({
					fkConstraintName: relationshipData.constraintName,
					childColumns: relationshipData.childColumnNames,
					parentTableName: relationshipData.parentTableName,
					parentColumns: relationshipData.parentColumnNames,
				});
			})
			.filter(Boolean);
	};

module.exports = {
	getCreateRelationshipScripts,
	getCreateInlineRelationshipScripts,
};
