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


const {getDatabaseStatement, getUseCatalogStatement} = require("./databaseHelper");
const {getCreateRelationshipScripts} = require("./relationshipHelper");
const {getTableStatement} = require("./tableHelper");
const {getIndexes} = require("./indexHelper");
const {buildScript, getName, getTab, isSupportUnityCatalog, isSupportNotNullConstraints} = require("../utils/general");
const {getViewScript} = require("./viewHelper");
const {generateSampleForSeparateBucketTable, parseJsonData} = require('../sampleGeneration/sampleGenerationService');

/**
 * @typedef {{
 *     externalDefinitions: ExternalDefinitions,
 *          modelDefinitions: ModelDefinitions,
 *          jsonSchema: EntityJsonSchema,
 *          internalDefinitions: InternalDefinitions,
 *          containerData: ContainerData,
 *          entityData: EntityData[]
 *
 * }} EntityLevelFEScriptData
 * */

/**
 * @typedef {{
 *     externalDefinitions: ExternalDefinitions,
 *     modelDefinitions: ModelDefinitions,
 *     internalDefinitions: InternalDefinitions,
 *     containerData: ContainerData,
 *     arePkFkConstraintsAvailable: boolean,
 *     areNotNullConstraintsAvailable: boolean,
 *     includeRelationshipsInEntityScripts: boolean,
 *     entitiesJsonSchema: EntitiesJsonSchema,
 *     includeSamplesInEntityScripts: boolean,
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
    modelData,
}) => {
    const _ = app.require('lodash');
    const dbVersion = data.modelData[0].dbVersion;
    const arePkFkConstraintsAvailable = isSupportUnityCatalog(dbVersion);
    const areNotNullConstraintsAvailable = isSupportNotNullConstraints(dbVersion);
    const useCatalogStatement = arePkFkConstraintsAvailable ? getUseCatalogStatement(containerData) : '';
    const databaseStatement = getDatabaseStatement(containerData, arePkFkConstraintsAvailable);
    const definitions = [modelDefinitions, internalDefinitions, externalDefinitions,];
    const tableStatements = getTableStatement(app)(
        containerData,
        entityData,
        jsonSchema,
        definitions,
        arePkFkConstraintsAvailable,
        areNotNullConstraintsAvailable,
    );
    const indexScript = getIndexes(_)(containerData, entityData, jsonSchema, definitions);

    let relationshipScripts = [];
    if (arePkFkConstraintsAvailable) {
        const entityId = jsonSchema.GUID;
        const relationshipsWithThisTableAsChild = modelData[1]?.relationships.filter(relationship => relationship.childCollection === entityId);
        relationshipScripts = getCreateRelationshipScripts(app)(relationshipsWithThisTableAsChild, jsonSchema);
    }

    return buildScript([
        useCatalogStatement,
        databaseStatement,
        tableStatements,
        ...relationshipScripts,
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
            _,
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
    entitiesJsonSchema,
    arePkFkConstraintsAvailable,
    areNotNullConstraintsAvailable,
    includeRelationshipsInEntityScripts,
    includeSamplesInEntityScripts,
}) => {
    const _ = app.require('lodash');
    return data.entities.reduce((result, entityId) => {
        const entityData = data.entityData[entityId];

        const likeTableData = data.entityData[getTab(0, entityData)?.like];
        const entityJsonSchema = entitiesJsonSchema[entityId];
        const definitions = [internalDefinitions[entityId], modelDefinitions, externalDefinitions];
        const createTableStatementArgs = [containerData, entityData, entityJsonSchema, definitions,];

        const tableStatement = getTableStatement(app)(
            ...createTableStatementArgs,
            arePkFkConstraintsAvailable,
            areNotNullConstraintsAvailable,
            likeTableData,
        );

        const indexScript = getIndexes(_)(...createTableStatementArgs);

        let relationshipScripts = [];
        if (includeRelationshipsInEntityScripts && arePkFkConstraintsAvailable) {
            const relationshipsWithThisTableAsChild = data.relationships
                .filter(relationship => relationship.childCollection === entityId);
            relationshipScripts = getCreateRelationshipScripts(app)(relationshipsWithThisTableAsChild, entitiesJsonSchema);
        }

        let sampleScript = '';
        if (includeSamplesInEntityScripts) {
            sampleScript = generateSampleForSeparateBucketTable(_)({
                entitiesJsonSchema,
                collectionId: entityId,
                sampleData: parseJsonData(data.jsonData),
            });
        }

        let tableScript = buildScript([tableStatement, indexScript, ...relationshipScripts]);
        if (sampleScript) {
            // This is because SQL formatter breaks some "INSERT" statements with complex types
            tableScript = [tableScript, sampleScript].join('\n');
        }

        return result.concat({
            name: getName(entityData[0]),
            script: tableScript,
        });
    }, [])
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: ContainerLevelFEScriptData & {
 *      includeRelationshipsInEntityScripts: boolean,
 *      includeSamplesInEntityScripts: boolean,
 * }) => {
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
    includeRelationshipsInEntityScripts,
    includeSamplesInEntityScripts,
}) => {
    const _ = app.require('lodash');
    const dbVersion = data.modelData[0].dbVersion;
    const arePkFkConstraintsAvailable = isSupportUnityCatalog(dbVersion);
    const areNotNullConstraintsAvailable = isSupportNotNullConstraints(dbVersion);

    const useCatalogStatement = arePkFkConstraintsAvailable ? getUseCatalogStatement(containerData) : '';
    const viewsScriptDtos = getContainerLevelViewScriptDtos(data, _);
    const databaseStatement = getDatabaseStatement(containerData, arePkFkConstraintsAvailable);
    const entityScriptDtos = getContainerLevelEntitiesScriptDtos(app, data)({
        internalDefinitions,
        externalDefinitions,
        modelDefinitions,
        containerData,
        entitiesJsonSchema,
        arePkFkConstraintsAvailable,
        areNotNullConstraintsAvailable,
        includeRelationshipsInEntityScripts,
        includeSamplesInEntityScripts,
    });

    let relationshipScrips = [];
    if (!includeRelationshipsInEntityScripts && arePkFkConstraintsAvailable) {
        relationshipScrips = getCreateRelationshipScripts(app)(data.relationships, entitiesJsonSchema);
    }

    return {
        catalog: useCatalogStatement,
        container: databaseStatement,
        entities: entityScriptDtos,
        views: viewsScriptDtos,
        relationships: relationshipScrips,
    };

}

const buildContainerLevelFEScript = (containerLevelFEScriptDto) => {
    return buildScript([
        containerLevelFEScriptDto.catalog,
        containerLevelFEScriptDto.container,
        ...(containerLevelFEScriptDto.entities.map(e => e.script)),
        ...(containerLevelFEScriptDto.views.map(v => v.script)),
        ...(containerLevelFEScriptDto.relationships),
    ]);
}

module.exports = {
    buildEntityLevelFEScript,
    buildContainerLevelFEScriptDto,
    buildContainerLevelFEScript,
}
