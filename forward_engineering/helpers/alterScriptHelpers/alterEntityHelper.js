const { dependencies } = require('../appDependencies');
const { getColumns, getColumnsStatement, getColumnsString } = require('../columnHelper');
const { getIndexes } = require('../indexHelper');
const { getTableStatement } = require('../tableHelper');
const { hydrateTableProperties, getDifferentItems, getIsChangeProperties } = require('./common');
const { 
	getFullEntityName, 
	generateFullEntityName, 
	getEntityProperties, 
	getContainerName, 
	getEntityData, 
	getEntityName, 
	prepareScript 
} = require('./generalHelper');

let _;
const setDependencies = ({ lodash }) => _ = lodash;

const tableProperties = ['compositeClusteringKey', 'compositePartitionKey', 'isActivated', 'location', 'numBuckets', 'skewedby', 'skewedOn', 'skewStoredAsDir', 'sortedByKey', 'storedAsTable', 'temporaryTable', 'using', 'rowFormat', 'fieldsTerminatedBy', 'fieldsescapedBy', 'collectionItemsTerminatedBy', 'mapKeysTerminatedBy', 'linesTerminatedBy', 'nullDefinedAs', 'inputFormatClassname', 'outputFormatClassname'];
const otherTableProperties = ['code', 'collectionName', 'tableProperties', 'description', 'properties', 'serDeLibrary', 'serDeProperties'];

const hydrateSerDeProperties = (compMod, name) => {
	const { serDeProperties, serDeLibrary } = compMod
	return {
		properties: !_.isEqual(serDeProperties?.new, serDeProperties?.old) && serDeProperties?.new,
		serDe: !_.isEqual(serDeLibrary?.new, serDeLibrary?.old) && serDeLibrary?.new,
		name
	};
}

const hydrateAlterTableName = compMod => {
	const { newName, oldName } = getEntityName(compMod);
	if (!newName && !oldName || (newName === oldName)) {
		return {};
	}
	return {
		oldName: getFullEntityName(getContainerName(compMod), oldName),
		newName: getFullEntityName(getContainerName(compMod), newName),
	};
};

const hydrateAlterColumnName = (entity, properties = {}) => {
	const collectionName = generateFullEntityName(entity);
	const columns = Object.values(properties).map(property => {
		const compMod = _.get(property, 'compMod', {});
		const { newField = {}, oldField = {}} = compMod;
		return newField.name && oldField.name && newField.name !== oldField.name 
			? { oldName: oldField.name, newName: newField.name } 
			: '';
	});
	return { collectionName, columns: columns.filter(Boolean) };
}

const hydrateAlterColumnType = (properties = {}) => {
	const isChangedType = (newField, oldField) => newField.type && oldField.type && (newField.type !== oldField.type || newField.mode !== oldField.mode);
	const columns = Object.values(properties).map(property => {
		const compMod = _.get(property, 'compMod', {});
		const { newField = {}, oldField = {}} = compMod;
		return isChangedType(oldField, newField) || 
		(
			newField.items && 
			oldField.items && 
			newField.items.some((field, index) => isChangedType(field, oldField.items[index]))
		) ||
		(
			newField.properties && 
			oldField.properties && 
			Object.keys(newField.properties).some(key => isChangedType(newField.properties[key], oldField.properties[key]))
		)
			? { oldName: oldField.name, newName: newField.name }
			: '';
	});
	const columnsToDelete = columns.map(column => column.oldName).filter(name => Boolean(name));
	const columnsToAdd = columns.map(column => column.newName).filter(name => Boolean(name));
	return { columnsToDelete, columnsToAdd };
}

const hydrateDropIndexes = entity => {
	const bloomIndex = _.get(entity, 'BloomIndxs', []);
	return bloomIndex.length ? generateFullEntityName(entity) : '';
};

const hydrateAddIndexes = (entity, BloomIndxs, properties, definitions) => {
	const compMod = _.get(entity, 'role.compMod', {});
	const entityData = _.get(entity, 'role', {});
	const containerData = { name: getContainerName(compMod) };
	return [[containerData], [entityData, {}, { BloomIndxs }], { ...entityData, properties }, definitions];
};

const hydrateIndex = (entity, properties, definitions) => {
	const bloomIndex = _.get(entity, 'role.compMod.BloomIndxs', {});
	const { drop, add } = getDifferentItems(bloomIndex.new, bloomIndex.old);
	return { 
		hydratedDropIndex : hydrateDropIndexes({ ...entity, BloomIndxs: drop }),
		hydratedAddIndex: hydrateAddIndexes(entity, add, properties, definitions),
	};
}

