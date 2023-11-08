const {generateFullEntityName, getEntityNameFromCollection, prepareName} = require("../../../utils/general");

/**
 * @typedef {import('../types/AlterScriptDto').AlterScriptDto} AlterScriptDto
 * */

/**
 * @return {(collection: Object, guid: string) => Object | undefined}
 * */
const getPropertyNameByGuid = (_) => (collection, guid) => {
    const propertyInArray = _.toPairs(collection?.role?.properties)
        .filter(([name, jsonSchema]) => jsonSchema.GUID === guid)
        .map(([name]) => name);
    if (!propertyInArray.length) {
        return undefined;
    }
    return propertyInArray[0];
}

/**
 * @return {(collection: Object, guids: string[]) => Array<Object>}
 * */
const getPropertiesNamesByGuids = (_) => (collection, guids) => {
    return guids
        .map(guid => getPropertyNameByGuid(_)(collection, guid))
        .filter(Boolean);
}


/**
 * @return {(collection: Object) => boolean}
 * */
const didCompositePkChange = (_) => (collection) => {
    const pkDto = collection?.role?.compMod?.primaryKey || {};
    const newPrimaryKeys = pkDto.new || [];
    const oldPrimaryKeys = pkDto.old || [];
    if (newPrimaryKeys.length !== oldPrimaryKeys.length) {
        return true;
    }
    if (newPrimaryKeys.length === 0 && oldPrimaryKeys.length === 0) {
        return false;
    }
    const areKeyArraysEqual = _(oldPrimaryKeys).differenceWith(newPrimaryKeys, _.isEqual).isEmpty();
    return !areKeyArraysEqual;
}

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getAddCompositePkScripts = (_, ddlProvider) => (collection) => {
    const didPkChange = didCompositePkChange(_)(collection);
    if (!didPkChange) {
        return []
    }
    const fullTableName = generateFullEntityName(collection);
    const constraintName = getEntityNameFromCollection(collection) + '_pk';
    const pkDto = collection?.role?.compMod?.primaryKey || {};
    const newPrimaryKeys = pkDto.new || [];

    return newPrimaryKeys
        .map(newPk => {
            const compositePrimaryKey = newPk.compositePrimaryKey || [];
            const guidsOfColumnsInPk = compositePrimaryKey.map(compositePkEntry => compositePkEntry.keyId);
            const columnNamesForDDL = getPropertiesNamesByGuids(_)(collection, guidsOfColumnsInPk);
            if (!columnNamesForDDL.length) {
                return undefined;
            }
            return ddlProvider.addPkConstraint(fullTableName, constraintName, columnNamesForDDL);
        })
        .filter(Boolean)
        .map(scriptLine => ({
            scripts: [{
                isDropScript: false,
                script: scriptLine,
            }]
        }));
}

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getDropCompositePkScripts = (_, ddlProvider) => (collection) => {
    const didPkChange = didCompositePkChange(_)(collection);
    if (!didPkChange) {
        return []
    }
    const fullTableName = generateFullEntityName(collection);
    const pkDto = collection?.role?.compMod?.primaryKey || {};
    const oldPrimaryKeys = pkDto.old || [];
    return oldPrimaryKeys
        .map(oldPk => ddlProvider.dropPkConstraint(fullTableName))
        .map(scriptLine => ({
            scripts: [{
                isDropScript: true,
                script: scriptLine,
            }]
        }));
}

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getModifyCompositePkScripts = (_, ddlProvider) => (collection) => {
    const dropCompositePkScripts = getDropCompositePkScripts(_, ddlProvider)(collection);
    const addCompositePkScripts = getAddCompositePkScripts(_, ddlProvider)(collection);

    return [
        ...dropCompositePkScripts,
        ...addCompositePkScripts,
    ];
}

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getAddPkScripts = (_, ddlProvider) => (collection) => {
    const fullTableName = generateFullEntityName(collection);
    const constraintName = getEntityNameFromCollection(collection) + '_pk';

    return _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const isRegularPrimaryKey = jsonSchema.primaryKey && !jsonSchema.compositePrimaryKey;
            const oldName = jsonSchema.compMod.oldField.name;
            const wasTheFieldAPrimaryKey = Boolean(collection.role.properties[oldName]?.primaryKey);
            return isRegularPrimaryKey && !wasTheFieldAPrimaryKey;
        })
        .map(([name, jsonSchema]) => {
            const nameForDDl = prepareName(name);
            const columnNamesForDDL = [nameForDDl];
            return ddlProvider.addPkConstraint(fullTableName, constraintName, columnNamesForDDL);
        })
        .map(scriptLine => ({
            scripts: [{
                isDropScript: false,
                script: scriptLine,
            }]
        }));
}

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getDropPkScripts = (_, ddlProvider) => (collection) => {
    const fullTableName = generateFullEntityName(collection);

    return _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const oldJsonSchema = collection.role.properties[oldName];
            const wasTheFieldARegularPrimaryKey = oldJsonSchema?.primaryKey && !oldJsonSchema?.compositePrimaryKey;

            const isNotAPrimaryKey = !jsonSchema.primaryKey && !jsonSchema.compositePrimaryKey;
            return wasTheFieldARegularPrimaryKey && isNotAPrimaryKey;
        })
        .map(([name, jsonSchema]) => {
            return ddlProvider.dropPkConstraint(fullTableName);
        })
        .map(scriptLine => ({
            scripts: [{
                isDropScript: true,
                script: scriptLine,
            }]
        }));
}

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getModifyPkScripts = (_, ddlProvider) => (collection) => {
    const dropPkScripts = getDropPkScripts(_, ddlProvider)(collection);
    const addPkScripts = getAddPkScripts(_, ddlProvider)(collection);

    return [
        ...dropPkScripts,
        ...addPkScripts,
    ];
}

/**
 * @return {(collection: Object) => Array<AlterScriptDto>}
 * */
const getModifyPkConstraintsScripts = (_, ddlProvider) => (collection) => {
    const modifyCompositePkScripts = getModifyCompositePkScripts(_, ddlProvider)(collection);
    const modifyPkScripts = getModifyPkScripts(_, ddlProvider)(collection);

    return [
        ...modifyCompositePkScripts,
        ...modifyPkScripts,
    ]
}

module.exports = {
    getModifyPkConstraintsScripts,
}
