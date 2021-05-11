'use strict';

const { setDependencies, dependencies } = require('./helpers/appDependencies');
const { getDatabaseStatement, getDatabaseAlterStatement } = require('./helpers/databaseHelper');
const { getTableStatement, getTableAlterStatements } = require('./helpers/tableHelper');
const { getIndexes } = require('./helpers/indexHelper');
const { getViewScript, getViewAlterScripts } = require('./helpers/viewHelper');
const { prepareName, replaceSpaceWithUnderscore, getName, getTab } = require('./helpers/generalHelper');
const foreignKeyHelper = require('./helpers/foreignKeyHelper');
let _;
const sqlFormatter = require('sql-formatter');

const fetchRequestHelper = require('../reverse_engineering/helpers/fetchRequestHelper')
const deltaLakeHelper = require('../reverse_engineering/helpers/DeltaLakeHelper')
const logHelper = require('../reverse_engineering/logHelper');

module.exports = {
	generateScript(data, logger, callback, app) {
		try {
			setDependencies(app);
			setAppDependencies(dependencies);
			const jsonSchema = JSON.parse(data.jsonSchema);
			const modelDefinitions = JSON.parse(data.modelDefinitions);
			const internalDefinitions = JSON.parse(data.internalDefinitions);
			const externalDefinitions = JSON.parse(data.externalDefinitions);
			const containerData = data.containerData;
			const entityData = data.entityData;
			const areColumnConstraintsAvailable = data.modelData[0].dbVersion.startsWith(
				'3'
			);
			const areForeignPrimaryKeyConstraintsAvailable = !data.modelData[0].dbVersion.startsWith(
				'1'
			);
			const needMinify = (
				_.get(data, 'options.additionalOptions', []).find(
					(option) => option.id === 'minify'
				) || {}
			).value;

			const databaseStatement = data.isUpdateScript ? getDatabaseAlterStatement(containerData) : getDatabaseStatement(containerData);
			let tableStatements = [];
			if (data.isUpdateScript) {
				const tableAlterStatements = getTableAlterStatements(
					containerData,
					entityData,
					jsonSchema,
					[
						modelDefinitions,
						internalDefinitions,
						externalDefinitions,
					],
					null,
					areColumnConstraintsAvailable,
					areForeignPrimaryKeyConstraintsAvailable
				)
				tableStatements = [...tableStatements, ...tableAlterStatements]
			} else {
				const tableStatement = getTableStatement(
					containerData,
					entityData,
					jsonSchema,
					[
						modelDefinitions,
						internalDefinitions,
						externalDefinitions,
					],
					null,
					areColumnConstraintsAvailable,
					areForeignPrimaryKeyConstraintsAvailable
				)
				tableStatements.push(tableStatement)
			}
			callback(
				null,
				buildScript(needMinify)(
					databaseStatement,
					...tableStatements
					,
					getIndexes(containerData, entityData, jsonSchema, [
						modelDefinitions,
						internalDefinitions,
						externalDefinitions,
					])
				)
			);
		} catch (e) {
			logger.log(
				'error',
				{ message: e.message, stack: e.stack },
				'DeltaLake Forward-Engineering Error'
			);

			setTimeout(() => {
				callback({ message: e.message, stack: e.stack });
			}, 150);
		}
	},

	generateContainerScript(data, logger, callback, app) {
		try {
			setDependencies(app);
			setAppDependencies(dependencies);
			const containerData = data.containerData;
			const modelDefinitions = JSON.parse(data.modelDefinitions);
			const externalDefinitions = JSON.parse(data.externalDefinitions);
			const databaseStatement = data.isUpdateScript ? getDatabaseAlterStatement(containerData) : getDatabaseStatement(containerData);
			const jsonSchema = parseEntities(data.entities, data.jsonSchema);
			const internalDefinitions = parseEntities(
				data.entities,
				data.internalDefinitions
			);
			const areColumnConstraintsAvailable = data.modelData[0].dbVersion.startsWith(
				'3'
			);
			const areForeignPrimaryKeyConstraintsAvailable = !data.modelData[0].dbVersion.startsWith(
				'1'
			);
			const needMinify = (
				_.get(data, 'options.additionalOptions', []).find(
					(option) => option.id === 'minify'
				) || {}
			).value;

			let viewsScripts = [];

			data.views.map(viewId => {
				const viewSchema = JSON.parse(data.jsonSchema[viewId] || '{}');
				if (data.isUpdateScript) {
					const viewAlterScripts = getViewAlterScripts({
						schema: viewSchema,
						viewData: data.viewData[viewId],
						containerData: data.containerData,
						collectionRefsDefinitionsMap: data.collectionRefsDefinitionsMap,
						isKeyspaceActivated: true
					})
					viewsScripts = [...viewsScripts, ...viewAlterScripts];
				} else {
					const viewScript = getViewScript({
						schema: viewSchema,
						viewData: data.viewData[viewId],
						containerData: data.containerData,
						collectionRefsDefinitionsMap: data.collectionRefsDefinitionsMap,
						isKeyspaceActivated: true
					})
					viewsScripts.push(viewScript);
				}
			})

			viewsScripts = viewsScripts.filter(script => !_.isEmpty(script));

			const foreignKeyHashTable = foreignKeyHelper.getForeignKeyHashTable(
				data.relationships,
				data.entities,
				data.entityData,
				jsonSchema,
				internalDefinitions,
				[modelDefinitions, externalDefinitions],
				containerData[0] && containerData[0].isActivated
			);

			const entities = data.entities.reduce((result, entityId) => {
				const args = [
					containerData,
					data.entityData[entityId],
					jsonSchema[entityId],
					[
						internalDefinitions[entityId],
						modelDefinitions,
						externalDefinitions,
					],
				];

				let tableStatements = [];

				if (data.isUpdateScript) {
					const tableAlterStatement = getTableAlterStatements(
						...args,
						null,
						areColumnConstraintsAvailable,
						areForeignPrimaryKeyConstraintsAvailable
					)
					tableStatements = [...tableStatements, ...tableAlterStatement]
				} else {
					const tableStatement = getTableStatement(
						...args,
						null,
						areColumnConstraintsAvailable,
						areForeignPrimaryKeyConstraintsAvailable
					)
					tableStatements.push(tableStatement)
				}

				return result.concat([
					...tableStatements,
					getIndexes(...args),
				]);
			}, []);

			const foreignKeys = getForeignKeys(
				data,
				foreignKeyHashTable,
				areForeignPrimaryKeyConstraintsAvailable
			);

			callback(
				null,
				buildScript(needMinify)(
					databaseStatement,
					...entities,
					...viewsScripts,
					foreignKeys
				)
			);
		} catch (e) {
			logger.log(
				'error',
				{ message: e.message, stack: e.stack },
				'Hive Forward-Engineering Error'
			);

			setTimeout(() => {
				callback({ message: e.message, stack: e.stack });
			}, 150);
		}
	},

	async applyToInstance(connectionInfo, logger, cb, app) {
		logger.clear();
		logger.log('info', connectionInfo, 'connectionInfo', connectionInfo.hiddenKeys);
		try {
			await fetchRequestHelper.fetchApplyToInstance(connectionInfo)
			cb()
		} catch (err) {
			debugger
			cb({ message: err.message, stack: err.stack });
		}

	},

	async testConnection(connectionInfo, logger, cb) {
		try {
			logInfo('Test connection', connectionInfo, logger, logger);
			const clusterState = await deltaLakeHelper.requiredClusterState(connectionInfo, logInfo, logger);
			if (!clusterState.isRunning) {
				cb({ message: `Cluster is unavailable. Cluster status: ${clusterState.state}` })
			}
			cb()
		} catch (err) {
			logger.log(
				'error',
				{ message: err.message, stack: err.stack, error: err },
				'Test connection'
			);
			cb({ message: err.message, stack: err.stack });
		}
	}
};




