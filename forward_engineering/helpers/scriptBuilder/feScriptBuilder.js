/**
 * @typedef {import('../../types/coreApplicationTypes').CoreData} CoreData
 * @typedef {import('../../types/coreApplicationTypes').App} App
 * @typedef {import('../../types/coreApplicationDataTypes').ContainerJsonSchema} ContainerJsonSchema
 * @typedef {import('../../types/coreApplicationDataTypes').ContainerStyles} ContainerStyles
 * @typedef {import('../../types/coreApplicationDataTypes').EntityData} EntityData
 * @typedef {import('../../types/coreApplicationDataTypes').EntityJsonSchema} EntityJsonSchema
 * @typedef {import('../../types/coreApplicationDataTypes').ExternalDefinitions} ExternalDefinitions
 * @typedef {import('../../types/coreApplicationDataTypes').InternalDefinitions} InternalDefinitions
 * @typedef {import('../../types/coreApplicationDataTypes').ModelDefinitions} ModelDefinitions
 *
 * @typedef {[ContainerJsonSchema, ContainerStyles]} ContainerData
 *
 * @typedef {{
 *     [id: string]: EntityJsonSchema
 * }} EntitiesJsonSchema
 *
 * @typedef {{
 *     name: string,
 *     script: string,
 * }} ContainerLevelEntityDto
 *
 * @typedef {{
 *     externalDefinitions: ExternalDefinitions,
 *          modelDefinitions: ModelDefinitions,
 *          jsonSchema: EntityJsonSchema,
 *          internalDefinitions: InternalDefinitions,
 *          containerData: ContainerData,
 *          entityData: EntityData[]
 *
 * }} EntityLevelFEScriptData
 *
 * @typedef {{
 *     externalDefinitions: ExternalDefinitions,
 *     modelDefinitions: ModelDefinitions,
 *     internalDefinitions: InternalDefinitions,
 *     containerData: ContainerData,
 *     includeRelationshipsInEntityScripts: boolean,
 *     entitiesJsonSchema: EntitiesJsonSchema,
 *     includeSamplesInEntityScripts: boolean,
 * }} ContainerLevelFEScriptData
 * */

const _ = require('lodash');
const { getDatabaseStatement, getUseCatalogStatement } = require('../databaseHelper');
const { getTableStatement } = require('../tableHelper');
const { getIndexes } = require('../indexHelper');
const {
	buildScript,
	getName,
	getTab,
	isSupportUnityCatalog,
	isSupportNotNullConstraints,
} = require('../../utils/general');
const { generateSamplesScript, generateSamplesForEntity } = require('../../sampleGeneration/sampleGenerationService');
const { getDataForSampleGeneration } = require('../../sampleGeneration/getDataForSampleGeneration');
const foreignKeyHelper = require('../foreignKeyHelper');

/**
 * @param data {CoreData}
 * @return {Array<ContainerLevelEntityDto>}
 * */
