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

const _ = require('lodash');
const { getDatabaseStatement, getUseCatalogStatement } = require('./databaseHelper');
const { getCreateRelationshipScripts } = require('./relationshipHelper');
const { getTableStatement } = require('./tableHelper');
const { getIndexes } = require('./indexHelper');
const {
	buildScript,
	getName,
	getTab,
	isSupportUnityCatalog,
	isSupportNotNullConstraints,
	getDBVersionNumber,
} = require('../utils/general');
const { getViewScript } = require('./viewHelper');
const {
	generateSamplesScript,
	getDataForSampleGeneration,
	generateSamplesForEntity,
} = require('../sampleGeneration/sampleGenerationService');

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
const buildEntityLevelFEScript =
	(data, app) =>
	({
		externalDefinitions,
		modelDefinitions,
		jsonSchema,
		internalDefinitions,
		containerData,
		entityData,
		modelData,
	}) => {
		const dbVersion = data.modelData[0].dbVersion;
		const arePkFkConstraintsAvailable = isSupportUnityCatalog(dbVersion);
		const areNotNullConstraintsAvailable = isSupportNotNullConstraints(dbVersion);
		const useCatalogStatement = arePkFkConstraintsAvailable ? getUseCatalogStatement(containerData) : '';
		const databaseStatement = getDatabaseStatement(containerData, arePkFkConstraintsAvailable, dbVersion);
		const definitions = [modelDefinitions, internalDefinitions, externalDefinitions];
		const tableStatements = getTableStatement(app)(
			containerData,
			entityData,
			jsonSchema,
			definitions,
			arePkFkConstraintsAvailable,
			areNotNullConstraintsAvailable,
			null,
			dbVersion,
		);
		const indexScript = getIndexes(containerData, entityData, jsonSchema, definitions);

		let relationshipScripts = [];
		if (arePkFkConstraintsAvailable) {
			const entityId = jsonSchema.GUID;
			const relationshipsWithThisTableAsChild = modelData[1]?.relationships.filter(
				relationship => relationship.childCollection === entityId,
			);
			relationshipScripts = getCreateRelationshipScripts(app)({
				relationships: relationshipsWithThisTableAsChild,
				jsonSchemas: jsonSchema,
			});
		}

		return buildScript([
			useCatalogStatement,
			databaseStatement,
			tableStatements,
			...relationshipScripts,
			indexScript,
		]);
	};

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

		for (const entityId of data.entities) {
			const entityData = data.entityData[entityId];

			const dbVersion = data.modelData[0].dbVersion;
			const likeTableData = data.entityData[getTab(0, entityData)?.like];
			const entityJsonSchema = entitiesJsonSchema[entityId];
			const definitions = [internalDefinitions[entityId], modelDefinitions, externalDefinitions];
			const createTableStatementArgs = [containerData, entityData, entityJsonSchema, definitions];

			const tableStatement = getTableStatement(app)(
				...createTableStatementArgs,
				arePkFkConstraintsAvailable,
				areNotNullConstraintsAvailable,
				likeTableData,
				dbVersion,
			);

			const indexScript = getIndexes(...createTableStatementArgs);

			let relationshipScripts = [];
			if (includeRelationshipsInEntityScripts && arePkFkConstraintsAvailable) {
				const relationshipsWithThisTableAsChild = data.relationships.filter(
					relationship => relationship.childCollection === entityId,
				);
				relationshipScripts = getCreateRelationshipScripts(app)({
					relationships: relationshipsWithThisTableAsChild,
					jsonSchemas: entitiesJsonSchema,
					relatedSchemas,
				});
			}

			const sampleScript = await getSampleScriptForContainerLevelScript({
				data,
				entitiesJsonSchema,
				entityId,
				includeSamplesInEntityScripts,
			});

			let tableScript = buildScript([tableStatement, indexScript, ...relationshipScripts]);
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

		const provider = require('../ddlProvider/ddlProvider')(app);
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

		let relationshipScrips = [];
		if (!includeRelationshipsInEntityScripts && arePkFkConstraintsAvailable) {
			relationshipScrips = getCreateRelationshipScripts(app)({
				relationships: data.relationships,
				jsonSchemas: entitiesJsonSchema,
				relatedSchemas,
			});
		}

		return {
			catalog: useCatalogStatement,
			container: databaseStatement,
			entities: entityScriptDtos,
			views: viewsScriptDtos,
			relationships: relationshipScrips,
		};
	};

const buildContainerLevelFEScript = containerLevelFEScriptDto => {
	return buildScript([
		containerLevelFEScriptDto.catalog,
		containerLevelFEScriptDto.container,
		...containerLevelFEScriptDto.entities.map(e => e.script),
		...containerLevelFEScriptDto.views.map(v => v.script),
		...containerLevelFEScriptDto.relationships,
	]);
};

module.exports = {
	buildEntityLevelFEScript,
	buildContainerLevelFEScriptDto,
	buildContainerLevelFEScript,
};
