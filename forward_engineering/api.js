'use strict';

const { setDependencies } = require('./helpers/appDependencies');
const { getDatabaseStatement } = require('./helpers/databaseHelper');
const { getViewScript } = require('./helpers/viewHelper');
const { getCleanedUrl, buildScript } = require('./utils/generalUtils');
const fetchRequestHelper = require('../reverse_engineering/helpers/fetchRequestHelper');
const databricksHelper = require('../reverse_engineering/helpers/databricksHelper');

const logHelper = require('../reverse_engineering/logHelper');
const {buildEntityLevelFEScript, buildContainerLevelFEScriptDto} = require("./helpers/feScriptBuilder");
const {
    buildEntityLevelAlterScript,
    buildContainerLevelAlterScript,
    doesContainerLevelAlterScriptContainDropStatements,
    doesEntityLevelAlterScriptContainDropStatements
} = require("./helpers/alterScriptHelpers/alterScriptBuilder");

/**
 * @typedef {import('./helpers/alterScriptHelpers/types/AlterScriptDto').AlterScriptDto} AlterScriptDto
 * @typedef {import('./types/coreApplicationDataTypes').ContainerJsonSchema} ContainerJsonSchema
 * @typedef {import('./types/coreApplicationDataTypes').ContainerStyles} ContainerStyles
 * @typedef {import('./types/coreApplicationDataTypes').EntityData} EntityData
 * @typedef {import('./types/coreApplicationDataTypes').EntityJsonSchema} EntityJsonSchema
 * @typedef {import('./types/coreApplicationDataTypes').ExternalDefinitions} ExternalDefinitions
 * @typedef {import('./types/coreApplicationDataTypes').InternalDefinitions} InternalDefinitions
 * @typedef {import('./types/coreApplicationDataTypes').ModelDefinitions} ModelDefinitions
 * @typedef {import('./types/coreApplicationTypes').App} App
 * @typedef {import('./types/coreApplicationTypes').Logger} Logger
 * @typedef {import('./types/coreApplicationTypes').CoreData} CoreData
 * @typedef {import('./types/coreApplicationTypes').PluginError} PluginError
 *
 * @typedef {(error?: PluginError | null, result?: any | null) => void} PluginCallback
 * */

/**
 * @typedef {[ContainerJsonSchema, ContainerStyles]} ContainerData
 * */
/**
 * @typedef {{
 *     [id: string]: EntityJsonSchema
 * }} EntitiesJsonSchema
 */

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

/**
 * @param data {CoreData}
 * @return {{
 *      jsonSchema: unknown,
 *      modelDefinitions: ModelDefinitions | unknown,
 *      internalDefinitions: InternalDefinitions | unknown,
 *      externalDefinitions: ExternalDefinitions | unknown,
 *      containerData: ContainerData | unknown,
 *      entityData: unknown,
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
 * @return {{
 *      modelDefinitions: ModelDefinitions | unknown,
 *      internalDefinitions: InternalDefinitions | unknown,
 *      externalDefinitions: ExternalDefinitions | unknown,
 *      containerData: ContainerData | unknown,
 *      entitiesJsonSchema: EntitiesJsonSchema | unknown,
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

            const parsedData = parseDataForEntityLevelScript(data);

            if (data.isUpdateScript) {
                const scripts = buildEntityLevelAlterScript(data, app)(parsedData);
                callback(null, scripts);
            } else {
                const scripts = buildEntityLevelFEScript(app)(parsedData);
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

            const parsedData = parseDataForContainerLevelScript(data);
            if (data.isUpdateScript) {
                const script = buildContainerLevelAlterScript(data, app)(parsedData);
                callback(null, script);
            } else {
                const scriptData = buildContainerLevelFEScriptDto(data, app)({
                    ...parsedData,
                    includeRelationshipsInEntityScripts: Boolean(data.options.separateBucket)
                });

                if (data.options.separateBucket) {
                    const result =  {
                        container: scriptData.container,
                        entities: scriptData.entities,
                        views: scriptData.views,
                    };
                    callback(null, result);
                    return;
                }

                const result = buildScript([
                    scriptData.container,
                    ...(scriptData.entities.map(e => e.script)),
                    ...(scriptData.views.map(v => v.script)),
                    ...(scriptData.relationships),
                ]);
                callback(null, result);
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
                const parsedData = parseDataForContainerLevelScript(data);
                const doesContainDropStatements = doesContainerLevelAlterScriptContainDropStatements(data, app)(parsedData);
                callback(null, doesContainDropStatements);
            } else if (data.level === 'entity') {
                const parsedData = parseDataForEntityLevelScript(data);
                const doesContainDropStatements = doesEntityLevelAlterScriptContainDropStatements(data, app)(parsedData);
                callback(null, doesContainDropStatements);
            }
        } catch (e) {
            callback({message: e.message, stack: e.stack});
        }
    },
};

const logInfo = (step, connectionInfo, logger) => {
    logger.clear();
    logger.log('info', logHelper.getSystemInfo(connectionInfo), step);
    logger.log('info', connectionInfo, 'connectionInfo', connectionInfo.hiddenKeys);
};
