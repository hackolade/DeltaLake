'use strict';

const {setDependencies} = require('./helpers/appDependencies');
const {getDatabaseStatement} = require('./helpers/databaseHelper');
const {getTableStatement} = require('./helpers/tableHelper');
const {getIndexes} = require('./helpers/indexHelper');
const {getViewScript} = require('./helpers/viewHelper');
const {getCleanedUrl, getTab, buildScript} = require('./utils/generalUtils');
const fetchRequestHelper = require('../reverse_engineering/helpers/fetchRequestHelper')
const databricksHelper = require('../reverse_engineering/helpers/databricksHelper')
const logHelper = require('../reverse_engineering/logHelper');
const {getAlterScriptDtos, joinAlterScriptDtosIntoAlterScript} = require('./helpers/alterScriptFromDeltaHelper');
const {getCreateRelationshipScripts} = require("./helpers/relationshipHelper");

/**
 * @typedef {import('./helpers/alterScriptHelpers/types/AlterScriptDto').AlterScriptDto} AlterScriptDto
 * @typedef {import('./types/coreApplicationTypes').App} App
 * @typedef {import('./types/coreApplicationTypes').Logger} Logger
 * @typedef {import('./types/coreApplicationTypes').CoreData} CoreData
 * @typedef {import('./types/coreApplicationTypes').PluginError} PluginError
 *
 * @typedef {(error?: PluginError | null, result?: any | null) => void} PluginCallback
 * */


/**
 * @param data {CoreData}
 * @return {{
 *      jsonSchema: any,
 *      modelDefinitions: any,
 *      internalDefinitions: any,
 *      externalDefinitions: any,
 *      containerData: any,
 *      entityData: any,
 * }}
 * */
