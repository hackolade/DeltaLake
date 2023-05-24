/**
 * @typedef {import('../types/coreApplicationTypes').CoreData} CoreData
 * @typedef {import('./types/coreApplicationTypes').App} App
 * */

/**
 * @typedef {[{
 *     name: string,
 *     isActivated: boolean,
 * }, {
 *     backgroundColor: Object,
 * }]} ContainerData
 * */

/**
 * @typedef {[
 *     {
 *      collectionName: string,
 *      isActivated: boolean,
 *      bucketId: string,
 *      additionalProperties: boolean,
 *      tableIfNotExists: boolean,
 *    }
 * ]} EntityData
 * */

/**
 * @typedef {{
 *   $schema: string,
 *   type: "definitions",
 *   GUID: string,
 * }} InternalDefinitions
 * */

/**
 * @typedef {{
 *   $schema: string,
 *   type: "definitions",
 *   GUID: string,
 * }} ModelDefinitions
 * */

/**
 * @typedef {{
 *   $schema: string,
 *   type: "externalDefinitions",
 *   GUID: string,
 * }} ExternalDefinitions
 * */

/**
 * @typedef {{
 *   $schema: string,
 *   type: "object",
 *   title: string,
 *   properties: {
 *      [x: string]: {
 *       type: string,
 *       isActivated: boolean,
 *       mode: string,
 *       subtype: string,
 *       compositeKey: [
 *         "compositePartitionKey",
 *         "compositeClusteringKey",
 *         "compositePrimaryKey",
 *         "compositeUniqueKey",
 *       ],
 *       compositePartitionKey: boolean,
 *       compositeClusteringKey: boolean,
 *       compositePrimaryKey: boolean,
 *       compositeUniqueKey: boolean,
 *       GUID: string,
 *      },
 *   },
 *   isActivated: boolean,
 *   additionalProperties: boolean,
 *   tableIfNotExists: boolean,
 *   GUID: string,
 * }} EntityJsonSchema
 * */

/**
 * @typedef {{
 *     name: string,
 *     script: string,
 * }} ContainerLevelEntityDto
 * */

import {getDatabaseStatement} from "./databaseHelper";
import {getTableStatement} from "./tableHelper";
import {buildScript, getName, getTab} from "../utils/generalUtils";
import {getIndexes} from "./indexHelper";
import {getViewScript} from "./viewHelper";
import {getCreateRelationshipScripts} from "./relationshipHelper";

/**
 *  @return {
 *      function({
 *          externalDefinitions: ExternalDefinitions,
 *          modelDefinitions: ModelDefinitions,
 *          jsonSchema: EntityJsonSchema,
 *          internalDefinitions: InternalDefinitions,
 *          containerData: ContainerData,
 *          entityData: EntityData
 *     }): string
 *  }
 * */
export const buildEntityLevelFEScript = (app) => ({
                                                      externalDefinitions,
                                                      modelDefinitions,
                                                      jsonSchema,
                                                      internalDefinitions,
                                                      containerData,
                                                      entityData,
                                                  }) => {
    const databaseStatement = getDatabaseStatement(containerData);
    const definitions = [modelDefinitions, internalDefinitions, externalDefinitions,];
    const tableStatements = getTableStatement(app)(
        containerData,
        entityData,
        jsonSchema,
        definitions,
        true,
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
 * @return {
 *      function({
 *          externalDefinitions: ExternalDefinitions,
 *          modelDefinitions: ModelDefinitions,
 *          internalDefinitions: InternalDefinitions,
 *          containerData: ContainerData,
 *          includeRelationships: boolean,
 *     }): Array<ContainerLevelEntityDto>
 *  }
 * */
const getContainerLevelEntitiesScriptDtos = (app, data) => ({
                                                                externalDefinitions,
                                                                modelDefinitions,
                                                                internalDefinitions,
                                                                containerData,
                                                                includeRelationships,
                                                            }) => {
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
        );

        const indexScript = getIndexes(...createTableStatementArgs);
        let relationshipScript = '';
        if (includeRelationships) {

        }

        const tableScript = buildScript([tableStatement, indexScript, relationshipScript]);

        return result.concat({
            name: getName(entityData[0]),
            script: tableScript,
        });
    }, [])
}

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {function({
 *          externalDefinitions: ExternalDefinitions,
 *          modelDefinitions: ModelDefinitions,
 *          jsonSchema: EntityJsonSchema,
 *          internalDefinitions: InternalDefinitions,
 *          containerData: ContainerData,
 *          entityData: EntityData,
 *          includeRelationshipsInEntityScripts: boolean,
 * }): {
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
export const buildContainerLevelFEScriptDto = (data, app) => ({
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
