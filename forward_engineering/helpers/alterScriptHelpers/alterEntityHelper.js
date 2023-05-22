const {dependencies} = require('../appDependencies');
const {getColumns, getColumnsStatement, getColumnsString, getColumnStatement} = require('../columnHelper');
const {getIndexes} = require('../indexHelper');
const {getTableStatement, hydrateTableProperties} = require('../tableHelper');
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
} = require('../../utils/generalUtils');
const {getModifyCollectionCommentsScripts} = require('./entityHelpers/commentsHelper');
const {getModifyCheckConstraintsScripts} = require("./columnHelpers/checkConstraintHelper");
const {getModifyNonNullColumnsScripts} = require("./columnHelpers/nonNullConstraintHelper");
const {getModifiedCommentOnColumnScripts} = require("./columnHelpers/commentsHelper");
const {getModifyPkConstraintsScripts} = require("./entityHelpers/primaryKeyHelper");

let _;
const setDependencies = ({lodash}) => _ = lodash;

const tableProperties = ['compositeClusteringKey', 'compositePartitionKey', 'isActivated', 'location', 'numBuckets', 'skewedby', 'skewedOn', 'skewStoredAsDir', 'sortedByKey', 'storedAsTable', 'temporaryTable', 'using', 'rowFormat', 'fieldsTerminatedBy', 'fieldsescapedBy', 'collectionItemsTerminatedBy', 'mapKeysTerminatedBy', 'linesTerminatedBy', 'nullDefinedAs', 'inputFormatClassname', 'outputFormatClassname'];
const otherTableProperties = ['code', 'collectionName', 'tableProperties', 'description', 'properties', 'serDeLibrary', 'serDeProperties'];

/**
 * @typedef {import('./alterScriptHelpers/types/AlterScriptDto').AlterScriptDto} AlterScriptDto
 * */

