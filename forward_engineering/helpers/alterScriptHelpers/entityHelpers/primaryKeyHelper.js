const {generateFullEntityName, getEntityNameFromCollection} = require("../generalHelper");
const {prepareName} = require("../../generalHelper");

/**
 * @return {(collection: Object, guid: string) => Object | undefined}
 * */
const getPropertyByGuid = (_) => (collection, guid) => {
    const propertyInArray = _.toPairs(collection?.role?.properties)
        .filter(([name, jsonSchema]) => jsonSchema.GUID === guid)
        .map(([name, jsonSchema]) => jsonSchema);
    if (!propertyInArray.length) {
        return undefined;
    }
    return propertyInArray[0];
}

/**
 * @return {(collection: Object, guids: string[]) => Array<Object>}
 * */
const getPropertiesByGuids = (_) => (collection, guids) => {
    return guids
        .map(guid => getPropertyByGuid(_)(collection, guid))
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
 * @return {(collection: Object) => Array<string>}
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
            const columnsInPk = getPropertiesByGuids(_)(collection, guidsOfColumnsInPk);
            const columnNamesForDDL = columnsInPk.map(column => prepareName(column.compMod.newField.name));
            if (!columnNamesForDDL.length) {
                return undefined;
            }
            return ddlProvider.addPkConstraint(fullTableName, constraintName, columnNamesForDDL);
        })
        .filter(Boolean);
}

/**
 * @return {(collection: Object) => Array<string>}
 * */
const getDropCompositePkScripts = (_, ddlProvider) => (collection) => {
    const didPkChange = didCompositePkChange(_)(collection);
    if (!didPkChange) {
        return []
    }
    const fullTableName = generateFullEntityName(collection);
    const pkDto = collection?.role?.compMod?.primaryKey || {};
    const oldPrimaryKeys = pkDto.old || [];
    return oldPrimaryKeys.map(oldPk => ddlProvider.dropPkConstraint(fullTableName));
}

/**
 * @return {(collection: Object) => Array<string>}
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
 * @return {(collection: Object) => Array<string>}
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
        });
}

/**
 * @return {(collection: Object) => Array<string>}
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
        });
}

/**
 * @return {(collection: Object) => Array<string>}
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
 * @return {(collection: Object) => Array<string>}
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
