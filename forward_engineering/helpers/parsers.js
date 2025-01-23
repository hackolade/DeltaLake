const { getDataForSampleGeneration } = require('../sampleGeneration/getDataForSampleGeneration');
const { parseJsonData } = require('./parseJsonData');

const parseEntities = (entities, serializedItems) => {
	return (
		entities?.reduce((result, entityId) => {
			try {
				return { ...result, [entityId]: JSON.parse(serializedItems[entityId]) };
			} catch (e) {
				return result;
			}
		}, {}) ?? {}
	);
};

/**
 * @param {CoreData} data
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
const parseDataForEntityLevelScript = data => {
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
	};
};

/**
 * @param {CoreData} data
 * @return {{
 *      modelDefinitions: ModelDefinitions | unknown,
 *      internalDefinitions: InternalDefinitions | unknown,
 *      externalDefinitions: ExternalDefinitions | unknown,
 *      containerData: ContainerData | unknown,
 *      entitiesJsonSchema: EntitiesJsonSchema | unknown,
 *      jsonData: Record<string, Object>,
 *      entitiesData: EntitiesData | undefined,
 * }}
 * */
const parseDataForContainerLevelScript = data => {
	const modelData = data.modelData;
	const containerData = data.containerData;
	const modelDefinitions = JSON.parse(data.modelDefinitions);
	const externalDefinitions = JSON.parse(data.externalDefinitions);
	const entitiesJsonSchema = parseEntities(data.entities, data.jsonSchema);
	const internalDefinitions = parseEntities(data.entities, data.internalDefinitions);
	const relatedSchemas = parseEntities(data.relatedEntities, data.relatedSchemas);
	const { jsonData, entitiesData } = getDataForSampleGeneration(data, entitiesJsonSchema);

	return {
		modelData,
		modelDefinitions,
		internalDefinitions,
		externalDefinitions,
		containerData,
		entitiesJsonSchema,
		jsonData,
		entitiesData,
		relatedSchemas,
	};
};

module.exports = {
	parseDataForEntityLevelScript,
	parseDataForContainerLevelScript,
};
