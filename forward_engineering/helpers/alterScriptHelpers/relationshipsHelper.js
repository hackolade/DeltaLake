const {generateFullEntityName} = require("./generalHelper");


/**
 * @param modifiedEntities {Object[]}
 * @param id {string}
 * @return {Object | undefined}
 * */
const getEntityById = (modifiedEntities, id) => {
    return modifiedEntities.find(entity => entity.role?.id === id);
}

/**
 * @param entity {Object}
 * @return {string[]}
 * */
const getEntityColumns = (entity) => {
    return Object.keys(entity?.role?.properties || {});
}

/**
 * @return {(schema: Object[], deletedRelationships: Array<Object>) => Array<string>}
 * */
const getDeleteForeignKeyScripts = (ddlProvider, _) => (modifiedEntities, deletedRelationships) => {
    return deletedRelationships
        .map(relationship => {
            const childTableId = relationship.role?.childCollection;
            const childEntity = getEntityById(modifiedEntities, childTableId);
            if (!childEntity) {
                return '';
            }
            const childEntityName = generateFullEntityName(childEntity);
            const childEntityColumns = getEntityColumns(childEntity);
            return ddlProvider.dropFkConstraint(childEntityName, childEntityColumns);
        })
        .filter(Boolean);
}

module.exports = {
    getDeleteForeignKeyScripts,
}
