const {getColumns, getColumnsStatement, getColumnsString, getColumnStatement} = require('../../helpers/columnHelper');
const {getIndexes} = require('../../helpers/indexHelper');
const {getTableStatement, hydrateTableProperties} = require('../../helpers/tableHelper');
const {
    getFullEntityName,
    generateFullEntityName,
    getEntityProperties,
    getContainerName,
    getEntityData,
    getEntityName,
    prepareScript,
    getIsChangeProperties,
    getDifferentItems,
} = require('../../utils/general');
const {getModifyCollectionCommentsScripts} = require('./entityHelpers/commentsHelper');
const {getModifyCheckConstraintsScriptDtos} = require("./columnHelpers/checkConstraintHelper");
const {getModifyNonNullColumnsScriptDtos} = require("./columnHelpers/nonNullConstraintHelper");
const {getModifiedCommentOnColumnScriptDtos} = require("./columnHelpers/commentsHelper");
const {AlterScriptDto} = require("../types/AlterScriptDto");

const tableProperties = ['compositeClusteringKey', 'compositePartitionKey', 'isActivated', 'location', 'numBuckets', 'skewedby', 'skewedOn', 'skewStoredAsDir', 'sortedByKey', 'storedAsTable', 'temporaryTable', 'using', 'rowFormat', 'fieldsTerminatedBy', 'fieldsescapedBy', 'collectionItemsTerminatedBy', 'mapKeysTerminatedBy', 'linesTerminatedBy', 'nullDefinedAs', 'inputFormatClassname', 'outputFormatClassname'];
const otherTableProperties = ['code', 'collectionName', 'tableProperties', 'description', 'properties', 'serDeLibrary', 'serDeProperties'];

const hydrateSerDeProperties = (_) => (compMod, name) => {
    const {serDeProperties, serDeLibrary} = compMod
    return {
        properties: !_.isEqual(serDeProperties?.new, serDeProperties?.old) && serDeProperties?.new,
        serDe: !_.isEqual(serDeLibrary?.new, serDeLibrary?.old) && serDeLibrary?.new,
        name
    };
}

const hydrateAlterTableName = compMod => {
    const {newName, oldName} = getEntityName(compMod);
    if (!newName && !oldName || (newName === oldName)) {
        return {};
    }
    return {
        oldName: getFullEntityName(getContainerName(compMod), oldName),
        newName: getFullEntityName(getContainerName(compMod), newName),
    };
};

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

const hydrateDropIndexes = (_) => entity => {
    const bloomIndex = _.get(entity, 'BloomIndxs', []);
    return bloomIndex.length ? generateFullEntityName(entity) : '';
};

const hydrateAddIndexes = (_) => (entity, BloomIndxs, properties, definitions) => {
    const compMod = _.get(entity, 'role.compMod', {});
    const entityData = _.get(entity, 'role', {});
    const containerData = {name: getContainerName(compMod)};
    return [[containerData], [entityData, {}, {BloomIndxs}], {...entityData, properties}, definitions];
};

const hydrateIndex = (_) => (entity, properties, definitions) => {
    const bloomIndex = _.get(entity, 'role.compMod.BloomIndxs', {});
    const {drop, add} = getDifferentItems(_)(bloomIndex.new, bloomIndex.old);
    return {
        hydratedDropIndex: hydrateDropIndexes(_)({...entity, BloomIndxs: drop}),
        hydratedAddIndex: hydrateAddIndexes(_)(entity, add, properties, definitions),
    };
}

const hydrateCollection = (_) => (entity, definitions) => {
    const compMod = _.get(entity, 'role.compMod', {});
    const entityData = _.get(entity, 'role', {});
    const properties = getEntityProperties(entity);
    const containerData = {name: getContainerName(compMod)};
    return [[containerData], [entityData], {...entityData, properties}, definitions];
};

/**
 * @return {(collection: any, definitions: any, ddlProvider: any) => {
 *         type: 'modify' | 'new',
 *         script: Array<string>
 * }}
 * */
