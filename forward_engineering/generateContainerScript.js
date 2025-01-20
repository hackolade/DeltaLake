const {
	buildContainerLevelFEScriptDto,
	buildContainerLevelFEScript,
} = require('./helpers/scriptBuilder/feScriptBuilder');
const { parseDataForContainerLevelScript } = require('./helpers/parsers');
const { buildContainerLevelAlterScript } = require('./alterScript/alterScriptBuilder');
const { getSampleGenerationOptions } = require('./sampleGeneration/getSampleGenerationOptions');
const { generateSampleForDemonstration } = require('./sampleGeneration/generateSampleForDemonstration');
const { generateSamplesForEntity } = require('./sampleGeneration/sampleGenerationService');
const { getScriptAndSampleResponse } = require('./generateScriptAndSampleResponse');

/**
 * @param {CoreData} data
 * @param {App} app
 * @return {Promise<{
 *      container: string,
 *      entities: Array<{ name: string, script: string }>,
 *      views: Array<{ name: string, script: string }>,
 * }>}
 * */
const getContainerScriptWithSeparateBuckets = async (app, data) => {
	const parsedData = parseDataForContainerLevelScript(data);
	const sampleGenerationOptions = getSampleGenerationOptions(data);

	const scriptData = await buildContainerLevelFEScriptDto(
		data,
		app,
	)({
		...parsedData,
		includeRelationshipsInEntityScripts: true,
		includeSamplesInEntityScripts: sampleGenerationOptions.isSampleGenerationRequired,
	});

	const useCatalogStatement = scriptData.catalog ? scriptData.catalog + '\n\n' : '';
	return {
		container: useCatalogStatement + scriptData.container,
		entities: scriptData.entities,
		views: scriptData.views,
	};
};

/**
 * @param {CoreData} data
 * @param {App} app
 * @return {Promise<string | Array<{ title: string, script: string, mode: string }>>}
 * */
const getContainerScriptWithNotSeparateBuckets = async (app, data) => {
	const parsedData = parseDataForContainerLevelScript(data);
	const sampleGenerationOptions = getSampleGenerationOptions(data);
	const scriptData = await buildContainerLevelFEScriptDto(
		data,
		app,
	)({
		...parsedData,
		includeRelationshipsInEntityScripts: false,
		includeSamplesInEntityScripts: false,
	});
	const scripts = buildContainerLevelFEScript(scriptData);
	if (!sampleGenerationOptions.isSampleGenerationRequired) {
		return scripts;
	}

	if (parsedData.jsonData) {
		const demoSample = generateSampleForDemonstration(parsedData, 'container');

		return getScriptAndSampleResponse(scripts, demoSample);
	}

	const sampleScripts = [];

	for (const entityData of Object.values(parsedData.entitiesData || {})) {
		const samples = await generateSamplesForEntity(entityData);
		sampleScripts.push(...samples);
	}

	return getScriptAndSampleResponse(scripts, sampleScripts.join('\n\n'));
};

/**
 * @param {CoreData} data
 * @param {Logger} logger
 * @param {PluginCallback} callback
 * @param {App} app
 * */
const generateContainerScript = async (data, logger, callback, app) => {
	try {
		const parsedData = parseDataForContainerLevelScript(data);
		if (data.isUpdateScript) {
			const script = buildContainerLevelAlterScript(data, app)(parsedData);
			callback(null, script);
		} else {
			if (data.options.separateBucket) {
				const scripts = await getContainerScriptWithSeparateBuckets(app, data);
				return callback(null, scripts);
			}
			const scripts = await getContainerScriptWithNotSeparateBuckets(app, data);
			return callback(null, scripts);
		}
	} catch (e) {
		logger.log('error', { message: e.message, stack: e.stack }, 'DeltaLake Forward-Engineering Error');

		callback({ message: e.message, stack: e.stack });
	}
};

module.exports = {
	generateContainerScript,
};