const hydrateSerDeProperties = (compMod, name) => {
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

const hydrateAlterColumnName = (entity, properties = {}) => {
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

const hydrateAlterColumnType = (properties = {}) => {
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

const hydrateDropIndexes = entity => {
    const bloomIndex = _.get(entity, 'BloomIndxs', []);
    return bloomIndex.length ? generateFullEntityName(entity) : '';
};

const hydrateAddIndexes = (entity, BloomIndxs, properties, definitions) => {
    const compMod = _.get(entity, 'role.compMod', {});
    const entityData = _.get(entity, 'role', {});
    const containerData = {name: getContainerName(compMod)};
    return [[containerData], [entityData, {}, {BloomIndxs}], {...entityData, properties}, definitions];
};

const hydrateIndex = (entity, properties, definitions) => {
    const bloomIndex = _.get(entity, 'role.compMod.BloomIndxs', {});
    const {drop, add} = getDifferentItems(_)(bloomIndex.new, bloomIndex.old);
    return {
        hydratedDropIndex: hydrateDropIndexes({...entity, BloomIndxs: drop}),
        hydratedAddIndex: hydrateAddIndexes(entity, add, properties, definitions),
    };
}

const hydrateCollection = (entity, definitions) => {
    const compMod = _.get(entity, 'role.compMod', {});
    const entityData = _.get(entity, 'role', {});
    const properties = getEntityProperties(entity);
    const containerData = {name: getContainerName(compMod)};
    return [[containerData], [entityData], {...entityData, properties}, definitions];
};

/**
 * @return {(collection: any, definitions: any, ddlProvider: any) => {
 *         type: 'modify',
 *         script: Array<string>
 * }}
 * */
const generateModifyCollectionScript = (app) => (collection, definitions, ddlProvider) => {
    const compMod = _.get(collection, 'role.compMod', {});
    const isChangedProperties = getIsChangeProperties(_)(compMod, tableProperties);
    const fullCollectionName = generateFullEntityName(collection);
    if (isChangedProperties) {
        const roleData = getEntityData(compMod, tableProperties.concat(otherTableProperties));
        const hydratedCollection = hydrateCollection({
            ...collection,
            role: {...collection.role, ...roleData}
        }, definitions);
        const addCollectionScript = getTableStatement(app)(...hydratedCollection, true);
        const deleteCollectionScript = ddlProvider.dropTable(fullCollectionName);
        return {type: 'new', script: prepareScript(deleteCollectionScript, addCollectionScript)};
    }

    const dataProperties = _.get(compMod, 'tableProperties', '');
    const alterTableNameScript = ddlProvider.alterTableName(hydrateAlterTableName(compMod));
    const hydratedTableProperties = hydrateTableProperties(_)(dataProperties, fullCollectionName);
    const hydratedSerDeProperties = hydrateSerDeProperties(compMod, fullCollectionName);
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
const getAddCollectionsScripts = (app, definitions) => entity => {
    const _ = app.require('lodash');
    setDependencies(dependencies);
    const properties = getEntityProperties(entity);
    const indexes = _.get(entity, 'role.BloomIndxs', [])
    const hydratedCollection = hydrateCollection(entity, definitions);
    const collectionScript = getTableStatement(app)(...hydratedCollection, true);
    const indexScript = getIndexes(...hydrateAddIndexes(entity, indexes, properties, definitions));

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
    setDependencies(dependencies);
    const entityData = {...entity, ..._.get(entity, 'role', {})};
    const fullCollectionName = generateFullEntityName(entity)
    const collectionScript = provider.dropTable(fullCollectionName);
    const indexScript = provider.dropTableIndex(hydrateDropIndexes(entityData));

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
const getModifyCollectionsScripts = (app, definitions, ddlProvider) => collection => {
    setDependencies(dependencies);
    const properties = getEntityProperties(collection);
    const {script} = generateModifyCollectionScript(app)(collection, definitions, ddlProvider);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(collection, properties, definitions);
    const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);

    const dropIndexScriptDto = {
        isActivated: true,
        scripts: [{
            isDropScript: true,
            script: dropIndexScript
        }]
    }
    const addIndexScriptDto = {
        isActivated: true,
        scripts: [{
            isDropScript: false,
            script: addIndexScript
        }]
    }
    const modifyTableScriptDtos = script.map(script => ({
        isActivated: true,
        scripts: [{
            isDropScript: false,
            script
        }]
    }))

    return [
        dropIndexScriptDto,
        ...modifyTableScriptDtos,
        addIndexScriptDto,
    ].map((dto) => {
        const scriptModificationDtosWithNonEmptyScripts = dto.scripts.filter(scriptModificationDto => scriptModificationDto.script?.length);
        if (!scriptModificationDtosWithNonEmptyScripts?.length) {
            return undefined;
        }
        return {
            ...dto,
            scripts: scriptModificationDtosWithNonEmptyScripts,
        }
    })
        .filter(Boolean);
};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getAddColumnsScripts = (app, definitions, provider) => entity => {
    setDependencies(dependencies);
    const entityData = {...entity, ..._.omit(entity.role, ['properties'])};
    const {columns} = getColumns(entityData, true, definitions);
    const properties = getEntityProperties(entity);
    const columnStatement = getColumnsStatement(columns);
    const fullCollectionName = generateFullEntityName(entity);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(entity, properties, definitions);
    const modifyScript = generateModifyCollectionScript(app)(entity, definitions, provider);
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);
    const addColumnScript = provider.addTableColumns({name: fullCollectionName, columns: columnStatement});



    return modifyScript.type === 'new' ?
        prepareScript(dropIndexScript, ...modifyScript.script, addIndexScript) :
        prepareScript(dropIndexScript, addColumnScript, ...modifyScript.script, addIndexScript);
};

const getDeleteColumnsScripts = (app, definitions, provider) => entity => {
    setDependencies(dependencies);
    const entityData = {
        ...entity,
        ..._.omit(entity.role, ['properties']),
        properties: _.pickBy(entity.properties || {}, column => !column.compMod)
    };
    const {columns} = getColumns(entityData, true, definitions);
    const properties = getEntityProperties(entity);
    const columnStatement = getColumnsString(Object.keys(columns));
    const fullCollectionName = generateFullEntityName(entity);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(entity, properties, definitions);
    const modifyScript = generateModifyCollectionScript(app)(entity, definitions, provider);
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);
    const deleteColumnScript = provider.dropTableColumns({name: fullCollectionName, columns: columnStatement});

    return modifyScript.type === 'new' ?
        prepareScript(dropIndexScript, ...modifyScript.script, addIndexScript) :
        prepareScript(dropIndexScript, deleteColumnScript, ...modifyScript.script, addIndexScript);
};

const getDeleteColumnScripsForOlderRuntime = (app, definitions, provider) => entity => {
    const _ = app.require('lodash');
    const deleteColumnsName = _.filter(Object.keys(entity.properties || {}), name => !entity.properties[name].compMod);
    const properties = _.omit(_.get(entity, 'role.properties', {}), deleteColumnsName);
    const entityData = {role: {..._.omit(entity.role, ['properties']), properties}};
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(entity, properties, definitions);
    const fullCollectionName = generateFullEntityName(entity)
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);
    const deleteCollectionScript = provider.dropTable(fullCollectionName);
    const hydratedCollection = hydrateCollection(entityData, definitions);
    const addCollectionScript = getTableStatement(app)(...hydratedCollection, true);

    return prepareScript(dropIndexScript, deleteCollectionScript, addCollectionScript, addIndexScript);
};

const getModifyColumnsScripts = (app, definitions, ddlProvider) => collection => {
    setDependencies(dependencies);
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
    const hydratedAlterColumnName = hydrateAlterColumnName(collection, properties);
    const alterColumnScripts = ddlProvider.alterTableColumnName(hydratedAlterColumnName);
    const modifiedScript = generateModifyCollectionScript(app)(entityData, definitions, ddlProvider);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(collection, properties, definitions);
    const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);

    const fullCollectionName = generateFullEntityName(collection);
    const modifiedCommentOnColumnsScripts = getModifiedCommentOnColumnScripts(_, ddlProvider)(collection);
    const modifyNotNullConstraintsScripts = getModifyNonNullColumnsScripts(_, ddlProvider)(collection);
    const modifyCheckConstraintsScripts = getModifyCheckConstraintsScripts(_, ddlProvider)(collection);
    const {columnsToDelete, columnsToAdd} = hydrateAlterColumnType(properties);
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
    const modifyPaired = _.flatten(_.zip(deleteColumnScripts, addColumnScripts));
    return modifiedScript.type === 'new' ?
        prepareScript(dropIndexScript, ...modifiedScript.script, addIndexScript) :
        prepareScript(
            dropIndexScript,
            ...modifyPaired,
            ...alterColumnScripts,
            ...modifiedCommentOnColumnsScripts,
            ...modifyNotNullConstraintsScripts,
            ...modifyCheckConstraintsScripts,
            ...modifiedScript.script,
            addIndexScript
        );
};