const generateModifyCollectionScript = (app) => (collection, definitions, ddlProvider, dbVersion) => {
    const _ = app.require('lodash');
    const compMod = _.get(collection, 'role.compMod', {});
    const isChangedProperties = getIsChangeProperties(_)(compMod, tableProperties);
    const fullCollectionName = generateFullEntityName(collection);
    if (isChangedProperties) {
        const roleData = getEntityData(compMod, tableProperties.concat(otherTableProperties));
        const hydratedCollection = hydrateCollection(_)({
            ...collection,
            role: {...collection.role, ...roleData}
        }, definitions);
        const addCollectionScript = getTableStatement(app)(...hydratedCollection, true, dbVersion);
        const deleteCollectionScript = ddlProvider.dropTable(fullCollectionName);
        return {type: 'new', script: prepareScript(deleteCollectionScript, addCollectionScript)};
    }

    const dataProperties = _.get(compMod, 'tableProperties', '');
    const alterTableNameScript = ddlProvider.alterTableName(hydrateAlterTableName(compMod));
    const hydratedTableProperties = hydrateTableProperties(_)(dataProperties, fullCollectionName);
    const hydratedSerDeProperties = hydrateSerDeProperties(_)(compMod, fullCollectionName);
    const tablePropertiesScript = ddlProvider.alterTableProperties(hydratedTableProperties);
    const serDeProperties = ddlProvider.alterSerDeProperties(hydratedSerDeProperties)
    return {
        type: 'modify',
        script: prepareScript(
            alterTableNameScript,
            ...tablePropertiesScript,
            serDeProperties
        )
    };
}

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
    const {script} = generateModifyCollectionScript(app)(collection, definitions, ddlProvider, dbVersion);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(_)(collection, properties, definitions);
    const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(_)(...hydratedAddIndex);

    const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
    const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
    const modifyTableScriptDtos = AlterScriptDto.getInstances(script, true, false);

    return [
        dropIndexScriptDto,
        ...modifyTableScriptDtos,
        addIndexScriptDto,
    ]
        .filter(Boolean);
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getAddColumnsScripts = (app, definitions, provider, dbVersion) => entity => {
    const _ = app.require('lodash');
    const entityData = {...entity, ..._.omit(entity.role, ['properties'])};
    const {columns} = getColumns(entityData, true, definitions);
    const properties = getEntityProperties(entity);
    const columnStatement = getColumnsStatement(columns);
    const fullCollectionName = generateFullEntityName(entity);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(_)(entity, properties, definitions);
    const modifyScript = generateModifyCollectionScript(app)(entity, definitions, provider, dbVersion);
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(_)(...hydratedAddIndex);
    const addColumnScript = provider.addTableColumns({name: fullCollectionName, columns: columnStatement});

    const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
    const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
    const addColumnScriptDto = AlterScriptDto.getInstance([addColumnScript], true, false);
    const modifyCollectionScriptDtos = AlterScriptDto.getInstances(modifyScript.script, true, false);

    if (modifyScript.type === 'new') {
        return [dropIndexScriptDto, ...modifyCollectionScriptDtos, addIndexScriptDto]
            .filter(Boolean)
    }

    return [dropIndexScriptDto, addColumnScriptDto, ...modifyCollectionScriptDtos, addIndexScriptDto]
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
    const modifyCollectionScriptDtos = AlterScriptDto.getInstances(modifyScript.script, true, false);

    if (modifyScript.type === 'new') {
        return [dropIndexScriptDto, ...modifyCollectionScriptDtos, addIndexScriptDto]
            .filter(Boolean)
    }

    return [dropIndexScriptDto, deleteColumnScriptDto, ...modifyCollectionScriptDtos, addIndexScriptDto]
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

    const fullCollectionName = generateFullEntityName(collection);
    const modifiedCommentOnColumnsScriptDtos = getModifiedCommentOnColumnScriptDtos(_, ddlProvider)(collection);
    const modifyNotNullConstraintsScriptDtos = getModifyNonNullColumnsScriptDtos(_, ddlProvider)(collection);
    const modifyCheckConstraintsScriptDtos = getModifyCheckConstraintsScriptDtos(_, ddlProvider)(collection);
    const {columnsToDelete, columnsToAdd} = hydrateAlterColumnType(_)(properties);
    const {columns: columnsInfo} = getColumns(entityData.role, true, definitions);
    const deleteColumnScripts = _.map(columnsToDelete, column => ddlProvider.dropTableColumn({
        name: fullCollectionName,
        column
    }));
    const addColumnScripts = _.map(columnsToAdd, column =>
        ddlProvider.addTableColumn({
            name: fullCollectionName,
            column: getColumnStatement({name: column, ...columnsInfo[column]})
        }));

    const modifyPairedScriptDtos = _.flatten(
        _.zip(
            (deleteColumnScripts || []).map(script => AlterScriptDto.getInstance([script], true, true)),
            (addColumnScripts || []).map(script => AlterScriptDto.getInstance([script], true, false)),
        )
    );
    const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
    const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
    const modifyCollectionScriptDtos = AlterScriptDto.getInstances(modifiedScript.script, true, false);
    const alterColumnScriptDtos = AlterScriptDto.getInstances(alterColumnScripts, true, false);

    if (modifiedScript.type === 'new') {
        return [dropIndexScriptDto, ...modifyCollectionScriptDtos, addIndexScriptDto]
            .filter(Boolean);
    }

    return [
        dropIndexScriptDto,
        ...modifyPairedScriptDtos,
        ...alterColumnScriptDtos,
        ...modifiedCommentOnColumnsScriptDtos,
        ...modifyNotNullConstraintsScriptDtos,
        ...modifyCheckConstraintsScriptDtos,
        ...modifyCollectionScriptDtos,
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
    const modifyCheckConstraintsScriptDtos = getModifyCheckConstraintsScriptDtos(_, ddlProvider)(collection);
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
    const modifyCollectionScriptDtos = AlterScriptDto.getInstances(modifiedScript.script, true, false);
    const alterColumnScriptDtos = AlterScriptDto.getInstances(alterColumnScripts, true, false);

    if (modifiedScript.type === 'new') {
        return [dropIndexScriptDto, ...modifyCollectionScriptDtos, addIndexScriptDto]
            .filter(Boolean);
    }

    return [
        dropIndexScriptDto,
        ...tableModificationScriptDtos,
        ...alterColumnScriptDtos,
        ...modifiedCommentOnColumnsScriptDtos,
        ...modifyNotNullConstraintsScriptDtos,
        ...modifyCheckConstraintsScriptDtos,
        ...modifyCollectionScriptDtos,
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
