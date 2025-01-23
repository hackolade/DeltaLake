/**
 * @param {CoreData} data
 * @param {Logger} logger
 * @param {PluginCallback} callback
 * @param {App} app
 * */
const { isSupportUnityCatalog, buildScript } = require('./utils/general');
const { getUseCatalogStatement, getDatabaseStatement } = require('./helpers/databaseHelper');

const generateViewScript = (data, logger, callback, app) => {
	try {
		const provider = require('./ddlProvider/ddlProvider')(app);
		const viewSchema = JSON.parse(data.jsonSchema || '{}');
		const dbVersion = data.modelData[0].dbVersion;
		const isUnityCatalogSupports = isSupportUnityCatalog(dbVersion);

		const useCatalogStatement = isUnityCatalogSupports ? getUseCatalogStatement(data.containerData) : '';
		const databaseStatement = getDatabaseStatement(data.containerData, isUnityCatalogSupports, dbVersion);

		const script = provider.createView({
			schema: viewSchema,
			viewData: data.viewData,
			containerData: data.containerData,
			collectionRefsDefinitionsMap: data.collectionRefsDefinitionsMap,
			isKeyspaceActivated: true,
		});

		callback(null, buildScript([useCatalogStatement, databaseStatement, script]));
	} catch (e) {
		logger.log('error', { message: e.message, stack: e.stack }, 'DeltaLake Forward-Engineering Error');

		callback({ message: e.message, stack: e.stack });
	}
};

module.exports = {
	generateViewScript,
};
