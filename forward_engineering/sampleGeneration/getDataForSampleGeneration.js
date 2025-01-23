const { CoreData } = require('../types/coreApplicationTypes');
const { parseJsonData } = require('../helpers/parseJsonData');

/**
 * @param {CoreData} data
 * @param {{[id: string]: EntityJsonSchema}} entitiesJsonSchema
 * @return {{
 * jsonData: ParsedJsonData | undefined,
 * entitiesData: EntitiesData | undefined,
 * }}
 */
const getDataForSampleGeneration = (data, entitiesJsonSchema) => {
	let jsonData;
	let entitiesData;

	if (!data.entitiesData) {
		jsonData = parseJsonData(data.jsonData);
	} else {
		entitiesData = {};
		for (const key of Object.keys(data.entitiesData)) {
			const value = data.entitiesData[key];
			entitiesData[key] = {
				...value,
				jsonData: parseJsonData(value.jsonData),
				jsonSchema: entitiesJsonSchema[key] || {},
			};
		}
	}

	return { jsonData, entitiesData };
};

module.exports = {
	getDataForSampleGeneration,
};