const buildScript = (needMinify) => (...statements) => {
	const script = statements.filter((statement) => statement).join('\n\n');
	return script;
};

const parseEntities = (entities, serializedItems) => {
	return entities.reduce((result, entityId) => {
		try {
			return Object.assign({}, result, {
				[entityId]: JSON.parse(serializedItems[entityId]),
			});
		} catch (e) {
			return result;
		}
	}, {});
};

const getForeignKeys = (
	data,
	foreignKeyHashTable,
	areForeignPrimaryKeyConstraintsAvailable
) => {
	if (!areForeignPrimaryKeyConstraintsAvailable) {
		return null;
	}

	const dbName = replaceSpaceWithUnderscore(getName(getTab(0, data.containerData)));

	const foreignKeysStatements = data.entities
		.reduce((result, entityId) => {
			const foreignKeyStatement = foreignKeyHelper.getForeignKeyStatementsByHashItem(
				foreignKeyHashTable[entityId] || {}
			);

			if (foreignKeyStatement) {
				foreignKeyStatement;
				return [...result, foreignKeyStatement];
			}

			return result;
		}, [])
		.join('\n');

	return foreignKeysStatements ? `\nUSE ${dbName};${foreignKeysStatements}` : '';
};

const logInfo = (step, connectionInfo, logger) => {
	logger.clear();
	logger.log('info', logHelper.getSystemInfo(connectionInfo.appVersion), step);
	logger.log('info', connectionInfo, 'connectionInfo', connectionInfo.hiddenKeys);
};

const setAppDependencies = ({ lodash }) => _ = lodash;
