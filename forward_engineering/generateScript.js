const { parseDataForEntityLevelScript } = require('./helpers/parsers');
const { buildEntityLevelAlterScript } = require('./alterScript/alterScriptBuilder');
const { getScriptAndSampleResponse } = require('./generateScriptAndSampleResponse');
const { buildEntityLevelFEScript } = require('./helpers/scriptBuilder/buildEntityLevelFeScript');
const { getSampleGenerationOptions } = require('./sampleGeneration/getSampleGenerationOptions');
const { generateSampleForDemonstration } = require('./sampleGeneration/generateSampleForDemonstration');

/**
 * @param {CoreData} data
 * @param {Logger} logger
 * @param {PluginCallback} callback
 * @param {App} app
 * */
const generateScript = (data, logger, callback, app) => {
	try {
		const parsedData = parseDataForEntityLevelScript(data);

		if (data.isUpdateScript) {
			const scripts = buildEntityLevelAlterScript(data, app)(parsedData);
			callback(null, scripts);
		} else {
			const scripts = buildEntityLevelFEScript(data, app)(parsedData);
			const sampleGenerationOptions = getSampleGenerationOptions(data);
			if (!sampleGenerationOptions.isSampleGenerationRequired) {
				return callback(null, scripts);
			}
			const demoSample = generateSampleForDemonstration(parsedData, 'entity');
			return callback(null, getScriptAndSampleResponse(scripts, demoSample));
		}
	} catch (e) {
		logger.log('error', { message: e.message, stack: e.stack }, 'DeltaLake Forward-Engineering Error');
		callback({ message: e.message, stack: e.stack });
	}
};

module.exports = {
	generateScript,
};
