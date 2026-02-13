const _ = require('lodash');
const schemaHelper = require('./jsonSchemaHelper');
const { getName, getTab, commentDeactivatedStatements, prepareName } = require('../utils/general');
const ddlTemplates = require('../ddlProvider/ddlTemplates');

const getIdToNameHashTable = (
	relationships,
	entities,
	jsonSchemas,
	internalDefinitions,
	otherDefinitions,
	relatedSchemas,
) => {
	const entitiesForHashing = entities
		.concat(Object.keys(relatedSchemas))
		.filter(entityId =>
			relationships.find(
				relationship => relationship.childCollection === entityId || relationship.parentCollection === entityId,
			),
		);

	return entitiesForHashing.reduce((hashTable, entityId) => {
		return {
			...hashTable,
			...schemaHelper.getIdToNameHashTable(
				[
					jsonSchemas[entityId] ?? relatedSchemas[entityId],
					internalDefinitions[entityId],
					...otherDefinitions,
				].filter(Boolean),
			),
		};
	}, {});
};

const getForeignKeyHashTable = ({
	relationships,
	entities,
	entityData,
	jsonSchemas,
	internalDefinitions,
	otherDefinitions,
	isContainerActivated,
	relatedSchemas,
}) => {
	const idToNameHashTable = getIdToNameHashTable(
		relationships,
		entities,
		jsonSchemas,
		internalDefinitions,
		otherDefinitions,
		relatedSchemas,
	);

	return relationships.reduce((hashTable, relationship) => {
		if (!hashTable[relationship.childCollection]) {
			hashTable[relationship.childCollection] = {};
		}

		const constraintName = relationship.code || relationship.name;
		const parentSchema =
			jsonSchemas[relationship.parentCollection] ?? relatedSchemas[relationship.parentCollection];
		const childSchema = jsonSchemas[relationship.childCollection] ?? relatedSchemas[relationship.childCollection];
		const parentDifferentSchemaName = prepareName(parentSchema?.bucketName) || '';
		const parentTableData = getTab(0, entityData[relationship.parentCollection]);
		const parentTableSingleName = prepareName(getName(parentTableData) || parentSchema?.collectionName) || '';
		const parentTableName = parentDifferentSchemaName
			? `${parentDifferentSchemaName}.${parentTableSingleName}`
			: parentTableSingleName;
		const childTableData = getTab(0, entityData[relationship.childCollection]);
		const childTableName = prepareName(getName(childTableData) || childSchema?.collectionName) || '';
		const groupKey = parentTableName + constraintName;
		const childFieldActivated = relationship.childField.reduce((isActivated, field) => {
			const fieldData = schemaHelper.getItemByPath(field.slice(1), childSchema);
			return isActivated && _.get(fieldData, 'isActivated');
		}, true);
		const parentFieldActivated = relationship.parentField.reduce((isActivated, field) => {
			const fieldData = schemaHelper.getItemByPath(field.slice(1), parentSchema);
			return isActivated && _.get(fieldData, 'isActivated');
		}, true);

		if (!hashTable[relationship.childCollection][groupKey]) {
			hashTable[relationship.childCollection][groupKey] = [];
		}
		const disableNoValidate = relationship?.customProperties?.disableNoValidate;

		hashTable[relationship.childCollection][groupKey].push({
			name: relationship.name,
			code: relationship.code,
			disableNoValidate: disableNoValidate,
			parentTableName: parentTableName,
			childTableName: childTableName,
			parentColumn: getPreparedForeignColumns(relationship.parentField, idToNameHashTable),
			childColumn: getPreparedForeignColumns(relationship.childField, idToNameHashTable),
			isActivated:
				isContainerActivated &&
				_.get(parentTableData, 'isActivated') &&
				_.get(childTableData, 'isActivated') &&
				childFieldActivated &&
				parentFieldActivated,
		});

		return hashTable;
	}, {});
};

const getForeignKeyStatementsByHashItem = (app, hashItem) => {
	return Object.keys(hashItem || {})
		.map(groupKey => {
			const keys = hashItem[groupKey];
			const firstKey = keys[0] || {};
			const keyName = firstKey.code || firstKey.name || '';
			const constraintName = keyName.includes(' ') ? `\`${keyName}\`` : keyName;
			const parentTableName = firstKey.parentTableName;
			const disableNoValidate = keys.some(item => item?.disableNoValidate);
			const childColumns = keys.map(item => item.childColumn).join(', ');
			const parentColumns = keys.map(item => item.parentColumn).join(', ');
			const isActivated = firstKey.isActivated;
			const { assignTemplates } = app.require('@hackolade/ddl-fe-utils');

			const statement = assignTemplates(ddlTemplates.addInlineFkConstraint, {
				fkConstraintName: constraintName ? `CONSTRAINT ${prepareName(constraintName)} ` : '',
				childColumns,
				parentTableName,
				parentColumns,
				disableNoValidate,
			}).trim();

			return commentDeactivatedStatements(statement, isActivated);
		})
		.join(',\n');
};

const getPreparedForeignColumns = (columnsPaths, idToNameHashTable) => {
	if (columnsPaths.length > 0 && Array.isArray(columnsPaths[0])) {
		return columnsPaths
			.map(path => schemaHelper.getNameByPath(idToNameHashTable, (path || []).slice(1)))
			.join(', ');
	}

	return schemaHelper.getNameByPath(idToNameHashTable, (columnsPaths || []).slice(1));
};

module.exports = {
	getForeignKeyHashTable,
	getForeignKeyStatementsByHashItem,
};
