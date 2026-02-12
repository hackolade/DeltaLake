const { getIndexes } = require('../indexHelper');
const { getTableStatement } = require('../tableHelper');
const { getCreateRelationshipScripts, getCreateInlineRelationshipScripts } = require('../relationshipHelper');
const { getUseCatalogStatement, getDatabaseStatement } = require('../databaseHelper');
const { isSupportUnityCatalog, isSupportNotNullConstraints, buildScript } = require('../../utils/general');

const getForeignKeyStatements = ({ app, data, arePkFkConstraintsAvailable, jsonSchema, modelData }) => {
	const relationshipsWithThisTableAsChild = modelData[1]?.relationships.filter(
		relationship => relationship.childCollection === jsonSchema.GUID,
	);

	let inlineForeignKeyStatements = '';
	if (arePkFkConstraintsAvailable && relationshipsWithThisTableAsChild?.length) {
		const ddlProvider = require('../../ddlProvider/ddlProvider')(app);

		const parsedEntitiesById = data.relatedCollectionsJsonSchema?.reduce((result, schema) => {
			const data = JSON.parse(schema);
			result[data.GUID] = data;
			return result;
		}, {});

		const inlineRelationshipScripts = getCreateInlineRelationshipScripts(ddlProvider)({
			relationships: relationshipsWithThisTableAsChild,
			jsonSchemas: parsedEntitiesById,
		});

		inlineForeignKeyStatements = inlineRelationshipScripts.join(',\n\t');
	}

	return inlineForeignKeyStatements;
};

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
		const foreignKeyStatements = getForeignKeyStatements({
			app,
			data,
			arePkFkConstraintsAvailable,
			jsonSchema,
			modelData,
		});

		const tableStatements = getTableStatement(app)(
			containerData,
			entityData,
			jsonSchema,
			definitions,
			arePkFkConstraintsAvailable,
			areNotNullConstraintsAvailable,
			null,
			dbVersion,
			false,
			foreignKeyStatements,
		);
		const indexScript = getIndexes(containerData, entityData, jsonSchema, definitions);

		return buildScript([useCatalogStatement, databaseStatement, tableStatements, indexScript]);
	};

module.exports = {
	buildEntityLevelFEScript,
};
