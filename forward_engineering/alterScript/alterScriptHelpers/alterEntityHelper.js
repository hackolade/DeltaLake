const _ = require('lodash');
const { getColumns, getColumnsString } = require('../../helpers/columnHelper');
const { getIndexes } = require('../../helpers/indexHelper');
const { getTableStatement } = require('../../helpers/tableHelper');
const { hydrateAddIndexes, hydrateDropIndexes, hydrateIndex } = require('./entityHelpers/indexHelper');
const { generateModifyCollectionScript } = require('./entityHelpers/modifyCollectionScript');
const { getAddColumnsScripts } = require('./entityHelpers/addColumnsHelper');
const {
	generateFullEntityName,
	getEntityProperties,
	getContainerName,
	isSupportUnityCatalog,
	isSupportNotNullConstraints,
} = require('../../utils/general');
const { getModifyCollectionCommentsScripts } = require('./entityHelpers/commentsHelper');
const { getCheckConstraintsScriptDtos } = require('./columnHelpers/checkConstraintHelper');
const { getModifyNonNullColumnsScriptDtos } = require('./columnHelpers/nonNullConstraintHelper');
const { getModifiedCommentOnColumnScriptDtos } = require('./columnHelpers/commentsHelper');
const { AlterScriptDto } = require('../types/AlterScriptDto');
const { getModifiedDefaultColumnValueScriptDtos } = require('./columnHelpers/defaultValueHelper');
const { getUpdateTypesScriptDtos } = require('./columnHelpers/alterTypeHelper');
const { getModifyUnityColumnTagsScriptDtos } = require('./columnHelpers/alterUnityTagsHelper');

const hydrateAlterColumnName = ({ entity, properties = {}, dbVersion }) => {
	const collectionName = generateFullEntityName({ entity, dbVersion });
	const columns = Object.values(properties).map(property => {
		const compMod = _.get(property, 'compMod', {});
		const { newField = {}, oldField = {} } = compMod;
		return newField.name && oldField.name && newField.name !== oldField.name
			? { oldName: oldField.name, newName: newField.name }
			: '';
	});
	return { collectionName, columns: columns.filter(Boolean) };
};

const hydrateAlterColumnType =
	_ =>
	(properties = {}) => {
		const isChangedType = (newField, oldField) =>
			newField.type && oldField.type && (newField.type !== oldField.type || newField.mode !== oldField.mode);
		const columns = Object.values(properties).map(property => {
			const compMod = _.get(property, 'compMod', {});
			const { newField = {}, oldField = {} } = compMod;
			return isChangedType(oldField, newField) ||
				(newField.items &&
					oldField.items &&
					newField.items.some((field, index) => isChangedType(field, oldField.items[index]))) ||
				(newField.properties &&
					oldField.properties &&
					Object.keys(newField.properties).some(key =>
						isChangedType(newField.properties[key], oldField.properties[key]),
					))
				? { oldName: oldField.name, newName: newField.name }
				: '';
		});
		const columnsToDelete = columns.map(column => column.oldName).filter(name => Boolean(name));
		const columnsToAdd = columns.map(column => column.newName).filter(name => Boolean(name));
		return { columnsToDelete, columnsToAdd };
	};

