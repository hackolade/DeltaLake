'use strict';

const { setDependencies, dependencies } = require('./helpers/appDependencies');
const { getDatabaseStatement } = require('./helpers/databaseHelper');
const { getTableStatement } = require('./helpers/tableHelper');
const { getIndexes } = require('./helpers/indexHelper');
const { getViewScript } = require('./helpers/viewHelper');
const { prepareName, replaceSpaceWithUnderscore, getName, getTab } = require('./helpers/generalHelper');
const foreignKeyHelper = require('./helpers/foreignKeyHelper');
let _;
const sqlFormatter = require('sql-formatter');

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

			callback(
				null,
				buildScript(needMinify)(
					getDatabaseStatement(containerData),
					getTableStatement(
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
					),
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
				'Hive Forward-Engineering Error'
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
			const workloadManagementStatements = getWorkloadManagementStatements(data.modelData);
			const databaseStatement = getDatabaseStatement(containerData);
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
			const viewsScripts = data.views.map(viewId => {
				const viewSchema = JSON.parse(data.jsonSchema[viewId] || '{}');

				return getViewScript({
					schema: viewSchema,
					viewData: data.viewData[viewId],
					containerData: data.containerData,
					collectionRefsDefinitionsMap: data.collectionRefsDefinitionsMap,
					isKeyspaceActivated: true
				})
			});

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

				return result.concat([
					getTableStatement(
						...args,
						null,
						areColumnConstraintsAvailable,
						areForeignPrimaryKeyConstraintsAvailable
					),
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
					...workloadManagementStatements,
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
};

const buildScript = (needMinify) => (...statements) => {
	const script = statements.filter((statement) => statement).join('\n\n');
	if (needMinify) {
		return script;
	}

	return sqlFormatter.format(script, { indent: '    ' });
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

const setAppDependencies = ({ lodash }) => _ = lodash;

const getWorkloadManagementStatements = modelData => {
    const resourcePlansData = _.get(_.first(modelData), 'resourcePlans', []);

    return resourcePlansData
        .filter(resourcePlan => resourcePlan.name)
        .map(resourcePlan => {
            const resourcePlanOptionsString = _.isUndefined(resourcePlan.parallelism)
                ? ''
                : ` WITH QUERY_PARALLELISM = ${resourcePlan.parallelism}`;
            const resourcePlanStatement = `CREATE RESOURCE PLAN ${prepareName(
                resourcePlan.name
            )}${resourcePlanOptionsString};`;
            const pools = _.get(resourcePlan, 'pools', []).filter(pool => pool.name);
            const mappingNameToPoolNameHashTable = getMappingNameToPoolNameHashTable(pools);
            const mappings = pools.flatMap(pool => _.get(pool, 'mappings', []).filter(mapping => mapping.name));
            const triggers = _.get(resourcePlan, 'triggers', []).filter(trigger => trigger.name);
            const poolsStatements = pools
                .filter(pool => _.toUpper(pool.name) !== 'DEFAULT')
                .map(pool => {
                    let poolOptions = [];
                    if (!_.isUndefined(pool.allocFraction)) {
                        poolOptions.push(`ALLOC_FRACTION = ${pool.allocFraction}`);
                    }
                    if (!_.isUndefined(pool.parallelism)) {
                        poolOptions.push(`QUERY_PARALLELISM = ${pool.parallelism}`);
                    }
                    if (!_.isUndefined(pool.schedulingPolicy) && pool.schedulingPolicy !== 'default') {
                        poolOptions.push(`SCHEDULING_POLICY = '${pool.schedulingPolicy}'`);
                    }
                    const poolOptionsString = _.isEmpty(poolOptions) ? '' : ` WITH ${poolOptions.join(', ')}`;
                    return `CREATE POOL ${prepareName(resourcePlan.name)}.${prepareName(
                        pool.name
                    )}${poolOptionsString};`;
                });

            const mappingsStatements = mappings.map(mapping => {
                return `CREATE ${_.toUpper(mapping.mappingType || 'application')} MAPPING '${prepareName(
                    mapping.name
                )}' IN ${prepareName(resourcePlan.name)} TO ${prepareName(
                    mappingNameToPoolNameHashTable[mapping.name]
                )};`;
            });

            const triggersStatements = triggers.map(trigger => {
                return `CREATE TRIGGER ${prepareName(resourcePlan.name)}.${prepareName(trigger.name)} WHEN ${
                    trigger.condition
                } DO ${trigger.action};`;
            });

            return [resourcePlanStatement, ...poolsStatements, ...mappingsStatements, ...triggersStatements].join(
                '\n\n'
            );
        });
};

const getMappingNameToPoolNameHashTable = pools => {
	return _.fromPairs(_.flatten(pools.map(pool => {
		const mappings = _.get(pool, 'mappings', []).filter(mapping => mapping.name);

		return mappings.map(mapping => [mapping.name, pool.name]);
	})));
}