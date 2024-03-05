const {getAlterScriptDtos, joinAlterScriptDtosIntoAlterScript} = require("./alterScriptFromDeltaHelper");
const {AlterScriptDto} = require("./types/AlterScriptDto");
const { CoreData, App } = require('../types/coreApplicationTypes');

/**
 * @typedef {{
 *     externalDefinitions: unknown,
 *     modelDefinitions: unknown,
 *     jsonSchema: unknown,
 *     internalDefinitions: unknown
 * }} EntityLevelAlterScriptData
 * */

/**
 * @typedef {{
 *     externalDefinitions: unknown,
 *     modelDefinitions: unknown,
 *     entitiesJsonSchema: unknown,
 *     internalDefinitions: unknown
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
const getContainerLevelAlterScriptDtos =
	(data, app) =>
	({ internalDefinitions, externalDefinitions, modelDefinitions, entitiesJsonSchema }) => {
		const _ = app.require('lodash');
		const deltaModelSchema = _.first(Object.values(entitiesJsonSchema)) || {};
		const definitions = [modelDefinitions, internalDefinitions, externalDefinitions];
		return getAlterScriptDtos(deltaModelSchema, definitions, data, app);
	};

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