const getContainerLevelViewScriptDtos = (data, provider) => {
	return data.views
		.map(viewId => {
			const viewSchema = JSON.parse(data.jsonSchema[viewId] || '{}');
			const viewData = data.viewData[viewId];
			const viewScript = provider.createView({
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
		})
		.filter(({ script }) => !_.isEmpty(script));
};

/**
 * @param _ {any}
 * @return {({
 *      data: CoreData,
 *      includeSamplesInEntityScripts: boolean,
 *      entitiesJsonSchema: Record<string, Object>,
 *      entityId: string,
 * }) => Promise<string>}
 */
const getSampleScriptForContainerLevelScript = async ({
	data,
	includeSamplesInEntityScripts,
	entitiesJsonSchema,
	entityId,
}) => {
	const sampleScripts = [];
	if (includeSamplesInEntityScripts) {
		const { jsonData, entitiesData } = getDataForSampleGeneration(data, entitiesJsonSchema);
		const entityJsonSchema = entitiesJsonSchema[entityId] || {};
		if (jsonData) {
			const demoSampleJsonData = jsonData[entityId] || {};
			const demoSample = generateSamplesScript(entityJsonSchema, [demoSampleJsonData]);
			sampleScripts.push(demoSample);
		}
		if (entitiesData) {
			const entityData = entitiesData[entityId];
			const samples = await generateSamplesForEntity(entityData);
			sampleScripts.push(...samples);
		}
	}

	return sampleScripts.join('\n\n');
};

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(data: ContainerLevelFEScriptData) => Promise<Array<ContainerLevelEntityDto>>}
 * */
const getContainerLevelEntitiesScriptDtos =
	(app, data) =>
	async ({
		externalDefinitions,
		modelDefinitions,
		internalDefinitions,
		containerData,
		entitiesJsonSchema,
		arePkFkConstraintsAvailable,
		areNotNullConstraintsAvailable,
		includeRelationshipsInEntityScripts,
		includeSamplesInEntityScripts,
		relatedSchemas,
	}) => {
		const scriptDtos = [];

		const foreignKeyHashTable = foreignKeyHelper.getForeignKeyHashTable({
			relationships: data.relationships,
			entities: data.entities,
			entityData: data.entityData,
			jsonSchemas: entitiesJsonSchema,
			internalDefinitions: internalDefinitions,
			otherDefinitions: [modelDefinitions, externalDefinitions],
			isContainerActivated: containerData[0]?.isActivated,
			relatedSchemas: relatedSchemas,
		});

		for (const entityId of data.entities) {
			const entityData = data.entityData[entityId];
			const tableData = getTab(0, entityData);
			const dbVersion = data.modelData[0].dbVersion;
			const likeTableData = data.entityData[tableData?.like];
			const entityJsonSchema = entitiesJsonSchema[entityId];
			const definitions = [internalDefinitions[entityId], modelDefinitions, externalDefinitions];
			const createTableStatementArgs = [containerData, entityData, entityJsonSchema, definitions];

			const foreignKeyStatement = foreignKeyHelper.getForeignKeyStatementsByHashItem(
				app,
				foreignKeyHashTable[entityId] || {},
			);

			const tableStatement = getTableStatement(app)(
				...createTableStatementArgs,
				arePkFkConstraintsAvailable,
				areNotNullConstraintsAvailable,
				likeTableData,
				dbVersion,
				false,
				foreignKeyStatement,
			);

			const indexScript = getIndexes(...createTableStatementArgs);

			const sampleScript = await getSampleScriptForContainerLevelScript({
				data,
				entitiesJsonSchema,
				entityId,
				includeSamplesInEntityScripts,
			});

			let tableScript = buildScript([tableStatement, indexScript]);
			if (sampleScript) {
				// This is because SQL formatter breaks some "INSERT" statements with complex types
				tableScript = [tableScript, sampleScript].join('\n');
			}

			scriptDtos.push({
				name: getName(entityData[0]),
				script: tableScript,
			});
		}

		return scriptDtos;
	};

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: ContainerLevelFEScriptData & {
 *      includeRelationshipsInEntityScripts: boolean,
 *      includeSamplesInEntityScripts: boolean,
 * }) => Promise<{
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
 * }>}
 * */
const buildContainerLevelFEScriptDto =
	(data, app) =>
	async ({
		internalDefinitions,
		externalDefinitions,
		modelDefinitions,
		entitiesJsonSchema,
		containerData,
		includeRelationshipsInEntityScripts,
		includeSamplesInEntityScripts,
		relatedSchemas,
	}) => {
		const dbVersion = data.modelData[0].dbVersion;
		const arePkFkConstraintsAvailable = isSupportUnityCatalog(dbVersion);
		const areNotNullConstraintsAvailable = isSupportNotNullConstraints(dbVersion);

		const provider = require('../../ddlProvider/ddlProvider')(app);
		const useCatalogStatement = arePkFkConstraintsAvailable ? getUseCatalogStatement(containerData) : '';
		const viewsScriptDtos = getContainerLevelViewScriptDtos(data, provider);
		const databaseStatement = getDatabaseStatement(containerData, arePkFkConstraintsAvailable, dbVersion);
		const entityScriptDtos = await getContainerLevelEntitiesScriptDtos(
			app,
			data,
		)({
			internalDefinitions,
			externalDefinitions,
			modelDefinitions,
			containerData,
			entitiesJsonSchema,
			arePkFkConstraintsAvailable,
			areNotNullConstraintsAvailable,
			includeRelationshipsInEntityScripts,
			includeSamplesInEntityScripts,
			relatedSchemas,
		});

		return {
			catalog: useCatalogStatement,
			container: databaseStatement,
			entities: entityScriptDtos,
			views: viewsScriptDtos,
		};
	};

const buildContainerLevelFEScript = containerLevelFEScriptDto => {
	return buildScript([
		containerLevelFEScriptDto.catalog,
		containerLevelFEScriptDto.container,
		...containerLevelFEScriptDto.entities.map(e => e.script),
		...containerLevelFEScriptDto.views.map(v => v.script),
	]);
};

module.exports = {
	buildContainerLevelFEScriptDto,
	buildContainerLevelFEScript,
};
