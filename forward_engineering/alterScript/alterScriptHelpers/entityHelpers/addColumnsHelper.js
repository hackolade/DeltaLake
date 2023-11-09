const {getColumns, getColumnsStatement} = require("../../../helpers/columnHelper");
const {getEntityProperties, generateFullEntityName, prepareName} = require("../../../utils/general");
const {getIndexes} = require("../../../helpers/indexHelper");
const {AlterScriptDto} = require("../../types/AlterScriptDto");
const {hydrateIndex} = require("./indexHelper");
const {generateModifyCollectionScript} = require("./modifyCollectionScript");

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
const getColumnsWithoutNotNullConstraint = (_) => (columns) => {
    const nameToJsonSchema = _.toPairs(columns)
        .map(([name, jsonSchema]) => {
            if (!jsonSchema?.constraints) {
                return [name, jsonSchema];
            }
            const newJsonSchema = {
                ...jsonSchema,
                constraints: {
                    ...jsonSchema.constraints,
                    notNull: undefined,
                }
            };
            return [name, newJsonSchema];
        });
    return _.fromPairs(nameToJsonSchema);
}

/**
 * @return {(collection: Object, columns: Columns) => Array<AlterScriptDto> }
 * */
const getAddNotNullConstraintScriptDtos = (_, ddlProvider) => (collection, columns) => {
    const fullTableName = generateFullEntityName(collection);

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
}

const getAddColumnsScriptsForModifyModifyCollectionScript = (_, provider) => (entity, definitions, modifyScript) => {
    const entityData = {...entity, ..._.omit(entity.role, ['properties'])};
    const {columns} = getColumns(entityData, true, definitions);

    // "NOT NULL" constraint is baked right into the "column statement". We are unsetting "not null" constraint
    // property on each column so that we could add these constraints in separate statements and not have it duplicated.
    const columnsWithoutNotNull = getColumnsWithoutNotNullConstraint(_)(columns);

    const properties = getEntityProperties(entity);
    const columnStatement = getColumnsStatement(columnsWithoutNotNull);
    const fullCollectionName = generateFullEntityName(entity);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(_)(entity, properties, definitions);
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(_)(...hydratedAddIndex);
    const addColumnScript = provider.addTableColumns({name: fullCollectionName, columns: columnStatement});

    const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
    const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
    const addColumnScriptDto = AlterScriptDto.getInstance([addColumnScript], true, false);
    const notNullConstraintScriptDtos = getAddNotNullConstraintScriptDtos(_, provider)(entity, columns);
    const modifyCollectionScriptDtos = AlterScriptDto.getInstances(modifyScript.script, true, false);

    return [
        dropIndexScriptDto,
        addColumnScriptDto,
        ...notNullConstraintScriptDtos,
        ...modifyCollectionScriptDtos,
        addIndexScriptDto
    ]
        .filter(Boolean);
}

const getAddColumnsScriptsForNewModifyCollectionScript = (_, provider) => (entity, definitions, modifyScript) => {
    const properties = getEntityProperties(entity);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(_)(entity, properties, definitions);
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(_)(...hydratedAddIndex);

    const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
    const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
    const modifyCollectionScriptDtos = AlterScriptDto.getInstances(modifyScript.script, true, false);

    return [
        dropIndexScriptDto,
        ...modifyCollectionScriptDtos,
        addIndexScriptDto
    ].filter(Boolean)
}

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getAddColumnsScripts = (app, definitions, provider, dbVersion) => (entity) => {
    const _ = app.require('lodash');

    const modifyScript = generateModifyCollectionScript(app)(entity, definitions, provider, dbVersion);
    if (modifyScript.type === 'new') {
        return getAddColumnsScriptsForNewModifyCollectionScript(_, provider)(entity, definitions, modifyScript);
    }
    return getAddColumnsScriptsForModifyModifyCollectionScript(_, provider)(entity, definitions, modifyScript);
};

module.exports = {
    getAddColumnsScripts,
}