const parseDataForEntityLevelScript = (data) => {
    const jsonSchema = JSON.parse(data.jsonSchema);
    const modelDefinitions = JSON.parse(data.modelDefinitions);
    const internalDefinitions = JSON.parse(data.internalDefinitions);
    const externalDefinitions = JSON.parse(data.externalDefinitions);
    const containerData = data.containerData;
    const entityData = data.entityData;

    return {
        jsonSchema,
        modelDefinitions,
        internalDefinitions,
        externalDefinitions,
        containerData,
        entityData,
    }
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {Array<AlterScriptDto>}
 * */
const getEntityLevelAlterScriptDtos = (data, app) => {
    const {
        externalDefinitions,
        modelDefinitions,
        jsonSchema,
        internalDefinitions
    } = parseDataForEntityLevelScript(data);
    const definitions = [modelDefinitions, internalDefinitions, externalDefinitions];
    return getAlterScriptDtos(jsonSchema, definitions, data, app);
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {string}
 * */
const generateEntityLevelAlterScript = (data, app) => {
    const alterScriptDtos = getEntityLevelAlterScriptDtos(data, app);
    return joinAlterScriptDtosIntoAlterScript(alterScriptDtos, data);
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {boolean}
 * */
const doesEntityLevelAlterScriptContainDropStatements = (data, app) => {
    const alterScriptDtos = getEntityLevelAlterScriptDtos(data, app);
    return alterScriptDtos
        .some(alterScriptDto => alterScriptDto.isActivated && alterScriptDto
            .scripts.some(scriptModificationDto => scriptModificationDto.isDropScript));
}


/**
 * @param data {CoreData}
 * @param app {App}
 * @return {string}
 * */
const generateEntityLevelFEScript = (data, app) => {
    const {
        externalDefinitions,
        modelDefinitions,
        jsonSchema,
        internalDefinitions,
        containerData,
        entityData
    } = parseDataForEntityLevelScript(data);
    const databaseStatement = getDatabaseStatement(containerData);
    const tableStatements = getTableStatement(app)(
        containerData,
        entityData,
        jsonSchema,
        [
            modelDefinitions,
            internalDefinitions,
            externalDefinitions,
        ],
        true,
    );
    return buildScript([
        databaseStatement,
        tableStatements,
        getIndexes(containerData, entityData, jsonSchema, [
            modelDefinitions,
            internalDefinitions,
            externalDefinitions,
        ])
    ]);
}

/**
 * @param data {CoreData}
 * @return {{
 *      modelDefinitions: any,
 *      internalDefinitions: any,
 *      externalDefinitions: any,
 *      containerData: any,
 *      entitiesJsonSchema: any,
 * }}
 * */
const parseDataForContainerLevelScript = (data) => {
    const containerData = data.containerData;
    const modelDefinitions = JSON.parse(data.modelDefinitions);
    const externalDefinitions = JSON.parse(data.externalDefinitions);
    const entitiesJsonSchema = parseEntities(data.entities, data.jsonSchema);
    const internalDefinitions = parseEntities(
        data.entities,
        data.internalDefinitions
    );

    return {
        modelDefinitions,
        internalDefinitions,
        externalDefinitions,
        containerData,
        entitiesJsonSchema,
    }
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {Array<AlterScriptDto>}
 * */
const getContainerLevelAlterScriptDtos = (data, app) => {
    const _ = app.require('lodash');
    const {
        internalDefinitions,
        externalDefinitions,
        modelDefinitions,
        entitiesJsonSchema,
    } = parseDataForContainerLevelScript(data);
    const deltaModelSchema = _.first(Object.values(entitiesJsonSchema)) || {};
    const definitions = [modelDefinitions, internalDefinitions, externalDefinitions];
    return getAlterScriptDtos(deltaModelSchema, definitions, data, app);
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {string}
 * */
const generateContainerLevelAlterScript = (data, app) => {
    const alterScriptDtos = getContainerLevelAlterScriptDtos(data, app);
    return joinAlterScriptDtosIntoAlterScript(alterScriptDtos, data);
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {boolean}
 * */
const doesContainerLevelAlterScriptContainDropStatements = (data, app) => {
    const alterScriptDtos = getContainerLevelAlterScriptDtos(data, app);
    return alterScriptDtos
        .some(alterScriptDto => alterScriptDto.isActivated && alterScriptDto
            .scripts.some(scriptModificationDto => scriptModificationDto.isDropScript));
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {string}
 * */
const generateContainerLevelFEScript = (data, app) => {
    const _ = app.require('lodash');
    const {
        internalDefinitions,
        externalDefinitions,
        modelDefinitions,
        entitiesJsonSchema,
        containerData,
    } = parseDataForContainerLevelScript(data);
    const databaseStatement = getDatabaseStatement(containerData);
    const viewsScripts = data.views
        .map(viewId => {
            const viewSchema = JSON.parse(data.jsonSchema[viewId] || '{}');
            return getViewScript({
                schema: viewSchema,
                viewData: data.viewData[viewId],
                containerData: data.containerData,
                collectionRefsDefinitionsMap: data.collectionRefsDefinitionsMap,
                isKeyspaceActivated: true
            })
        }).filter(script => !_.isEmpty(script));

    const entityScripts = data.entities.reduce((result, entityId) => {
        const entityData = data.entityData[entityId];
        const args = [
            containerData,
            entityData,
            entitiesJsonSchema[entityId],
            [
                internalDefinitions[entityId],
                modelDefinitions,
                externalDefinitions,
            ],
        ];
        const likeTableData = data.entityData[getTab(0, entityData)?.like];

        const tableStatement = getTableStatement(app)(
            ...args,
            true,
            likeTableData,
        )

        return result.concat([
            tableStatement,
            getIndexes(...args),
        ]);
    }, []);

    const relationshipScrips = getCreateRelationshipScripts(app)(data.relationships, entitiesJsonSchema);

    return buildScript([
        databaseStatement,
        ...entityScripts,
        ...viewsScripts,
        ...relationshipScrips,
    ]);
}

module.exports = {
    /**
     * @param data {CoreData}
     * @param logger {Logger}
     * @param callback {PluginCallback}
     * @param app {App}
     * */
    generateScript(data, logger, callback, app) {
        try {
            setDependencies(app);

            if (data.isUpdateScript) {
                const scripts = generateEntityLevelAlterScript(data, app);
                callback(null, scripts);
            } else {
                const scripts = generateEntityLevelFEScript(data, app);
                callback(null, scripts);
            }
        } catch (e) {
            logger.log(
                'error',
                {message: e.message, stack: e.stack},
                'DeltaLake Forward-Engineering Error'
            );

            callback({message: e.message, stack: e.stack});
        }
    },

    /**
     * @param data {CoreData}
     * @param logger {Logger}
     * @param callback {PluginCallback}
     * @param app {App}
     * */
    generateViewScript(data, logger, callback, app) {
        try {
            setDependencies(app);
            const viewSchema = JSON.parse(data.jsonSchema || '{}');

            const databaseStatement = getDatabaseStatement(data.containerData);

            const script = getViewScript({
                schema: viewSchema,
                viewData: data.viewData,
                containerData: data.containerData,
                collectionRefsDefinitionsMap: data.collectionRefsDefinitionsMap,
                isKeyspaceActivated: true,
            });

            callback(null, buildScript([databaseStatement, script]));
        } catch (e) {
            logger.log('error', {message: e.message, stack: e.stack}, 'DeltaLake Forward-Engineering Error');

            callback({message: e.message, stack: e.stack});
        }
    },

    /**
     * @param data {CoreData}
     * @param logger {Logger}
     * @param callback {PluginCallback}
     * @param app {App}
     * */
    generateContainerScript(data, logger, callback, app) {
        try {
            setDependencies(app);

            if (data.isUpdateScript) {
                const script = generateContainerLevelAlterScript(data, app);
                callback(null, script);
            } else {
                const script = generateContainerLevelFEScript(data, app);
                callback(null, script);
            }
        } catch (e) {
            logger.log(
                'error',
                {message: e.message, stack: e.stack},
                'DeltaLake Forward-Engineering Error'
            );

            callback({message: e.message, stack: e.stack});
        }
    },

    /**
     * @param connectionInfo {CoreData}
     * @param logger {Logger}
     * @param cb {PluginCallback}
     * @param app {App}
     * */
    async applyToInstance(connectionInfo, logger, cb, app) {
        logger.clear();
        logInfo('info', connectionInfo, logger);

        const connectionData = {
            host: getCleanedUrl(connectionInfo.host),
            clusterId: connectionInfo.clusterId,
            accessToken: connectionInfo.accessToken,
            applyToInstanceQueryRequestTimeout: connectionInfo.applyToInstanceQueryRequestTimeout,
            script: connectionInfo.script
        }

        try {
            await fetchRequestHelper.fetchApplyToInstance(connectionData, logger)
            cb()
        } catch (err) {
            logger.log(
                'error',
                {message: err.message, stack: err.stack, error: err},
                'Apply to instance'
            );
            cb({message: err.message, stack: err.stack});
        }

    },

    /**
     * @param connectionInfo {CoreData}
     * @param logger {Logger}
     * @param cb {PluginCallback}
     * */
    async testConnection(connectionInfo, logger, cb) {
        try {
            logInfo('Test connection FE', connectionInfo, logger);

            const connectionData = {
                host: getCleanedUrl(connectionInfo.host),
                clusterId: connectionInfo.clusterId,
                accessToken: connectionInfo.accessToken
            }

            const clusterState = await databricksHelper.getClusterStateInfo(connectionData, logger);
            logger.log('info', clusterState, 'Cluster state info');

            if (!clusterState.isRunning) {
                cb({message: `Cluster is unavailable. Cluster status: ${clusterState.state}`, type: 'simpleError'})
            }
            cb()
        } catch (err) {
            logger.log(
                'error',
                {message: err.message, stack: err.stack, error: err},
                'Test connection FE'
            );
            cb({message: err.message, stack: err.stack});
        }
    },

    /**
     * @param data {CoreData}
     * @param logger {Logger}
     * @param callback {PluginCallback}
     * @param app {App}
     * */
    isDropInStatements(data, logger, callback, app) {
        try {
            setDependencies(app);
            if (data.level === 'container') {
                const doesContainDropStatements = doesContainerLevelAlterScriptContainDropStatements(data, app);
                callback(null, doesContainDropStatements);
            } else if (data.level === 'entity') {
                const doesContainDropStatements = doesEntityLevelAlterScriptContainDropStatements(data, app);
                callback(null, doesContainDropStatements);
            }
        } catch (e) {
            callback({message: e.message, stack: e.stack});
        }
    },
};

const parseEntities = (entities, serializedItems) => {
    return entities.reduce((result, entityId) => {
        try {
            return Object.assign({}, result, {
                [entityId]: JSON.parse(serializedItems[entityId]),
            });
        } catch (e) {
            return result;
        }
    }, {});
};

const logInfo = (step, connectionInfo, logger) => {
    logger.clear();
    logger.log('info', logHelper.getSystemInfo(connectionInfo), step);
    logger.log('info', connectionInfo, 'connectionInfo', connectionInfo.hiddenKeys);
};

