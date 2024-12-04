const _ = require('lodash');
const { getColumns, getColumnsStatement } = require('../../../helpers/columnHelper');
const {
	getEntityProperties,
	generateFullEntityName,
	prepareName,
	getDBVersionNumber,
} = require('../../../utils/general');
const { getIndexes } = require('../../../helpers/indexHelper');
const { AlterScriptDto } = require('../../types/AlterScriptDto');
const { hydrateIndex } = require('./indexHelper');
const { generateModifyCollectionScript } = require('./modifyCollectionScript');
const { Runtime } = require('../../../enums/runtime');
const { getColumnTagsStatement } = require('../../../helpers/unityTagsHelper');

/**
 * @typedef {{
 *     [name: string]: {
 *          constraints: Record<string, string | undefined> | undefined
 *     }
 * }} Columns
 * */

/**
 * @return {(columns: Columns) => Columns }
 * */
const getColumnsWithoutNotNullConstraint = _ => columns => {
	const nameToJsonSchema = _.toPairs(columns).map(([name, jsonSchema]) => {
		if (!jsonSchema?.constraints) {
			return [name, jsonSchema];
		}
		const newJsonSchema = {
			...jsonSchema,
			constraints: {
				...jsonSchema.constraints,
				notNull: undefined,
			},
		};
		return [name, newJsonSchema];
	});
	return _.fromPairs(nameToJsonSchema);
};

/**
 * @return {({ collection, columns, dbVersion }: { collection: Object, columns: Columns, dbVersion: string }) => Array<AlterScriptDto> }
 * */
const getAddNotNullConstraintScriptDtos =
	(_, ddlProvider) =>
	({ collection, columns, dbVersion }) => {
		const fullTableName = generateFullEntityName({ entity: collection, dbVersion });

		return _.toPairs(columns)
			.map(([name, jsonSchema]) => {
				const constraints = jsonSchema?.constraints || {};
				if (constraints.notNull) {
					return ddlProvider.setNotNullConstraint(fullTableName, prepareName(name));
				}
				return undefined;
			})
			.filter(Boolean)
			.map(script => AlterScriptDto.getInstance([script], true, false))
			.filter(Boolean);
	};

const getAddColumnsScriptsForModifyModifyCollectionScript =
	(_, provider) => (entity, definitions, modifyScript, dbVersion) => {
		const entityData = { ...entity, ..._.omit(entity.role, ['properties']) };
		const { columns } = getColumns(entityData, definitions, dbVersion);

		// "NOT NULL" constraint is baked right into the "column statement". We are unsetting "not null" constraint
		// property on each column so that we could add these constraints in separate statements and not have it duplicated.
		const columnsWithoutNotNull = getColumnsWithoutNotNullConstraint(_)(columns);

		const properties = getEntityProperties(entity);
		const columnStatement = getColumnsStatement(columnsWithoutNotNull, entity.role?.isActivated ?? true);
		const fullCollectionName = generateFullEntityName({ entity, dbVersion });
		const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex(_)({ entity, properties, definitions, dbVersion });
		const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
		const addIndexScript = getIndexes(_)(...hydratedAddIndex);
		const addColumnScript = provider.addTableColumns({ name: fullCollectionName, columns: columnStatement });

		const isUnityTagsSupported = getDBVersionNumber(dbVersion) >= Runtime.MINIMUM_UNITY_TAGS_SUPPORT_VERSION;
		const columnsUnityTagsScript = isUnityTagsSupported
			? getColumnTagsStatement(_, properties, fullCollectionName)
			: [];
		const addColumnScriptWithUnityTags = isUnityTagsSupported
			? [addColumnScript, ...columnsUnityTagsScript].join('\n')
			: addColumnScript;

		const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
		const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
		const addColumnScriptDto = AlterScriptDto.getInstance([addColumnScriptWithUnityTags], true, false);
		const notNullConstraintScriptDtos = getAddNotNullConstraintScriptDtos(
			_,
			provider,
		)({ collection: entity, columns, dbVersion });

		return [
			dropIndexScriptDto,
			addColumnScriptDto,
			...notNullConstraintScriptDtos,
			...(modifyScript.script || []),
			addIndexScriptDto,
		].filter(Boolean);
	};

const getAddColumnsScriptsForNewModifyCollectionScript =
	(_, provider) => (entity, definitions, modifyScript, dbVersion) => {
		const properties = getEntityProperties(entity);
		const { hydratedAddIndex, hydratedDropIndex } = hydrateIndex(_)({ entity, properties, definitions, dbVersion });
		const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
		const addIndexScript = getIndexes(_)(...hydratedAddIndex);
		const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
		const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);

		return [dropIndexScriptDto, ...(modifyScript.script || []), addIndexScriptDto].filter(Boolean);
	};

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getAddColumnsScripts = (app, definitions, provider, dbVersion) => entity => {
	const modifyScript = generateModifyCollectionScript(app)(entity, definitions, provider, dbVersion);
	if (modifyScript.type === 'new') {
		return getAddColumnsScriptsForNewModifyCollectionScript(_, provider)(
			entity,
			definitions,
			modifyScript,
			dbVersion,
		);
	}
	return getAddColumnsScriptsForModifyModifyCollectionScript(_, provider)(
		entity,
		definitions,
		modifyScript,
		dbVersion,
	);
};

module.exports = {
	getAddColumnsScripts,
};