const getModifyColumnsScriptsForOlderRuntime = (app, definitions, ddlProvider) => collection => {
    setDependencies(dependencies);
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
    const hydratedAlterColumnName = hydrateAlterColumnName(collection, properties);
    const alterColumnScripts = ddlProvider.alterTableColumnName(hydratedAlterColumnName);
    const modifiedScript = generateModifyCollectionScript(app)(entityData, definitions, ddlProvider);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(collection, properties, definitions);
    const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);

    const {columnsToDelete} = hydrateAlterColumnType(properties);
    const modifiedCommentOnColumnsScripts = getModifiedCommentOnColumnScripts(_, ddlProvider)(collection);
    const modifyNotNullConstraintsScripts = getModifyNonNullColumnsScripts(_, ddlProvider)(collection);
    const modifyCheckConstraintsScripts = getModifyCheckConstraintsScripts(_, ddlProvider)(collection);
    let tableModificationScripts = [];
    if (!_.isEmpty(columnsToDelete)) {
        const fullCollectionName = generateFullEntityName(collection);
        const deleteCollectionScript = ddlProvider.dropTable(fullCollectionName);
        const hydratedCollection = hydrateCollection(entityData, definitions);
        const addCollectionScript = getTableStatement(app)(...hydratedCollection, true);
        tableModificationScripts = [deleteCollectionScript, addCollectionScript];
    }

    return modifiedScript.type === 'new' ?
        prepareScript(dropIndexScript, ...modifiedScript.script, addIndexScript) :
        prepareScript(
            dropIndexScript,
            ...tableModificationScripts,
            ...alterColumnScripts,
            ...modifiedCommentOnColumnsScripts,
            ...modifyNotNullConstraintsScripts,
            ...modifyCheckConstraintsScripts,
            ...modifiedScript.script,
            addIndexScript
        );
}

module.exports = {
    getAddCollectionsScripts,
    getDeleteCollectionsScripts,
    getModifyCollectionsScripts,
    getModifyCollectionCommentsScripts,
    getModifyPkConstraintsScripts,
    getAddColumnsScripts,
    getDeleteColumnsScripts,
    getDeleteColumnScripsForOlderRuntime,
    getModifyColumnsScriptsForOlderRuntime,
    getModifyColumnsScripts
}
