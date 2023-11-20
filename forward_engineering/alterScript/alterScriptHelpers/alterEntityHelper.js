const {getColumns, getColumnsString} = require('../../helpers/columnHelper');
const {getIndexes} = require('../../helpers/indexHelper');
const {getTableStatement} = require('../../helpers/tableHelper');
const {hydrateAddIndexes, hydrateDropIndexes, hydrateIndex} = require('./entityHelpers/indexHelper');
const {generateModifyCollectionScript} = require('./entityHelpers/modifyCollectionScript');
const {getAddColumnsScripts} = require('./entityHelpers/addColumnsHelper');
const {
    generateFullEntityName,
    getEntityProperties,
    getContainerName,
} = require('../../utils/general');
const {getModifyCollectionCommentsScripts} = require('./entityHelpers/commentsHelper');
const {getCheckConstraintsScriptDtos} = require("./columnHelpers/checkConstraintHelper");
const {getModifyNonNullColumnsScriptDtos} = require("./columnHelpers/nonNullConstraintHelper");
const {getModifiedCommentOnColumnScriptDtos} = require("./columnHelpers/commentsHelper");
const {AlterScriptDto} = require("../types/AlterScriptDto");
const {getModifiedDefaultColumnValueScriptDtos} = require("./columnHelpers/defaultValueHelper");
const {getUpdateTypesScriptDtos} = require("./columnHelpers/alterTypeHelper");

const hydrateAlterColumnName = (_) => (entity, properties = {}) => {
    const collectionName = generateFullEntityName(entity);
    const columns = Object.values(properties).map(property => {
        const compMod = _.get(property, 'compMod', {});
        const {newField = {}, oldField = {}} = compMod;
        return newField.name && oldField.name && newField.name !== oldField.name
            ? {oldName: oldField.name, newName: newField.name}
            : '';
    });
    return {collectionName, columns: columns.filter(Boolean)};
}

const hydrateAlterColumnType = (_) => (properties = {}) => {
    const isChangedType = (newField, oldField) => newField.type && oldField.type && (newField.type !== oldField.type || newField.mode !== oldField.mode);
    const columns = Object.values(properties).map(property => {
        const compMod = _.get(property, 'compMod', {});
        const {newField = {}, oldField = {}} = compMod;
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
            ? {oldName: oldField.name, newName: newField.name}
            : '';
    });
    const columnsToDelete = columns.map(column => column.oldName).filter(name => Boolean(name));
    const columnsToAdd = columns.map(column => column.newName).filter(name => Boolean(name));
    return {columnsToDelete, columnsToAdd};
}