const hydrateCollection = _ => (entity, definitions) => {
	const compMod = _.get(entity, 'role.compMod', {});
	const entityData = _.get(entity, 'role', {});
	const properties = getEntityProperties(entity);
	const containerData = { name: getContainerName(compMod) };
	return [[containerData], [entityData], { ...entityData, properties }, definitions];
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getAddCollectionsScripts = (app, definitions, dbVersion) => entity => {
	const properties = getEntityProperties(entity);
	const indexes = _.get(entity, 'role.BloomIndxs', []);
	const hydratedCollection = hydrateCollection(entity, definitions);
	const arePkFkConstraintsAvailable = isSupportUnityCatalog(dbVersion);
	const areNotNullConstraintsAvailable = isSupportNotNullConstraints(dbVersion);
	const collectionScript = getTableStatement(app)(
		...hydratedCollection,
		arePkFkConstraintsAvailable,
		areNotNullConstraintsAvailable,
		null,
		dbVersion,
		true,
	);
	const indexScript = getIndexes(...hydrateAddIndexes(entity, indexes, properties, definitions));

	return [collectionScript, indexScript].filter(Boolean).map(script => ({
		isActivated: true,
		scripts: [
			{
				isDropScript: false,
				script,
			},
		],
	}));
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getDeleteCollectionsScripts = (app, provider, dbVersion) => entity => {
	const entityData = { ...entity, ..._.get(entity, 'role', {}) };
	const fullCollectionName = generateFullEntityName({ entity, dbVersion });
	const collectionScript = provider.dropTable(fullCollectionName);
	const indexScript = provider.dropTableIndex(hydrateDropIndexes(entityData));

	return [indexScript, collectionScript].filter(Boolean).map(script => ({
		isActivated: true,
		scripts: [
			{
				isDropScript: true,
				script,
			},
		],
	}));
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getModifyCollectionsScripts = (app, definitions, ddlProvider, dbVersion) => collection => {
	const properties = getEntityProperties(collection);
	const { script: modifyTableScriptDtos } = generateModifyCollectionScript(app)(
		collection,
		definitions,
		ddlProvider,
		dbVersion,
	);
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex({
		entity: collection,
		properties,
		definitions,
		dbVersion,
	});
	const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);

	const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
	const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);

	return [dropIndexScriptDto, ...modifyTableScriptDtos, addIndexScriptDto].filter(Boolean);
};

const getDeleteColumnsScripts = (app, definitions, provider, dbVersion) => entity => {
	const entityData = {
		...entity,
		..._.omit(entity.role, ['properties']),
		properties: _.pickBy(entity.properties || {}, column => !column.compMod),
	};
	const { columns } = getColumns(entityData, definitions, dbVersion);
	const properties = getEntityProperties(entity);
	const columnStatement = getColumnsString(Object.keys(columns));
	const fullCollectionName = generateFullEntityName({ entity, dbVersion });
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex({ entity, properties, definitions, dbVersion });
	const modifyScript = generateModifyCollectionScript(app)(entity, definitions, provider, dbVersion);
	const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);
	const deleteColumnScript = provider.dropTableColumns({ name: fullCollectionName, columns: columnStatement });

	const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
	const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
	const deleteColumnScriptDto = AlterScriptDto.getInstance([deleteColumnScript], true, true);

	if (modifyScript.type === 'new') {
		return [dropIndexScriptDto, ...(modifyScript.script || []), addIndexScriptDto].filter(Boolean);
	}

	return [dropIndexScriptDto, deleteColumnScriptDto, ...(modifyScript.script || []), addIndexScriptDto].filter(
		Boolean,
	);
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getDeleteColumnScripsForOlderRuntime = (app, definitions, provider, dbVersion) => entity => {
	const deleteColumnsName = _.filter(Object.keys(entity.properties || {}), name => !entity.properties[name].compMod);
	const properties = _.omit(_.get(entity, 'role.properties', {}), deleteColumnsName);
	const entityData = { role: { ..._.omit(entity.role, ['properties']), properties } };
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex({ entity, properties, definitions, dbVersion });
	const fullCollectionName = generateFullEntityName({ entity, dbVersion });
	const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);
	const deleteCollectionScript = provider.dropTable(fullCollectionName);
	const hydratedCollection = hydrateCollection(entityData, definitions);
	const arePkFkConstraintsAvailable = isSupportUnityCatalog(dbVersion);
	const areNotNullConstraintsAvailable = isSupportNotNullConstraints(dbVersion);
	const addCollectionScript = getTableStatement(app)(
		...hydratedCollection,
		arePkFkConstraintsAvailable,
		areNotNullConstraintsAvailable,
		null,
		dbVersion,
		true,
	);

	const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
	const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
	const deleteCollectionScriptDto = AlterScriptDto.getInstance([deleteCollectionScript], true, true);
	const addCollectionScriptDto = AlterScriptDto.getInstance([addCollectionScript], true, false);

	return [dropIndexScriptDto, deleteCollectionScriptDto, addCollectionScriptDto, addIndexScriptDto].filter(Boolean);
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getModifyColumnsScripts = (app, definitions, ddlProvider, dbVersion) => collection => {
	const properties = _.get(collection, 'properties', {});
	const unionProperties = _.unionWith(
		Object.entries(properties),
		Object.entries(_.get(collection, 'role.properties', {})),
		(firstProperty, secondProperty) =>
			_.isEqual(_.get(firstProperty, '[1].GUID'), _.get(secondProperty, '[1].GUID')),
	);
	const entityData = {
		role: {
			..._.omit(collection.role || {}, ['properties']),
			properties: Object.fromEntries(unionProperties),
		},
	};
	const hydratedAlterColumnName = hydrateAlterColumnName({ entity: collection, properties, dbVersion });
	const alterColumnScripts = ddlProvider.alterTableColumnName(hydratedAlterColumnName);
	const modifiedScript = generateModifyCollectionScript(app)(entityData, definitions, ddlProvider, dbVersion);
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex({
		entity: collection,
		properties,
		definitions,
		dbVersion,
	});
	const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);

	const modifiedCommentOnColumnsScriptDtos = getModifiedCommentOnColumnScriptDtos(
		_,
		ddlProvider,
	)({ collection, dbVersion });
	const modifyNotNullConstraintsScriptDtos = getModifyNonNullColumnsScriptDtos(
		_,
		ddlProvider,
	)({ collection, dbVersion });
	const modifyCheckConstraintsScriptDtos = getCheckConstraintsScriptDtos(_, ddlProvider)({ collection, dbVersion });
	const modifiedDefaultColumnValueScriptDtos = getModifiedDefaultColumnValueScriptDtos(
		_,
		ddlProvider,
	)({ collection, dbVersion });

	const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
	const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
	const alterColumnScriptDtos = AlterScriptDto.getInstances(alterColumnScripts, true, false);
	const unityColumnTagsDtos = Object.keys(properties).flatMap(columnName =>
		getModifyUnityColumnTagsScriptDtos({ ddlProvider })({
			entityData: collection,
			tableName: hydratedAlterColumnName.collectionName,
			columnName,
		}),
	);
	if (modifiedScript.type === 'new') {
		return [dropIndexScriptDto, ...(modifiedScript.script || []), addIndexScriptDto].filter(Boolean);
	}

	const updateTypeScriptDtos = getUpdateTypesScriptDtos(_, ddlProvider)(collection, definitions, dbVersion);

	return [
		dropIndexScriptDto,
		...updateTypeScriptDtos,
		...alterColumnScriptDtos,
		...modifiedCommentOnColumnsScriptDtos,
		...modifyNotNullConstraintsScriptDtos,
		...modifyCheckConstraintsScriptDtos,
		...modifiedDefaultColumnValueScriptDtos,
		...(modifiedScript.script || []),
		addIndexScriptDto,
		...unityColumnTagsDtos,
	].filter(Boolean);
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getModifyColumnsScriptsForOlderRuntime = (app, definitions, ddlProvider, dbVersion) => collection => {
	const properties = _.get(collection, 'properties', {});
	const unionProperties = _.unionWith(
		Object.entries(properties),
		Object.entries(_.get(collection, 'role.properties', {})),
		(firstProperty, secondProperty) =>
			_.isEqual(_.get(firstProperty, '[1].GUID'), _.get(secondProperty, '[1].GUID')),
	);
	const entityData = {
		role: {
			..._.omit(collection.role || {}, ['properties']),
			properties: Object.fromEntries(unionProperties),
		},
	};
	const hydratedAlterColumnName = hydrateAlterColumnName({ entity: collection, properties, dbVersion });
	const alterColumnScripts = ddlProvider.alterTableColumnName(hydratedAlterColumnName);
	const modifiedScript = generateModifyCollectionScript(app)(entityData, definitions, ddlProvider, dbVersion);
	const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex({
		entity: collection,
		properties,
		definitions,
		dbVersion,
	});
	const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
	const addIndexScript = getIndexes(...hydratedAddIndex);

	const { columnsToDelete } = hydrateAlterColumnType(_)(properties);
	const modifiedCommentOnColumnsScriptDtos = getModifiedCommentOnColumnScriptDtos(
		_,
		ddlProvider,
	)({ collection, dbVersion });
	const modifyNotNullConstraintsScriptDtos = getModifyNonNullColumnsScriptDtos(
		_,
		ddlProvider,
	)({ collection, dbVersion });
	const modifyCheckConstraintsScriptDtos = getCheckConstraintsScriptDtos(_, ddlProvider)({ collection, dbVersion });

	let tableModificationScriptDtos = [];
	if (!_.isEmpty(columnsToDelete)) {
		const fullCollectionName = generateFullEntityName({ entity: collection, dbVersion });
		const deleteCollectionScript = ddlProvider.dropTable(fullCollectionName);
		const hydratedCollection = hydrateCollection(entityData, definitions);
		const arePkFkConstraintsAvailable = isSupportUnityCatalog(dbVersion);
		const areNotNullConstraintsAvailable = isSupportNotNullConstraints(dbVersion);
		const addCollectionScript = getTableStatement(app)(
			...hydratedCollection,
			arePkFkConstraintsAvailable,
			areNotNullConstraintsAvailable,
			null,
			dbVersion,
			true,
		);
		tableModificationScriptDtos = [
			AlterScriptDto.getInstance([deleteCollectionScript], true, true),
			AlterScriptDto.getInstance([addCollectionScript], true, false),
		];
	}

	const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
	const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
	const alterColumnScriptDtos = AlterScriptDto.getInstances(alterColumnScripts, true, false);

	if (modifiedScript.type === 'new') {
		return [dropIndexScriptDto, ...(modifiedScript.script || []), addIndexScriptDto].filter(Boolean);
	}

	return [
		dropIndexScriptDto,
		...tableModificationScriptDtos,
		...alterColumnScriptDtos,
		...modifiedCommentOnColumnsScriptDtos,
		...modifyNotNullConstraintsScriptDtos,
		...modifyCheckConstraintsScriptDtos,
		...(modifiedScript.script || []),
		addIndexScriptDto,
	].filter(Boolean);
};

module.exports = {
	getAddCollectionsScripts,
	getDeleteCollectionsScripts,
	getModifyCollectionsScripts,
	getModifyCollectionCommentsScripts,
	getAddColumnsScripts,
	getDeleteColumnsScripts,
	getDeleteColumnScripsForOlderRuntime,
	getModifyColumnsScriptsForOlderRuntime,
	getModifyColumnsScripts,
};