const hydrateCollection = (entity, definitions) => {
	const compMod = _.get(entity, 'role.compMod', {});
	const entityData = _.get(entity, 'role', {});
	const properties = getEntityProperties(entity);
	const containerData = { name: getContainerName(compMod) };
	return [[containerData], [entityData], { ...entityData, properties }, definitions];
};

const generateModifyCollectionScript = (entity, definitions, provider) => {
	const compMod = _.get(entity, 'role.compMod', {});
	const isChangedProperties = getIsChangeProperties(compMod, tableProperties);
	const fullCollectionName = generateFullEntityName(entity);
	if (isChangedProperties) {
		const roleData = getEntityData(compMod, tableProperties.concat(otherTableProperties));
		const hydratedCollection = hydrateCollection({...entity, role: { ...entity.role, ...roleData }}, definitions);
		const addCollectionScript = getTableStatement(...hydratedCollection, true);
		const deleteCollectionScript = provider.dropTable(fullCollectionName);
		return { type: 'new', script: prepareScript(deleteCollectionScript, addCollectionScript) };
	}
	const dataProperties = _.get(compMod, 'tableProperties', '');
	const alterTableNameScript = provider.alterTableName(hydrateAlterTableName(compMod))
	const hydratedTableProperties = hydrateTableProperties(dataProperties, fullCollectionName);
	const hydratedSerDeProperties = hydrateSerDeProperties(compMod, fullCollectionName);
	const tablePropertiesScript = provider.alterTableProperties(hydratedTableProperties);
	const serDeProperties = provider.alterSerDeProperties(hydratedSerDeProperties)
	return { type: 'modify', script: prepareScript(alterTableNameScript, ...tablePropertiesScript, serDeProperties) };
}

const getAddCollectionsScripts = definitions => entity => {
	setDependencies(dependencies);
	const properties = getEntityProperties(entity);
	const indexes = _.get(entity, 'role.BloomIndxs', [])
	const hydratedCollection = hydrateCollection(entity, definitions);
	const collectionScript = getTableStatement(...hydratedCollection, true);
	const indexScript = getIndexes(...hydrateAddIndexes(entity, indexes, properties, definitions));
	
	return prepareScript(collectionScript, indexScript);
};

const getDeleteCollectionsScripts = provider => entity => {
	setDependencies(dependencies);
	const entityData = { ...entity, ..._.get(entity, 'role', {}) };
	const fullCollectionName = generateFullEntityName(entity)
	const collectionScript = provider.dropTable(fullCollectionName);
	const indexScript = provider.dropTableIndex(hydrateDropIndexes(entityData));

	return prepareScript(indexScript, collectionScript);
};

const getModifyCollectionsScripts = (definitions, provider) => entity => {
	setDependencies(dependencies);
	const properties = getEntityProperties(entity);
	const { script } = generateModifyCollectionScript(entity, definitions, provider);
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex(entity, properties, definitions);
	const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);

	return prepareScript(dropIndexScript, ...script, addIndexScript);
};

const getAddColumnsScripts = (definitions, provider) => entity => {
	setDependencies(dependencies);
	const entityData = { ...entity, ..._.omit(entity.role, ['properties']) };
	const { columns } = getColumns(entityData, true, definitions);
	const properties = getEntityProperties(entity);
	const columnStatement = getColumnsStatement(columns);
	const fullCollectionName = generateFullEntityName(entity);
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex(entity, properties, definitions);
	const modifyScript = generateModifyCollectionScript(entity, definitions, provider);
	const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);
	const addColumnScript = provider.addTableColumns({ name: fullCollectionName, columns: columnStatement });

	return modifyScript.type === 'new' ? 
		prepareScript(dropIndexScript, ...modifyScript.script, addIndexScript) : 
		prepareScript(dropIndexScript, addColumnScript, ...modifyScript.script, addIndexScript);
};

const getDeleteColumnsScripts = (definitions, provider) => entity => {
	setDependencies(dependencies);
	const entityData = { 
		...entity, 
		..._.omit(entity.role, ['properties']),
		properties: _.pickBy(entity.properties || {}, column => !column.compMod)
	};
	const { columns } = getColumns(entityData, true, definitions);
	const properties = getEntityProperties(entity);
	const columnStatement = getColumnsString(Object.keys(columns));
	const fullCollectionName = generateFullEntityName(entity);
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex(entity, properties, definitions);
	const modifyScript = generateModifyCollectionScript(entity, definitions, provider);
	const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);
	const deleteColumnScript = provider.dropTableColumns({ name: fullCollectionName, columns: columnStatement });

	return modifyScript.type === 'new' ? 
		prepareScript(dropIndexScript, ...modifyScript.script, addIndexScript) : 
		prepareScript(dropIndexScript, deleteColumnScript, ...modifyScript.script, addIndexScript);
};

