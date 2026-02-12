const { getIndexes } = require('../indexHelper');
const { getTableStatement } = require('../tableHelper');
const { getCreateRelationshipScripts } = require('../relationshipHelper');
const { getUseCatalogStatement, getDatabaseStatement } = require('../databaseHelper');
const { isSupportUnityCatalog, isSupportNotNullConstraints, buildScript } = require('../../utils/general');

/**
 * @param data {CoreData}
 * @param app {App}
 * @return {(dto: EntityLevelFEScriptData) => string}
 * */
const buildEntityLevelFEScript =
	(data, app) =>
	({
		externalDefinitions,
		modelDefinitions,
		jsonSchema,
		internalDefinitions,
		containerData,
		entityData,
		modelData,
		relatedCollectionsJsonSchema,
	}) => {
		const dbVersion = data.modelData[0].dbVersion;
		const arePkFkConstraintsAvailable = isSupportUnityCatalog(dbVersion);
		const areNotNullConstraintsAvailable = isSupportNotNullConstraints(dbVersion);
		const useCatalogStatement = arePkFkConstraintsAvailable ? getUseCatalogStatement(containerData) : '';
		const databaseStatement = getDatabaseStatement(containerData, arePkFkConstraintsAvailable, dbVersion);
		const definitions = [modelDefinitions, internalDefinitions, externalDefinitions];
		const tableStatements = getTableStatement(app)(
			containerData,
			entityData,
			jsonSchema,
			definitions,
			arePkFkConstraintsAvailable,
			areNotNullConstraintsAvailable,
			null,
			dbVersion,
		);
		const indexScript = getIndexes(containerData, entityData, jsonSchema, definitions);

		let relationshipScripts = [];
		if (arePkFkConstraintsAvailable) {
			const entityId = jsonSchema.GUID;
			const relationshipsWithThisTableAsChild = modelData[1]?.relationships.filter(
				relationship => relationship.childCollection === entityId,
			);

			const parsedEntitiesById = data.relatedCollectionsJsonSchema?.reduce((result, schema) => {
				const data = JSON.parse(schema);
				result[data.GUID] = data;
				return result;
			}, {});

			relationshipScripts = getCreateRelationshipScripts(app)({
				relationships: relationshipsWithThisTableAsChild,
				jsonSchemas: parsedEntitiesById,
			});
		}

		return buildScript([
			useCatalogStatement,
			databaseStatement,
			tableStatements,
			...relationshipScripts,
			indexScript,
		]);
	};

module.exports = {
	buildEntityLevelFEScript,
};
