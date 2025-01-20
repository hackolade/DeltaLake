const _ = require('lodash');
const { generateSamples } = require('./generateSamples');

/**
 * @return {(parsedData: Object) => string}
 * */
const generateSampleForDemonstrationOnContainerLevel = parsedData => {
	/**
	 * @type {ContainerLevelParsedJsonData}
	 * */
	const sampleData = parsedData.jsonData || {};
	const collectionIds = Object.keys(sampleData);

	return collectionIds
		.map(collectionId => {
			const entityJsonSchema = parsedData.entitiesJsonSchema?.[collectionId] || {};
			const collectionSampleData = sampleData[collectionId] || {};
			return generateSamples(entityJsonSchema, [collectionSampleData]);
		})
		.concat([''])
		.join('\n\n');
};

/**
 * @return {(parsedData: Object) => string}
 * */
const generateSampleForDemonstrationOnEntityLevel = parsedData => {
	/**
	 * @type {ContainerLevelParsedJsonData}
	 * */
	const sampleData = parsedData.jsonData || {};
	const entityData = _.get(parsedData, 'entityData[0]', {});
	const containerData = _.get(parsedData, 'containerData[0]', {});
	const entityJsonSchema = {
		...entityData,
		bucketName: containerData.name,
		...(parsedData.jsonSchema || {}),
	};
	return generateSamples(entityJsonSchema, [sampleData]);
};

/**
 * @param parsedData {Object}
 * @param level {'entity' | 'container'}
 * @return {string}
 * */
const generateSampleForDemonstration = (parsedData, level) => {
	if (level === 'entity') {
		return generateSampleForDemonstrationOnEntityLevel(parsedData);
	}
	if (level === 'container') {
		return generateSampleForDemonstrationOnContainerLevel(parsedData);
	}
	return '';
};

module.exports = {
	generateSampleForDemonstration,
};
