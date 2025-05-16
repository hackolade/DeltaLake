const fetchRequestHelper = require('../reverse_engineering/helpers/fetchRequestHelper');
const databricksHelper = require('../reverse_engineering/helpers/databricksHelper');
const { getCleanedUrl } = require('./utils/general');
const { generateScript } = require('./generateScript');
const { generateContainerScript } = require('./generateContainerScript');
const { generateViewScript } = require('./generateViewScript');
const { isDropInStatements } = require('./isDropInStatements');
const { App, CoreData, Logger, PluginError } = require('./types/coreApplicationTypes');
const { ContainerJsonSchema, ContainerStyles, EntityJsonSchema } = require('./types/coreApplicationDataTypes');

/**
 * @typedef {(error?: PluginError | null, result?: any | null) => void} PluginCallback
 * @typedef {import('./sampleGeneration/sampleGenerationTypes').EntitiesData} EntitiesData
 * @typedef {[ContainerJsonSchema, ContainerStyles]} ContainerData
 * @typedef {{
 *     [id: string]: EntityJsonSchema
 * }} EntitiesJsonSchema
 * */

const logInfo = (step, connectionInfo, logger) => {
	logger.clear();
	logger.log('info', connectionInfo, 'connectionInfo', connectionInfo.hiddenKeys);
};

module.exports = {
	generateScript,

	generateViewScript,

	generateContainerScript,

	isDropInStatements,

	/**
	 * @param {CoreData} data
	 * @param {Logger} logger
	 * @param {PluginCallback} cb
	 * @param {App} app
	 * */
	async applyToInstance(data, logger, cb, app) {
		const connectionData = {
			host: getCleanedUrl(data.host),
			clusterId: data.clusterId,
			accessToken: data.accessToken,
			applyToInstanceQueryRequestTimeout: data.applyToInstanceQueryRequestTimeout,
			script: data.script,
			entitiesData: data.entitiesData,
		};

		try {
			await fetchRequestHelper.fetchApplyToInstance(connectionData, logger);
			cb();
		} catch (err) {
			logger.log('error', { message: err.message, stack: err.stack, error: err }, 'Apply to instance');
			cb({ message: err.message, stack: err.stack });
		}
	},

	/**
	 * @param {CoreData} connectionInfo
	 * @param {Logger} logger
	 * @param {PluginCallback} cb
	 * */
	async testConnection(connectionInfo, logger, cb) {
		try {
			logInfo('Test connection FE', connectionInfo, logger);

			const connectionData = {
				host: getCleanedUrl(connectionInfo.host),
				clusterId: connectionInfo.clusterId,
				accessToken: connectionInfo.accessToken,
			};

			const clusterState = await databricksHelper.getClusterStateInfo(connectionData, logger);
			logger.log('info', clusterState, 'Cluster state info');

			if (!clusterState.isRunning) {
				cb({ message: `Cluster is unavailable. Cluster status: ${clusterState.state}`, type: 'simpleError' });
			}
			cb();
		} catch (err) {
			logger.log('error', { message: err.message, stack: err.stack, error: err }, 'Test connection FE');
			cb({ message: err.message, stack: err.stack });
		}
	},
};
