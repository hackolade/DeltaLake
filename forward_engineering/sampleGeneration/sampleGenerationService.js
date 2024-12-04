const _ = require('lodash');
const { prepareName, generateFullEntityNameFromBucketAndTableNames } = require('../utils/general');
const { mapInsertSampleToDml } = require('./mapInsertSampleToDml');
const { CoreData, App } = require('../types/coreApplicationTypes');
const { batchProcessFile } = require('../../reverse_engineering/helpers/fileHelper');

/**
 * @typedef {import('../types/coreApplicationDataTypes').EntityJsonSchema} EntityJsonSchema
 * @typedef {import('./sampleGenerationTypes').EntitiesData} EntitiesData
 * @typedef {import('./sampleGenerationTypes').EntityData} EntityData
 * @typedef {import('./sampleGenerationTypes').ParsedJsonData} ParsedJsonData
 */

/**
 * @param {App} app
 * @param {CoreData} data
 * @return {{
 * isSampleGenerationRequired: boolean,
 * shouldAppendSamplesToTheResultScript: boolean
 * }}
 */
const getSampleGenerationOptions = (app, data) => {
	const insertSamplesOption =
		_.get(data, 'options.additionalOptions', []).find(option => option.id === 'INCLUDE_SAMPLES') || {};
	const isSampleGenerationRequired = Boolean(insertSamplesOption?.value);
	// Append to result script if the plugin is invoked from cli and do not append if it's invoked from GUI app
	const shouldAppendSamplesToTheResultScript = data.options.origin !== 'ui';

	return {
		isSampleGenerationRequired,
		shouldAppendSamplesToTheResultScript,
	};
};

/**
 * @param jsonData {Record<string, string> | string}
 * @return {ParsedJsonData}
 * */
const parseJsonData = jsonData => {
	if (typeof jsonData === 'string') {
		return JSON.parse(jsonData);
	}

	const collectionIdToSamples = {};
	for (const collectionId of Object.keys(jsonData)) {
		collectionIdToSamples[collectionId] = JSON.parse(jsonData[collectionId]);
	}
	return collectionIdToSamples;
};

/**
 * @param columnIndex {number}
 * @param maxColumnsInLineOfValuesClause {number}
 * @return {string}
 * */
const getValuesClauseColumnDelimiter = (columnIndex, maxColumnsInLineOfValuesClause) => {
	const indexInLine = columnIndex % maxColumnsInLineOfValuesClause;
	if (columnIndex === 0 || indexInLine !== 0) {
		return ', ';
	}
	if (columnIndex !== 0 && indexInLine === 0) {
		return ',\n\t';
	}
	return '';
};

/**
 * @return {
 *     (
 *      entityJsonSchema: SampleGenerationEntityJsonSchema,
 *      samples: Array<Record<string, any>>
 *     ) => string
 * }
 * */
const generateSamples = _ => (entityJsonSchema, samples) => {
	if (!samples.length) {
		return '';
	}
	const { bucketName, collectionName } = entityJsonSchema;
	const ddlTableName = generateFullEntityNameFromBucketAndTableNames(bucketName, collectionName);
	const properties = entityJsonSchema.properties || {};

	const firstSample = _.get(samples, '[0]', {});
	const columnNames = Object.keys(firstSample);
	const ddlColumnNames = columnNames.map(name => prepareName(name));
	const joinedDdlColumnNames = ddlColumnNames.join(',\n\t');

	const insertIntoClause = `INSERT INTO ${ddlTableName} (\n\t${joinedDdlColumnNames}\n) VALUES`;
	const statements = [insertIntoClause];
	const maxColumnsInLineOfValuesClause = 3;

	for (let i = 0; i < samples.length; i++) {
		const sampleDto = samples[i];
		const valueClauseParts = ['(\n\t'];
		for (let j = 0; j < columnNames.length; j++) {
			const columnName = columnNames[j];
			const sampleValue = sampleDto[columnName];
			const column = properties[columnName] || {};

			const ddlValueRepresentation = mapInsertSampleToDml(column, sampleValue);
			valueClauseParts.push(ddlValueRepresentation);
			if (j !== columnNames.length - 1) {
				const columnDelimiter = getValuesClauseColumnDelimiter(j, maxColumnsInLineOfValuesClause);
				valueClauseParts.push(columnDelimiter);
			}
		}
		valueClauseParts.push('\n)');
		statements.push(valueClauseParts.join(''));
		if (i !== samples.length - 1) {
			statements.push(',\n');
		}
	}

	return statements.join('\n') + ';';
};

/**
 * @return {(parsedData: Object) => string}
 * */
const generateSampleForDemonstrationOnContainerLevel = _ => parsedData => {
	/**
	 * @type {ContainerLevelParsedJsonData}
	 * */
	const sampleData = parsedData.jsonData || {};
	const collectionIds = Object.keys(sampleData);

	return collectionIds
		.map(collectionId => {
			const entityJsonSchema = (parsedData.entitiesJsonSchema || {})[collectionId] || {};
			const collectionSampleData = sampleData[collectionId] || {};
			return generateSamples(_)(entityJsonSchema, [collectionSampleData]);
		})
		.concat([''])
		.join('\n\n');
};

/**
 * @return {(parsedData: Object) => string}
 * */
const generateSampleForDemonstrationOnEntityLevel = _ => parsedData => {
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
	return generateSamples(_)(entityJsonSchema, [sampleData]);
};

/**
 * @param app {App}
 * @param parsedData {Object}
 * @param level {'entity' | 'container'}
 * @return {string}
 * */
const generateSampleForDemonstration = (app, parsedData, level) => {
	if (level === 'entity') {
		return generateSampleForDemonstrationOnEntityLevel(_)(parsedData);
	}
	if (level === 'container') {
		return generateSampleForDemonstrationOnContainerLevel(_)(parsedData);
	}
	return '';
};

/**
 * @return {
 *      (
 *          entityJsonSchema: Object,
 *          samples: Array<Object>,
 *      ) => string
 * }
 * */
const generateSamplesScript = _ => (entityJsonSchema, samples) => {
	if (!samples?.length) {
		return '';
	}
	if (!(entityJsonSchema.bucketName && entityJsonSchema.collectionName)) {
		return '';
	}
	return generateSamples(_)(entityJsonSchema, samples);
};

/**
 * @param {CoreData} data
 * @param {{[id: string]: EntityJsonSchema}} entitiesJsonSchema
 * @return {{
 * jsonData: ParsedJsonData | undefined,
 * entitiesData: EntitiesData | undefined,
 * }}
 */
const getDataForSampleGeneration = (data, entitiesJsonSchema) => {
	let jsonData = undefined;
	let entitiesData = undefined;

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
/**
 * @param {EntityData} entityData
 * @return {Promise<Array<string>>}
 */
const generateSamplesForEntity = _ => async entityData => {
	const { filePath, jsonSchema, jsonData } = entityData;

	const demoSample = generateSamplesScript(_)(jsonSchema, [jsonData]);

	const samples = [demoSample];

	await batchProcessFile({
		filePath,
		batchSize: 1,
		parseLine: line => JSON.parse(line),
		batchHandler: async batch => {
			const sample = generateSamplesScript(_)(jsonSchema, batch);
			samples.push(sample);
		},
	});

	return samples;
};

module.exports = {
	getSampleGenerationOptions,
	parseJsonData,
	generateSampleForDemonstration,
	generateSamplesScript,
	getDataForSampleGeneration,
	generateSamplesForEntity,
};
