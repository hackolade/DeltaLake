/**
 * @param {CoreData} data
 * @param {Logger} logger
 * @param {PluginCallback} callback
 * @param {App} app
 * */
const { parseDataForContainerLevelScript, parseDataForEntityLevelScript } = require('./helpers/parsers');
const {
	doesContainerLevelAlterScriptContainDropStatements,
	doesEntityLevelAlterScriptContainDropStatements,
} = require('./alterScript/alterScriptBuilder');

const isDropInStatements = (data, logger, callback, app) => {
	try {
		if (data.level === 'container') {
			const parsedData = parseDataForContainerLevelScript(data);
			const doesContainDropStatements = doesContainerLevelAlterScriptContainDropStatements(data, app)(parsedData);
			callback(null, doesContainDropStatements);
		} else if (data.level === 'entity') {
			const parsedData = parseDataForEntityLevelScript(data);
			const doesContainDropStatements = doesEntityLevelAlterScriptContainDropStatements(data, app)(parsedData);
			callback(null, doesContainDropStatements);
		}
	} catch (e) {
		callback({ message: e.message, stack: e.stack });
	}
};

module.exports = {
	isDropInStatements,
};
