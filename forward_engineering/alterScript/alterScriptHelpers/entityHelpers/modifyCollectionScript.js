const {
    getIsChangeProperties,
    generateFullEntityName,
    getEntityData,
    getEntityName,
    getFullEntityName,
    getContainerName,
    getEntityProperties
} = require("../../../utils/general");
const {getTableStatement, hydrateTableProperties} = require("../../../helpers/tableHelper");
const {AlterScriptDto} = require("../../types/AlterScriptDto");

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

const hydrateCollection = (_) => (entity, definitions) => {
    const compMod = _.get(entity, 'role.compMod', {});
    const entityData = _.get(entity, 'role', {});
    const properties = getEntityProperties(entity);
    const containerData = {name: getContainerName(compMod)};
    return [[containerData], [entityData], {...entityData, properties}, definitions];
};

/**
 * @return {(collection: any, definitions: any, dbVersion: any) => {
 *         type: 'modify' | 'new',
 *         script: Array<AlterScriptDto>
 * }}
 * */
const getDropAndRecreateCollectionScriptDtos = (app, ddlProvider) => (collection, definitions, dbVersion) => {
    const _ = app.require('lodash');

    const compMod = _.get(collection, 'role.compMod', {});
    const fullCollectionName = generateFullEntityName(collection);
    const roleData = getEntityData(compMod, tableProperties.concat(otherTableProperties));
    const hydratedCollection = hydrateCollection(_)({
        ...collection,
        role: {...collection.role, ...roleData}
    }, definitions);
    const addCollectionScript = getTableStatement(app)(...hydratedCollection, true, dbVersion);
    const deleteCollectionScript = ddlProvider.dropTable(fullCollectionName);
    return {
        type: 'new',
        script: [
            AlterScriptDto.getInstance([deleteCollectionScript], true, true),
            AlterScriptDto.getInstance([addCollectionScript], true, false),
        ]
            .filter(Boolean),
    };
}

/**
 * @return {(collection: any, definitions: any, dbVersion: any) => {
 *         type: 'modify' | 'new',
 *         script: Array<AlterScriptDto>
 * }}
 * */
const getModifyCollectionScriptDtos = (app, ddlProvider) => (collection) => {
    const _ = app.require('lodash');

    const compMod = _.get(collection, 'role.compMod', {});
    const fullCollectionName = generateFullEntityName(collection);
    const dataProperties = _.get(compMod, 'tableProperties', '');

    const alterTableNameScript = ddlProvider.alterTableName(hydrateAlterTableName(compMod));
    const hydratedTableProperties = hydrateTableProperties(_)(dataProperties, fullCollectionName);
    const hydratedSerDeProperties = hydrateSerDeProperties(_)(compMod, fullCollectionName);
    const tablePropertiesScript = ddlProvider.alterTableProperties(hydratedTableProperties);
    const serDeProperties = ddlProvider.alterSerDeProperties(hydratedSerDeProperties)
    return {
        type: 'modify',
        script: [
            AlterScriptDto.getInstance([alterTableNameScript], true, false),
            AlterScriptDto.getInstances(tablePropertiesScript, true, false),
            AlterScriptDto.getInstance([serDeProperties], true, false),
        ],
    };
}

/**
 * @return {(collection: any, definitions: any, ddlProvider: any) => {
 *         type: 'modify' | 'new',
 *         script: Array<AlterScriptDto>
 * }}
 * */
const generateModifyCollectionScript = (app) => (collection, definitions, ddlProvider, dbVersion) => {
    const _ = app.require('lodash');
    const compMod = _.get(collection, 'role.compMod', {});
    const isChangedProperties = getIsChangeProperties(_)(compMod, tableProperties);

    if (isChangedProperties) {
        return getDropAndRecreateCollectionScriptDtos(app, ddlProvider)(collection, definitions, dbVersion);
    }
    return getModifyCollectionScriptDtos(app, ddlProvider)(collection);
}

module.exports = {
    generateModifyCollectionScript,
}
