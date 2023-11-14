const {
    getIsChangeProperties,
    generateFullEntityName,
    getEntityData,
    getEntityName,
    getFullEntityName,
    getContainerName,
    getEntityProperties,
    wrapInSingleQuotes
} = require("../../../utils/general");
const {getTableStatement} = require("../../../helpers/tableHelper");
const {AlterScriptDto} = require("../../types/AlterScriptDto");
const {getModifiedTablePropertiesScriptDtos} = require("./modifyPropertiesHelper");

const tableProperties = ['compositeClusteringKey', 'compositePartitionKey', 'isActivated', 'numBuckets', 'skewedby', 'skewedOn', 'skewStoredAsDir', 'sortedByKey', 'storedAsTable', 'temporaryTable', 'using', 'rowFormat', 'fieldsTerminatedBy', 'fieldsescapedBy', 'collectionItemsTerminatedBy', 'mapKeysTerminatedBy', 'linesTerminatedBy', 'nullDefinedAs', 'inputFormatClassname', 'outputFormatClassname'];
const otherTableProperties = ['code', 'collectionName', 'tableProperties', 'description', 'properties', 'serDeLibrary', 'serDeProperties', 'location',];

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
 * @return {(collection: any) => AlterScriptDto | undefined}
 * */
const getModifyLocationScriptDto = (app, ddlProvider) => (collection) => {
    const _ = app.require('lodash');

    const compMod = _.get(collection, 'role.compMod', {});
    const location =  _.get(compMod, 'location', {});
    const oldLocation = location.old;
    const newLocation = location.new;

    if (oldLocation !== newLocation) {
        const fullCollectionName = generateFullEntityName(collection);
        const ddlLocation = wrapInSingleQuotes(newLocation || '');
        const script = ddlProvider.setTableLocation({
            location: ddlLocation,
            fullTableName: fullCollectionName,
        });
        return AlterScriptDto.getInstance([script], true, false);
    }
    return undefined;
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

    const alterTableNameScript = ddlProvider.alterTableName(hydrateAlterTableName(compMod));
    const hydratedSerDeProperties = hydrateSerDeProperties(_)(compMod, fullCollectionName);
    const tablePropertiesScriptDtos = getModifiedTablePropertiesScriptDtos(_, ddlProvider)(collection);
    const serDeProperties = ddlProvider.alterSerDeProperties(hydratedSerDeProperties);
    const modifyLocationScriptDto = getModifyLocationScriptDto(app, ddlProvider)(collection);

    return {
        type: 'modify',
        script: [
            AlterScriptDto.getInstance([alterTableNameScript], true, false),
            ...tablePropertiesScriptDtos,
            AlterScriptDto.getInstance([serDeProperties], true, false),
            modifyLocationScriptDto,
        ]
            .filter(Boolean),
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
    const shouldDropAndRecreate = getIsChangeProperties(_)(compMod, tableProperties);

    if (shouldDropAndRecreate) {
        return getDropAndRecreateCollectionScriptDtos(app, ddlProvider)(collection, definitions, dbVersion);
    }
    return getModifyCollectionScriptDtos(app, ddlProvider)(collection);
}

module.exports = {
    generateModifyCollectionScript,
}
