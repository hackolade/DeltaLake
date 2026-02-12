const { getIndexes } = require('../indexHelper');
const { getTableStatement } = require('../tableHelper');
const { getUseCatalogStatement, getDatabaseStatement } = require('../databaseHelper');
const { isSupportUnityCatalog, isSupportNotNullConstraints, buildScript } = require('../../utils/general');
const foreignKeyHelper = require('../foreignKeyHelper');

const getForeignKeyStatements = ({
	app,
	jsonSchema,
	entityData,
	modelDefinitions,
	internalDefinitions,
	externalDefinitions,
	relatedCollectionsJsonSchema = [],
	relationships = [],
}) => {
	if (!relationships.length || !relatedCollectionsJsonSchema.length) {
		return null;
	}

	const parsedEntitiesById = relatedCollectionsJsonSchema.reduce((result, schema) => {
		const data = JSON.parse(schema);
		result[data.GUID] = data;
		return result;
	}, {});

	const foreignKeyHashTable = foreignKeyHelper.getForeignKeyHashTable({
		relationships,
		entities: Object.keys(parsedEntitiesById),
		entityData: {
			[jsonSchema.GUID]: entityData,
		},
		jsonSchemas: parsedEntitiesById,
		modelDefinitions,
		internalDefinitions,
		otherDefinitions: [modelDefinitions, externalDefinitions],
		isContainerActivated: true,
		relatedSchemas: {},
	});

	return foreignKeyHashTable[jsonSchema.GUID]
		? foreignKeyHelper.getForeignKeyStatementsByHashItem(app, foreignKeyHashTable[jsonSchema.GUID])
		: null;
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
			jsonSchema,
			entityData,
			modelDefinitions,
			internalDefinitions,
			externalDefinitions,
			relatedCollectionsJsonSchema: data.relatedCollectionsJsonSchema,
			relationships: data.modelData.find(modelData => 'relationships' in modelData)?.relationships,
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