const getDeleteColumnScripsForOlderRuntime = (definitions, provider) => entity => {
	setDependencies(dependencies);
	const deleteColumnsName = _.filter(Object.keys(entity.properties || {}), name => !entity.properties[name].compMod);
	const properties = _.omit(_.get(entity, 'role.properties', {}), deleteColumnsName);
	const entityData = { role: { ..._.omit(entity.role, ['properties']), properties }};
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex(entity, properties, definitions);
	const fullCollectionName = generateFullEntityName(entity)
	const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);
	const deleteCollectionScript = provider.dropTable(fullCollectionName);
	const hydratedCollection = hydrateCollection(entityData, definitions);
	const addCollectionScript = getTableStatement(...hydratedCollection, true);
	
	return prepareScript(dropIndexScript, deleteCollectionScript, addCollectionScript, addIndexScript);
};

const getModifyColumnsScripts = (definitions, provider) => entity => {
	setDependencies(dependencies);
	const properties = _.get(entity, 'properties', {});
	const unionProperties = _.unionWith(
		Object.entries(properties), 
		Object.entries(_.get(entity, 'role.properties', {})), 
		(firstProperty, secondProperty) => _.isEqual(_.get(firstProperty, '[1].GUID'), _.get(secondProperty, '[1].GUID'))
	);
	const entityData = {
		role: { 
			..._.omit(entity.role || {}, ['properties']), 
			properties: Object.fromEntries(unionProperties)
		}
	};
	const hydratedAlterColumnName = hydrateAlterColumnName(entity, properties);
	const alterColumnScripts = provider.alterTableColumnName(hydratedAlterColumnName);
	const modifiedScript = generateModifyCollectionScript(entityData, definitions, provider);
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex(entity, properties, definitions);
	const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);

	const fullCollectionName = generateFullEntityName(entity);
	const { columnsToDelete, columnsToAdd } = hydrateAlterColumnType(properties);
	const { columns: columnsInfo } = getColumns(entityData.role, true, definitions);
	const columnsToAddInfo = _.pick(columnsInfo,  columnsToAdd);
	const addColumnStatement = getColumnsStatement(columnsToAddInfo);
	const dropColumnStatement = getColumnsString(columnsToDelete);
	const deleteColumnScript = provider.dropTableColumns({ name: fullCollectionName, columns: dropColumnStatement });
	const addColumnScript = provider.addTableColumns({ name: fullCollectionName, columns: addColumnStatement });

	return modifiedScript.type === 'new' ? 
		prepareScript(dropIndexScript, ...modifiedScript.script, addIndexScript) : 
		prepareScript(dropIndexScript, deleteColumnScript, addColumnScript, ...alterColumnScripts, ...modifiedScript.script, addIndexScript);
};

const getModifyColumnsScriptsForOlderRuntime = (definitions, provider) => entity => {
	setDependencies(dependencies);
	const properties = _.get(entity, 'properties', {});
	const unionProperties = _.unionWith(
		Object.entries(properties), 
		Object.entries(_.get(entity, 'role.properties', {})), 
		(firstProperty, secondProperty) => _.isEqual(_.get(firstProperty, '[1].GUID'), _.get(secondProperty, '[1].GUID'))
	);
	const entityData = {
		role: { 
			..._.omit(entity.role || {}, ['properties']), 
			properties: Object.fromEntries(unionProperties)
		}
	};
	const hydratedAlterColumnName = hydrateAlterColumnName(entity, properties);
	const alterColumnScripts = provider.alterTableColumnName(hydratedAlterColumnName);
	const modifiedScript = generateModifyCollectionScript(entityData, definitions, provider);
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex(entity, properties, definitions);
	const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);

	const { columnsToDelete } = hydrateAlterColumnType(properties);
	let tableModificationScripts = [];
	if (!_.isEmpty(columnsToDelete)) {
		const fullCollectionName = generateFullEntityName(entity);
		const deleteCollectionScript = provider.dropTable(fullCollectionName);
		const hydratedCollection = hydrateCollection(entityData, definitions);
		const addCollectionScript = getTableStatement(...hydratedCollection, true);
		tableModificationScripts = [deleteCollectionScript, addCollectionScript];
	}

	return modifiedScript.type === 'new' ? 
		prepareScript(dropIndexScript, ...modifiedScript.script, addIndexScript) : 
		prepareScript(dropIndexScript, ...tableModificationScripts, ...alterColumnScripts, ...modifiedScript.script, addIndexScript);
}

module.exports = {
	getAddCollectionsScripts,
	getDeleteCollectionsScripts,
	getModifyCollectionsScripts,
	getAddColumnsScripts,
	getDeleteColumnsScripts,
	getDeleteColumnScripsForOlderRuntime,
	getModifyColumnsScriptsForOlderRuntime,
	getModifyColumnsScripts
}