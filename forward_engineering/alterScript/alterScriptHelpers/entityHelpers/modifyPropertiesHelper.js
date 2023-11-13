const {DiffMap} = require("../../types/DiffMap");
const {getTablePropertiesClause} = require("../../../helpers/tableHelper");
const {AlterScriptDto} = require("../../types/AlterScriptDto");
const {generateFullEntityName} = require("../../../utils/general");

/**
 * @param tableProperties {Object}
 * @return {DiffMap}
 * */
const buildTablePropertiesDiffMap = (tableProperties) => {
    const diffMap = new DiffMap();
    const newProperties = tableProperties.new || [];
    const oldProperties = tableProperties.old || [];

    for (const newProp of newProperties) {
        if (!newProp.propertyKey) {
            continue;
        }
        const correspondingOldProp = oldProperties.find(p => p.propertyKey === newProp.propertyKey);
        if (!correspondingOldProp) {
            diffMap.appendAdded(newProp);
        } else {
            diffMap.appendModified(newProp, correspondingOldProp);
        }
    }

    for (const oldProp of oldProperties) {
        if (!oldProp.propertyKey) {
            continue;
        }
        const correspondingNewProp = newProperties.find(p => p.propertyKey === oldProp.propertyKey);
        if (!correspondingNewProp) {
            diffMap.appendDeleted(oldProp);
        }
        // All modified items are appended in the loop above
    }

    return diffMap;
}

const getAddTablePropertyScriptDto = (_, ddlProvider) => (properties, fullCollectionName) => {
    const addPropertiesDdlString = getTablePropertiesClause(_)(properties);
    const ddlConfig = {
        name: fullCollectionName,
        properties: addPropertiesDdlString,
    }
    const script = ddlProvider.setTableProperties(ddlConfig);
    return AlterScriptDto.getInstance([script], true, false);
}

const getDeleteTablePropertyScriptDto = (_, ddlProvider) => (properties, fullCollectionName) => {
    const propertiesWithNoValues = properties
        .map(prop => ({
            ...prop,
            propertyValue: undefined
        }));
    const dropPropertiesDdlString = getTablePropertiesClause(_)(propertiesWithNoValues);
    const ddlConfig = {
        name: fullCollectionName,
        properties: dropPropertiesDdlString,
    }
    const script = ddlProvider.unsetTableProperties(ddlConfig);
    return AlterScriptDto.getInstance([script], true, true);
}

const getModifiedTablePropertiesScriptDtos = (_, ddlProvider) => (collection) => {
    const compMod = _.get(collection, 'role.compMod', {});
    const tableProperties = compMod.tableProperties || {};
    const fullCollectionName = generateFullEntityName(collection);
    const propertiesDiffMap = buildTablePropertiesDiffMap(tableProperties);

    const addedPropertiesScriptDto = getAddTablePropertyScriptDto(_, ddlProvider)(propertiesDiffMap.added, fullCollectionName);
    const deletedPropertiesScriptDto = getDeleteTablePropertyScriptDto(_, ddlProvider)(propertiesDiffMap.deleted, fullCollectionName);

    const modifiedPropertiesScriptDtos = propertiesDiffMap.modified
        .map(({ newItem, }) => {
            return getAddTablePropertyScriptDto(_, ddlProvider)([newItem], fullCollectionName);
        });

    return [
        addedPropertiesScriptDto,
        deletedPropertiesScriptDto,
        ...modifiedPropertiesScriptDtos,
    ]
        .filter(Boolean);
}

module.exports = {
    getModifiedTablePropertiesScriptDtos
}
