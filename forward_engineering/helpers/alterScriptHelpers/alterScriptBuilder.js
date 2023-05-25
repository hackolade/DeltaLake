const {getAlterScriptDtos, joinAlterScriptDtosIntoAlterScript} = require("../alterScriptFromDeltaHelper");

/**
 * @typedef {import('./helpers/alterScriptHelpers/types/AlterScriptDto').AlterScriptDto} AlterScriptDto
 * @typedef {import('./types/coreApplicationDataTypes').EntityJsonSchema} EntityJsonSchema
 * @typedef {import('./types/coreApplicationDataTypes').ExternalDefinitions} ExternalDefinitions
 * @typedef {import('./types/coreApplicationDataTypes').InternalDefinitions} InternalDefinitions
 * @typedef {import('./types/coreApplicationDataTypes').ModelDefinitions} ModelDefinitions
 * @typedef {import('./types/coreApplicationTypes').App} App
 * @typedef {import('./types/coreApplicationTypes').CoreData} CoreData
 * */

/**
 * @typedef {{
 *     externalDefinitions: ExternalDefinitions,
 *     modelDefinitions: ModelDefinitions,
 *     jsonSchema: EntityJsonSchema,
 *     internalDefinitions: InternalDefinitions
 * }} EntityLevelAlterScriptData
 * */

/**
 * @typedef {{
 *     externalDefinitions: ExternalDefinitions,
 *     modelDefinitions: ModelDefinitions,
 *     entitiesJsonSchema: {
 *         [id: string]: EntityJsonSchema,
 *     },
 *     internalDefinitions: InternalDefinitions
 * }} ContainerLevelAlterScriptData
 * */

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: EntityLevelAlterScriptData) => Array<AlterScriptDto>}
 * */
const getEntityLevelAlterScriptDtos = (data, app) => ({
                                                          externalDefinitions,
                                                          modelDefinitions,
                                                          jsonSchema,
                                                          internalDefinitions
                                                      }) => {
    const definitions = [modelDefinitions, internalDefinitions, externalDefinitions];
    return getAlterScriptDtos(jsonSchema, definitions, data, app);
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: EntityLevelAlterScriptData) => string}
 * */
const buildEntityLevelAlterScript = (data, app) => (entityLevelAlterScriptDto) => {
    const alterScriptDtos = getEntityLevelAlterScriptDtos(data, app)(entityLevelAlterScriptDto);
    return joinAlterScriptDtosIntoAlterScript(alterScriptDtos, data);
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: EntityLevelAlterScriptData) => boolean}
 * */
const doesEntityLevelAlterScriptContainDropStatements = (data, app) => (entityLevelAlterScriptDto) => {
    const alterScriptDtos = getEntityLevelAlterScriptDtos(data, app)(entityLevelAlterScriptDto);
    return alterScriptDtos
        .some(alterScriptDto => alterScriptDto.isActivated && alterScriptDto
            .scripts.some(scriptModificationDto => scriptModificationDto.isDropScript));
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: ContainerLevelAlterScriptData) => Array<AlterScriptDto>}
 * */
const getContainerLevelAlterScriptDtos = (data, app) => ({
                                                             internalDefinitions,
                                                             externalDefinitions,
                                                             modelDefinitions,
                                                             entitiesJsonSchema,
                                                         }) => {
    const _ = app.require('lodash');
    const deltaModelSchema = _.first(Object.values(entitiesJsonSchema)) || {};
    const definitions = [modelDefinitions, internalDefinitions, externalDefinitions];
    return getAlterScriptDtos(deltaModelSchema, definitions, data, app);
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: ContainerLevelAlterScriptData) => string}
 * */
const buildContainerLevelAlterScript = (data, app) => (containerLevelAlterScriptDto) => {
    const alterScriptDtos = getContainerLevelAlterScriptDtos(data, app)(containerLevelAlterScriptDto);
    return joinAlterScriptDtosIntoAlterScript(alterScriptDtos, data);
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: ContainerLevelAlterScriptData) => boolean}
 * */
const doesContainerLevelAlterScriptContainDropStatements = (data, app) => (containerLevelAlterScriptDto) => {
    const alterScriptDtos = getContainerLevelAlterScriptDtos(data, app)(containerLevelAlterScriptDto);
    return alterScriptDtos
        .some(alterScriptDto => alterScriptDto.isActivated && alterScriptDto
            .scripts.some(scriptModificationDto => scriptModificationDto.isDropScript));
}


module.exports = {
    buildContainerLevelAlterScript,
    doesEntityLevelAlterScriptContainDropStatements,
    buildEntityLevelAlterScript,
    doesContainerLevelAlterScriptContainDropStatements,
}
