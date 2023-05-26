/**
 * @typedef {import('../types/coreApplicationTypes').CoreData} CoreData
 * @typedef {import('../types/coreApplicationTypes').App} App
 * @typedef {import('../types/coreApplicationDataTypes').ContainerJsonSchema} ContainerJsonSchema
 * @typedef {import('../types/coreApplicationDataTypes').ContainerStyles} ContainerStyles
 * @typedef {import('../types/coreApplicationDataTypes').EntityData} EntityData
 * @typedef {import('../types/coreApplicationDataTypes').EntityJsonSchema} EntityJsonSchema
 * @typedef {import('../types/coreApplicationDataTypes').ExternalDefinitions} ExternalDefinitions
 * @typedef {import('../types/coreApplicationDataTypes').InternalDefinitions} InternalDefinitions
 * @typedef {import('../types/coreApplicationDataTypes').ModelDefinitions} ModelDefinitions
 * */

/**
 * @typedef {[ContainerJsonSchema, ContainerStyles]} ContainerData
 * */

/**
 * @typedef {{
 *     [id: string]: EntityJsonSchema
 * }} EntitiesJsonSchema
 */

/**
 * @typedef {{
 *     name: string,
 *     script: string,
 * }} ContainerLevelEntityDto
 * */


const {getDatabaseStatement} = require("./databaseHelper");
const {getCreateRelationshipScripts} = require("./relationshipHelper");
const {getTableStatement} = require("./tableHelper");
const {getIndexes} = require("./indexHelper");
const {buildScript, getName, getTab, getDBVersionNumber} = require("../utils/generalUtils");
const {getViewScript} = require("./viewHelper");

/**
 * @typedef {{
 *     externalDefinitions: ExternalDefinitions,
 *          modelDefinitions: ModelDefinitions,
 *          jsonSchema: EntityJsonSchema,
 *          internalDefinitions: InternalDefinitions,
 *          containerData: ContainerData,
 *          entityData: EntityData[]
 * }} EntityLevelFEScriptData
 * */

/**
 * @typedef {{
 *     externalDefinitions: ExternalDefinitions,
 *     modelDefinitions: ModelDefinitions,
 *     internalDefinitions: InternalDefinitions,
 *     containerData: ContainerData,
 *     includeRelationships: boolean,
 *     entitiesJsonSchema: EntitiesJsonSchema,
 * }} ContainerLevelFEScriptData
 * */

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: EntityLevelFEScriptData) => string}
 * */
const buildEntityLevelFEScript = (data, app) => ({
                                                      externalDefinitions,
                                                      modelDefinitions,
                                                      jsonSchema,
                                                      internalDefinitions,
                                                      containerData,
                                                      entityData,
                                                  }) => {
    const dbVersionNumber = getDBVersionNumber(data.modelData[0].dbVersion);
    const databaseStatement = getDatabaseStatement(containerData);
    const definitions = [modelDefinitions, internalDefinitions, externalDefinitions,];
    const tableStatements = getTableStatement(app)(
        containerData,
        entityData,
        jsonSchema,
        definitions,
        true,
        dbVersionNumber
    );
    const indexScript = getIndexes(containerData, entityData, jsonSchema, definitions);
    return buildScript([
        databaseStatement,
        tableStatements,
        indexScript
    ]);
}


/**
 * @param data {CoreData}
 * @param _ {any}
 * @return {Array<ContainerLevelEntityDto>}
 * */
const getContainerLevelViewScriptDtos = (data, _) => {
    return data.views.map(viewId => {
        const viewSchema = JSON.parse(data.jsonSchema[viewId] || '{}');
        const viewData = data.viewData[viewId];
        const viewScript = getViewScript({
            schema: viewSchema,
            viewData: viewData,
            containerData: data.containerData,
            collectionRefsDefinitionsMap: data.collectionRefsDefinitionsMap,
            isKeyspaceActivated: true,
        });

        return {
            name: getName(viewData[0]),
            script: buildScript([viewScript]),
        };
    }).filter(({script}) => !_.isEmpty(script));
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(data: ContainerLevelFEScriptData) => Array<ContainerLevelEntityDto>}
 * */
const getContainerLevelEntitiesScriptDtos = (app, data) => ({
                                                                externalDefinitions,
                                                                modelDefinitions,
                                                                internalDefinitions,
                                                                containerData,
                                                                includeRelationships,
                                                                entitiesJsonSchema,
                                                            }) => {
    const dbVersionNumber = getDBVersionNumber(data.modelData[0].dbVersion);

    return data.entities.reduce((result, entityId) => {
        const entityData = data.entityData[entityId];

        const likeTableData = data.entityData[getTab(0, entityData)?.like];
        const entityJsonSchema = entitiesJsonSchema[entityId];
        const definitions = [internalDefinitions[entityId], modelDefinitions, externalDefinitions];
        const createTableStatementArgs = [containerData, entityData, entityJsonSchema, definitions,];

        const tableStatement = getTableStatement(app)(
            ...createTableStatementArgs,
            true,
            likeTableData,
            dbVersionNumber
        );

        const indexScript = getIndexes(...createTableStatementArgs);
        let relationshipScripts = [];
        if (includeRelationships) {
            const relationshipsWithThisTableAsChild = data.relationships
                .filter(relationship => relationship.childCollection === entityId);
            relationshipScripts = getCreateRelationshipScripts(app)(relationshipsWithThisTableAsChild, entitiesJsonSchema);
        }

        const tableScript = buildScript([tableStatement, indexScript, ...relationshipScripts]);

        return result.concat({
            name: getName(entityData[0]),
            script: tableScript,
        });
    }, [])
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: ContainerLevelFEScriptData & {includeRelationshipsInEntityScripts: boolean}) => {
 *     container: string,
 *     entities: Array<{
 *      name: string,
 *      script: string
 *     }>,
 *     views: Array<{
 *      name: string,
 *      script: string
 *     }>,
 *     relationships: Array<string>,
 * }}
 * */
const buildContainerLevelFEScriptDto = (data, app) => ({
                                                                     internalDefinitions,
                                                                     externalDefinitions,
                                                                     modelDefinitions,
                                                                     entitiesJsonSchema,
                                                                     containerData,
                                                                     includeRelationshipsInEntityScripts
                                                                 }) => {
    const _ = app.require('lodash');

    const viewsScriptDtos = getContainerLevelViewScriptDtos(data, _);
    const databaseStatement = getDatabaseStatement(containerData);
    const entityScriptDtos = getContainerLevelEntitiesScriptDtos(app, data)({
        internalDefinitions,
        externalDefinitions,
        modelDefinitions,
        containerData,
        entitiesJsonSchema,
        includeRelationships: includeRelationshipsInEntityScripts,
    });

    let relationshipScrips = [];
    if (!includeRelationshipsInEntityScripts) {
        relationshipScrips = getCreateRelationshipScripts(app)(data.relationships, entitiesJsonSchema);
    }

    return {
        container: databaseStatement,
        entities: entityScriptDtos,
        views: viewsScriptDtos,
        relationships: relationshipScrips,
    };

}

module.exports = {
    buildEntityLevelFEScript,
    buildContainerLevelFEScriptDto,
}
