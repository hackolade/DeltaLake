const { batchProcessFile } = require('../../reverse_engineering/helpers/fileHelper');
const { generateSamples } = require('./generateSamples');

/**
 * @typedef {import('../types/coreApplicationDataTypes').EntityJsonSchema} EntityJsonSchema
 * @typedef {import('./sampleGenerationTypes').EntitiesData} EntitiesData
 * @typedef {import('./sampleGenerationTypes').EntityData} EntityData
 * @typedef {import('./sampleGenerationTypes').ParsedJsonData} ParsedJsonData
 */

/**
 * @return {
 *      (
 *          entityJsonSchema: Object,
 *          samples: Array<Object>,
 *      ) => string
 * }
 * */
const generateSamplesScript = (entityJsonSchema, samples) => {
	if (!samples?.length) {
		return '';
	}
	if (!(entityJsonSchema.bucketName && entityJsonSchema.collectionName)) {
		return '';
	}
	return generateSamples(entityJsonSchema, samples);
};

/**
 * @param {EntityData} entityData
 * @return {Promise<Array<string>>}
 */
const generateSamplesForEntity = async entityData => {
	const { filePath, jsonSchema, jsonData } = entityData;

	const demoSample = generateSamplesScript(jsonSchema, [jsonData]);

	const samples = [demoSample];

	await batchProcessFile({
		filePath,
		batchSize: 1,
		parseLine: line => JSON.parse(line),
		batchHandler: async batch => {
			const sample = generateSamplesScript(jsonSchema, batch);
			samples.push(sample);
		},
	});

	return samples;
};

module.exports = {
	generateSamplesScript,
	generateSamplesForEntity,
};
