'use strict'

const schemaHelper = require('./jsonSchemaHelper');
const { getName, getTab, commentDeactivatedStatements } = require('./generalHelper');
const { dependencies } = require('./appDependencies');
const { getItemByPath } = require('./jsonSchemaHelper');
let _;
const setAppDependencies = ({ lodash }) => _ = lodash;

const getIdToNameHashTable = (relationships, entities, jsonSchemas, internalDefinitions, otherDefinitions) => {
	const entitiesForHashing = entities.filter(entityId => relationships.find(relationship => (
		relationship.childCollection === entityId || relationship.parentCollection === entityId
	)));

	return entitiesForHashing.reduce((hashTable, entityId) => {
		return Object.assign(
			{},
			hashTable,
			schemaHelper.getIdToNameHashTable([
				jsonSchemas[entityId],
				internalDefinitions[entityId],
				...otherDefinitions	
			])
		);
	}, {});
};

const getForeignKeyHashTable = (relationships, entities, entityData, jsonSchemas, internalDefinitions, otherDefinitions, isContainerActivated) => {
	setAppDependencies(dependencies);
	const idToNameHashTable = getIdToNameHashTable(relationships, entities, jsonSchemas, internalDefinitions, otherDefinitions);

	return relationships.reduce((hashTable, relationship) => {
		if (!hashTable[relationship.childCollection]) {
			hashTable[relationship.childCollection] = {};
		}

		const constraintName = relationship.name;
		const parentTableData = getTab(0, entityData[relationship.parentCollection]);
		const parentTableName = getName(parentTableData);
		const childTableData = getTab(0, entityData[relationship.childCollection]);
		const childTableName = getName(childTableData);
		const groupKey = parentTableName + constraintName;
		const childFieldActivated = relationship.childField.reduce((isActivated, field) => {
            const fieldData = getItemByPath(field.slice(1), jsonSchemas[relationship.childCollection]);
            return isActivated && _.get(fieldData, 'isActivated');
        }, true);
        const parentFieldActivated = relationship.parentField.reduce((isActivated, field) => {
			const fieldData = getItemByPath(field.slice(1), jsonSchemas[relationship.parentCollection]);
			return isActivated && _.get(fieldData, 'isActivated');
        }, true);

		if (!hashTable[relationship.childCollection][groupKey]) {
			hashTable[relationship.childCollection][groupKey] = [];
		}
		const disableNoValidate = ((relationship || {}).customProperties || {}).disableNoValidate;
		
		hashTable[relationship.childCollection][groupKey].push({
            name: relationship.name,
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

const getForeignKeyStatementsByHashItem = (hashItem) => {
	return Object.keys(hashItem || {}).map(groupKey => {
		const keys = hashItem[groupKey];
		const keyName = (keys[0] || {}).name || '';
		const constraintName = keyName.includes(' ') ? `\`${keyName}\`` : keyName;
		const parentTableName = (keys[0] || {}).parentTableName;
		const childTableName = (keys[0] || {}).childTableName;
		const disableNoValidate = keys.some(item => (item || {}).disableNoValidate);
		const childColumns = keys.map(item => item.childColumn).join(', ');
		const parentColumns = keys.map(item => item.parentColumn).join(', ');
		const isActivated = (keys[0] || {}).isActivated;

		const statement = `ALTER TABLE ${childTableName} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${childColumns}) REFERENCES ${parentTableName}(${parentColumns}) ${disableNoValidate ? 'DISABLE NOVALIDATE' : ''};`;
		
		return commentDeactivatedStatements(statement, isActivated);
	}).join('\n');
};

const getPreparedForeignColumns = (columnsPaths, idToNameHashTable) => {
	if (columnsPaths.length > 0 && Array.isArray(columnsPaths[0])) {
		return columnsPaths
			.map(path => schemaHelper.getNameByPath(idToNameHashTable, (path || []).slice(1)))
			.join(', ');
	} else {
		return schemaHelper.getNameByPath(idToNameHashTable, (columnsPaths || []).slice(1));
	}
}

module.exports = {
	getForeignKeyHashTable,
	getForeignKeyStatementsByHashItem
};
