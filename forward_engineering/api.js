'use strict';

const {getDatabaseStatement, getUseCatalogStatement} = require('./helpers/databaseHelper');
const {getViewScript} = require('./helpers/viewHelper');
const {getCleanedUrl, buildScript, isSupportUnityCatalog} = require('./utils/general');
const fetchRequestHelper = require('../reverse_engineering/helpers/fetchRequestHelper');
const databricksHelper = require('../reverse_engineering/helpers/databricksHelper');

const logHelper = require('../reverse_engineering/logHelper');
const {buildEntityLevelFEScript, buildContainerLevelFEScriptDto, buildContainerLevelFEScript} = require("./helpers/feScriptBuilder");
const {
    buildEntityLevelAlterScript,
    buildContainerLevelAlterScript,
    doesContainerLevelAlterScriptContainDropStatements,
    doesEntityLevelAlterScriptContainDropStatements
} = require("./alterScript/alterScriptBuilder");
const {
    ModelDefinitions,
    InternalDefinitions,
    ExternalDefinitions,
    ContainerJsonSchema,
    ContainerStyles,
    EntityJsonSchema,
} = require('./types/coreApplicationDataTypes');
const {
    App,
    CoreData,
    Logger,
    PluginError
} = require('./types/coreApplicationTypes')
const {getSampleGenerationOptions, parseJsonData, generateSampleForDemonstration} = require("./sampleGeneration/sampleGenerationService");

/**
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
 *      jsonData: ParsedJsonData
 * }}
 * */
const parseDataForEntityLevelScript = (data) => {
    const jsonSchema = JSON.parse(data.jsonSchema);
    const modelDefinitions = JSON.parse(data.modelDefinitions);
    const internalDefinitions = JSON.parse(data.internalDefinitions);
    const externalDefinitions = JSON.parse(data.externalDefinitions);
    const containerData = data.containerData;
    const modelData = data.modelData;
    const entityData = data.entityData;
    const jsonData = parseJsonData(data.jsonData);

    return {
        jsonSchema,
        modelDefinitions,
        internalDefinitions,
        externalDefinitions,
        containerData,
        entityData,
        modelData,
        jsonData,
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
 *      jsonData: Record<string, Object>
 * }}
 * */
const parseDataForContainerLevelScript = (data) => {
    const modelData = data.modelData;
    const containerData = data.containerData;
    const modelDefinitions = JSON.parse(data.modelDefinitions);
    const externalDefinitions = JSON.parse(data.externalDefinitions);
    const entitiesJsonSchema = parseEntities(data.entities, data.jsonSchema);
    const internalDefinitions = parseEntities(
        data.entities,
        data.internalDefinitions
    );
    const jsonData = parseJsonData(data.jsonData);

    return {
        modelData,
        modelDefinitions,
        internalDefinitions,
        externalDefinitions,
        containerData,
        entitiesJsonSchema,
        jsonData,
    }
}

/**
 * @param script {string}
 * @param sample {string}
 * @return {Array<{ title: string, script: string, mode: string }>}
 * */
const getScriptAndSampleResponse = (script, sample) => {
    const mode = "sql";
    return [
        {
            title: 'DDL script',
            script,
            mode,
        },
        {
            title: 'Sample data',
            script: sample,
            mode,
        },
    ]
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
            const parsedData = parseDataForEntityLevelScript(data);

            if (data.isUpdateScript) {
                const scripts = buildEntityLevelAlterScript(data, app)(parsedData);
                callback(null, scripts);
            } else {
                const scripts = buildEntityLevelFEScript(data, app)(parsedData);
                const sampleGenerationOptions = getSampleGenerationOptions(app, data);
                if (!sampleGenerationOptions.isSampleGenerationRequired) {
                    return callback(null, scripts);
                }
                const demoSample = generateSampleForDemonstration(app, parsedData, 'entity');
                return callback(null, getScriptAndSampleResponse(scripts, demoSample));
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
            const _ = app.require('lodash');
            const viewSchema = JSON.parse(data.jsonSchema || '{}');
            const dbVersion = data.modelData[0].dbVersion;
            const isUnityCatalogSupports = isSupportUnityCatalog(dbVersion);

            const useCatalogStatement = isUnityCatalogSupports ? getUseCatalogStatement(data.containerData) : '';
            const databaseStatement = getDatabaseStatement(data.containerData, isUnityCatalogSupports);

            const script = getViewScript({
                _,
                schema: viewSchema,
                viewData: data.viewData,
                containerData: data.containerData,
                collectionRefsDefinitionsMap: data.collectionRefsDefinitionsMap,
                isKeyspaceActivated: true,
            });

            callback(null, buildScript([useCatalogStatement, databaseStatement, script]));
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
                    const useCatalogStatement = scriptData.catalog
                        ? scriptData.catalog + '\n\n'
                        : '';
                    const scripts = {
                        container: useCatalogStatement + scriptData.container,
                        entities: scriptData.entities,
                        views: scriptData.views,
                    };
                    return callback(null, scripts);
                }

                const scripts = buildContainerLevelFEScript(scriptData);

                const sampleGenerationOptions = getSampleGenerationOptions(app, data);
                if (!sampleGenerationOptions.isSampleGenerationRequired) {
                    return callback(null, scripts);
                }

                const demoSample = generateSampleForDemonstration(app, parsedData, 'container');
                return callback(null, getScriptAndSampleResponse(scripts, demoSample));
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
     * @param cb {PluginCallback}
     * @param app {App}
     * */
    async applyToInstance(data, logger, cb, app) {
        const connectionData = {
            host: getCleanedUrl(data.host),
            clusterId: data.clusterId,
            accessToken: data.accessToken,
            applyToInstanceQueryRequestTimeout: data.applyToInstanceQueryRequestTimeout,
            script: data.script,
            entitiesData: data.entitiesData,
        }

        const _ = app.require('lodash');
        try {
            await fetchRequestHelper.fetchApplyToInstance(_)(connectionData, logger)
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