const hydrateCollection = (_) => (entity, definitions) => {
    const compMod = _.get(entity, 'role.compMod', {});
    const entityData = _.get(entity, 'role', {});
    const properties = getEntityProperties(entity);
    const containerData = {name: getContainerName(compMod)};
    return [[containerData], [entityData], {...entityData, properties}, definitions];
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getAddCollectionsScripts = (app, definitions, dbVersion) => entity => {
    const _ = app.require('lodash');
    const properties = getEntityProperties(entity);
    const indexes = _.get(entity, 'role.BloomIndxs', [])
    const hydratedCollection = hydrateCollection(_)(entity, definitions);
    const collectionScript = getTableStatement(app)(...hydratedCollection, true, dbVersion);
    const indexScript = getIndexes(_)(...hydrateAddIndexes(_)(entity, indexes, properties, definitions));

    return [collectionScript, indexScript]
        .filter(Boolean)
        .map(script => ({
            isActivated: true,
            scripts: [{
                isDropScript: false,
                script
            }]
        }));
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getDeleteCollectionsScripts = (app, provider) => entity => {
    const _ = app.require('lodash');
    const entityData = {...entity, ..._.get(entity, 'role', {})};
    const fullCollectionName = generateFullEntityName(entity)
    const collectionScript = provider.dropTable(fullCollectionName);
    const indexScript = provider.dropTableIndex(hydrateDropIndexes(_)(entityData));

    return [indexScript, collectionScript]
        .filter(Boolean)
        .map(script => ({
            isActivated: true,
            scripts: [{
                isDropScript: true,
                script
            }]
        }));
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getModifyCollectionsScripts = (app, definitions, ddlProvider, dbVersion) => collection => {
    const _ = app.require('lodash');
    const properties = getEntityProperties(collection);
    const {script: modifyTableScriptDtos} = generateModifyCollectionScript(app)(collection, definitions, ddlProvider, dbVersion);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(_)(collection, properties, definitions);
    const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(_)(...hydratedAddIndex);

    const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
    const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);

    return [
        dropIndexScriptDto,
        ...modifyTableScriptDtos,
        addIndexScriptDto,
    ]
        .filter(Boolean);
};

const getDeleteColumnsScripts = (app, definitions, provider, dbVersion) => entity => {
    const _ = app.require('lodash');
    const entityData = {
        ...entity,
        ..._.omit(entity.role, ['properties']),
        properties: _.pickBy(entity.properties || {}, column => !column.compMod)
    };
    const {columns} = getColumns(entityData, true, definitions);
    const properties = getEntityProperties(entity);
    const columnStatement = getColumnsString(Object.keys(columns));
    const fullCollectionName = generateFullEntityName(entity);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(_)(entity, properties, definitions);
    const modifyScript = generateModifyCollectionScript(app)(entity, definitions, provider, dbVersion);
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(_)(...hydratedAddIndex);
    const deleteColumnScript = provider.dropTableColumns({name: fullCollectionName, columns: columnStatement});

    const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
    const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
    const deleteColumnScriptDto = AlterScriptDto.getInstance([deleteColumnScript], true, false);

    if (modifyScript.type === 'new') {
        return [dropIndexScriptDto, ...(modifyScript.script || []), addIndexScriptDto]
            .filter(Boolean)
    }

    return [dropIndexScriptDto, deleteColumnScriptDto, ...(modifyScript.script || []), addIndexScriptDto]
        .filter(Boolean);
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getDeleteColumnScripsForOlderRuntime = (app, definitions, provider, dbVersion) => entity => {
    const _ = app.require('lodash');
    const deleteColumnsName = _.filter(Object.keys(entity.properties || {}), name => !entity.properties[name].compMod);
    const properties = _.omit(_.get(entity, 'role.properties', {}), deleteColumnsName);
    const entityData = {role: {..._.omit(entity.role, ['properties']), properties}};
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(_)(entity, properties, definitions);
    const fullCollectionName = generateFullEntityName(entity)
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(_)(...hydratedAddIndex);
    const deleteCollectionScript = provider.dropTable(fullCollectionName);
    const hydratedCollection = hydrateCollection(_)(entityData, definitions);
    const addCollectionScript = getTableStatement(app)(...hydratedCollection, true, dbVersion);

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
    const _ = app.require('lodash');
    const properties = _.get(collection, 'properties', {});
    const unionProperties = _.unionWith(
        Object.entries(properties),
        Object.entries(_.get(collection, 'role.properties', {})),
        (firstProperty, secondProperty) => _.isEqual(_.get(firstProperty, '[1].GUID'), _.get(secondProperty, '[1].GUID'))
    );
    const entityData = {
        role: {
            ..._.omit(collection.role || {}, ['properties']),
            properties: Object.fromEntries(unionProperties)
        }
    };
    const hydratedAlterColumnName = hydrateAlterColumnName(_)(collection, properties);
    const alterColumnScripts = ddlProvider.alterTableColumnName(hydratedAlterColumnName);
    const modifiedScript = generateModifyCollectionScript(app)(entityData, definitions, ddlProvider, dbVersion);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(_)(collection, properties, definitions);
    const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(_)(...hydratedAddIndex);

    const modifiedCommentOnColumnsScriptDtos = getModifiedCommentOnColumnScriptDtos(_, ddlProvider)(collection);
    const modifyNotNullConstraintsScriptDtos = getModifyNonNullColumnsScriptDtos(_, ddlProvider)(collection);
    const modifyCheckConstraintsScriptDtos = getCheckConstraintsScriptDtos(_, ddlProvider)(collection);
    const modifiedDefaultColumnValueScriptDtos = getModifiedDefaultColumnValueScriptDtos(_, ddlProvider)(collection);

    const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
    const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
    const alterColumnScriptDtos = AlterScriptDto.getInstances(alterColumnScripts, true, false);

    if (modifiedScript.type === 'new') {
        return [dropIndexScriptDto, ...(modifiedScript.script || []), addIndexScriptDto]
            .filter(Boolean);
    }

    const updateTypeScriptDtos = getUpdateTypesScriptDtos(_, ddlProvider)(collection, definitions);

    return [
        dropIndexScriptDto,
        ...updateTypeScriptDtos,
        ...alterColumnScriptDtos,
        ...modifiedCommentOnColumnsScriptDtos,
        ...modifyNotNullConstraintsScriptDtos,
        ...modifyCheckConstraintsScriptDtos,
        ...modifiedDefaultColumnValueScriptDtos,
        ...(modifiedScript.script || []),
        addIndexScriptDto
    ]
        .filter(Boolean);
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getModifyColumnsScriptsForOlderRuntime = (
    app,
    definitions,
    ddlProvider,
    dbVersion
) => collection => {
    const _ = app.require('lodash');
    const properties = _.get(collection, 'properties', {});
    const unionProperties = _.unionWith(
        Object.entries(properties),
        Object.entries(_.get(collection, 'role.properties', {})),
        (firstProperty, secondProperty) => _.isEqual(_.get(firstProperty, '[1].GUID'), _.get(secondProperty, '[1].GUID'))
    );
    const entityData = {
        role: {
            ..._.omit(collection.role || {}, ['properties']),
            properties: Object.fromEntries(unionProperties)
        }
    };
    const hydratedAlterColumnName = hydrateAlterColumnName(_)(collection, properties);
    const alterColumnScripts = ddlProvider.alterTableColumnName(hydratedAlterColumnName);
    const modifiedScript = generateModifyCollectionScript(app)(entityData, definitions, ddlProvider, dbVersion);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(_)(collection, properties, definitions);
    const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(_)(...hydratedAddIndex);

    const {columnsToDelete} = hydrateAlterColumnType(_)(properties);
    const modifiedCommentOnColumnsScriptDtos = getModifiedCommentOnColumnScriptDtos(_, ddlProvider)(collection);
    const modifyNotNullConstraintsScriptDtos = getModifyNonNullColumnsScriptDtos(_, ddlProvider)(collection);
    const modifyCheckConstraintsScriptDtos = getCheckConstraintsScriptDtos(_, ddlProvider)(collection);

    let tableModificationScriptDtos = [];
    if (!_.isEmpty(columnsToDelete)) {
        const fullCollectionName = generateFullEntityName(collection);
        const deleteCollectionScript = ddlProvider.dropTable(fullCollectionName);
        const hydratedCollection = hydrateCollection(_)(entityData, definitions);
        const addCollectionScript = getTableStatement(app)(...hydratedCollection, true, dbVersion);
        tableModificationScriptDtos = [
            AlterScriptDto.getInstance([deleteCollectionScript], true, true),
            AlterScriptDto.getInstance([addCollectionScript], true, false),
        ];
    }

    const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
    const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
    const alterColumnScriptDtos = AlterScriptDto.getInstances(alterColumnScripts, true, false);

    if (modifiedScript.type === 'new') {
        return [dropIndexScriptDto, ...(modifiedScript.script || []), addIndexScriptDto]
            .filter(Boolean);
    }

    return [
        dropIndexScriptDto,
        ...tableModificationScriptDtos,
        ...alterColumnScriptDtos,
        ...modifiedCommentOnColumnsScriptDtos,
        ...modifyNotNullConstraintsScriptDtos,
        ...modifyCheckConstraintsScriptDtos,
        ...(modifiedScript.script || []),
        addIndexScriptDto
    ].filter(Boolean);
}

module.exports = {
    getAddCollectionsScripts,
    getDeleteCollectionsScripts,
    getModifyCollectionsScripts,
    getModifyCollectionCommentsScripts,
    getAddColumnsScripts,
    getDeleteColumnsScripts,
    getDeleteColumnScripsForOlderRuntime,
    getModifyColumnsScriptsForOlderRuntime,
    getModifyColumnsScripts
}
