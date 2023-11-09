const {getColumns, getColumnsStatement} = require("../../../helpers/columnHelper");
const {getEntityProperties, generateFullEntityName} = require("../../../utils/general");
const {getIndexes} = require("../../../helpers/indexHelper");
const {AlterScriptDto} = require("../../types/AlterScriptDto");
const {hydrateIndex} = require("./indexHelper");
const {generateModifyCollectionScript} = require("./modifyCollectionScript");

/**
 * @return {(entity: Object) => Array<AlterScriptDto>}
 * */
const getAddColumnsScripts = (app, definitions, provider, dbVersion) => entity => {
    const _ = app.require('lodash');
    const entityData = {...entity, ..._.omit(entity.role, ['properties'])};
    const {columns} = getColumns(entityData, true, definitions);
    const properties = getEntityProperties(entity);
    const columnStatement = getColumnsStatement(columns);
    const fullCollectionName = generateFullEntityName(entity);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(_)(entity, properties, definitions);
    const modifyScript = generateModifyCollectionScript(app)(entity, definitions, provider, dbVersion);
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(_)(...hydratedAddIndex);
    const addColumnScript = provider.addTableColumns({name: fullCollectionName, columns: columnStatement});

    const dropIndexScriptDto = AlterScriptDto.getInstance([dropIndexScript], true, true);
    const addIndexScriptDto = AlterScriptDto.getInstance([addIndexScript], true, false);
    const addColumnScriptDto = AlterScriptDto.getInstance([addColumnScript], true, false);
    const modifyCollectionScriptDtos = AlterScriptDto.getInstances(modifyScript.script, true, false);

    if (modifyScript.type === 'new') {
        return [dropIndexScriptDto, ...modifyCollectionScriptDtos, addIndexScriptDto]
            .filter(Boolean)
    }

    return [dropIndexScriptDto, addColumnScriptDto, ...modifyCollectionScriptDtos, addIndexScriptDto]
        .filter(Boolean);
};

module.exports = {
    getAddColumnsScripts,
}
