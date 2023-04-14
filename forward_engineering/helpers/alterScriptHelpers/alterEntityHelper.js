const {dependencies} = require('../appDependencies');
const {getColumns, getColumnsStatement, getColumnsString, getColumnStatement} = require('../columnHelper');
const {getIndexes} = require('../indexHelper');
const {getTableStatement} = require('../tableHelper');
const {hydrateTableProperties, getDifferentItems, getIsChangeProperties} = require('./common');
const {
    getFullEntityName,
    generateFullEntityName,
    getEntityProperties,
    getContainerName,
    getEntityData,
    getEntityName,
    prepareScript
} = require('./generalHelper');
const {wrapInSingleQuotes, prepareName, wrapInTicks} = require("../generalHelper");
const {EntitiesThatSupportComments} = require("./enums/entityType");

let _;
const setDependencies = ({lodash}) => _ = lodash;

const tableProperties = ['compositeClusteringKey', 'compositePartitionKey', 'isActivated', 'location', 'numBuckets', 'skewedby', 'skewedOn', 'skewStoredAsDir', 'sortedByKey', 'storedAsTable', 'temporaryTable', 'using', 'rowFormat', 'fieldsTerminatedBy', 'fieldsescapedBy', 'collectionItemsTerminatedBy', 'mapKeysTerminatedBy', 'linesTerminatedBy', 'nullDefinedAs', 'inputFormatClassname', 'outputFormatClassname'];
const otherTableProperties = ['code', 'collectionName', 'tableProperties', 'description', 'properties', 'serDeLibrary', 'serDeProperties'];

const hydrateSerDeProperties = (compMod, name) => {
    const {serDeProperties, serDeLibrary} = compMod
    return {
        properties: !_.isEqual(serDeProperties?.new, serDeProperties?.old) && serDeProperties?.new,
        serDe: !_.isEqual(serDeLibrary?.new, serDeLibrary?.old) && serDeLibrary?.new,
        name
    };
}

const hydrateAlterTableName = compMod => {
    const {newName, oldName} = getEntityName(compMod);
    if (!newName && !oldName || (newName === oldName)) {
        return {};
    }
    return {
        oldName: getFullEntityName(getContainerName(compMod), oldName),
        newName: getFullEntityName(getContainerName(compMod), newName),
    };
};

const hydrateAlterColumnName = (entity, properties = {}) => {
    const collectionName = generateFullEntityName(entity);
    const columns = Object.values(properties).map(property => {
        const compMod = _.get(property, 'compMod', {});
        const {newField = {}, oldField = {}} = compMod;
        return newField.name && oldField.name && newField.name !== oldField.name
            ? {oldName: oldField.name, newName: newField.name}
            : '';
    });
    return {collectionName, columns: columns.filter(Boolean)};
}

const hydrateAlterColumnType = (properties = {}) => {
    const isChangedType = (newField, oldField) => newField.type && oldField.type && (newField.type !== oldField.type || newField.mode !== oldField.mode);
    const columns = Object.values(properties).map(property => {
        const compMod = _.get(property, 'compMod', {});
        const {newField = {}, oldField = {}} = compMod;
        return isChangedType(oldField, newField) ||
        (
            newField.items &&
            oldField.items &&
            newField.items.some((field, index) => isChangedType(field, oldField.items[index]))
        ) ||
        (
            newField.properties &&
            oldField.properties &&
            Object.keys(newField.properties).some(key => isChangedType(newField.properties[key], oldField.properties[key]))
        )
            ? {oldName: oldField.name, newName: newField.name}
            : '';
    });
    const columnsToDelete = columns.map(column => column.oldName).filter(name => Boolean(name));
    const columnsToAdd = columns.map(column => column.newName).filter(name => Boolean(name));
    return {columnsToDelete, columnsToAdd};
}

const hydrateDropIndexes = entity => {
    const bloomIndex = _.get(entity, 'BloomIndxs', []);
    return bloomIndex.length ? generateFullEntityName(entity) : '';
};

const hydrateAddIndexes = (entity, BloomIndxs, properties, definitions) => {
    const compMod = _.get(entity, 'role.compMod', {});
    const entityData = _.get(entity, 'role', {});
    const containerData = {name: getContainerName(compMod)};
    return [[containerData], [entityData, {}, {BloomIndxs}], {...entityData, properties}, definitions];
};

const hydrateIndex = (entity, properties, definitions) => {
    const bloomIndex = _.get(entity, 'role.compMod.BloomIndxs', {});
    const {drop, add} = getDifferentItems(bloomIndex.new, bloomIndex.old);
    return {
        hydratedDropIndex: hydrateDropIndexes({...entity, BloomIndxs: drop}),
        hydratedAddIndex: hydrateAddIndexes(entity, add, properties, definitions),
    };
}

const hydrateCollection = (entity, definitions) => {
    const compMod = _.get(entity, 'role.compMod', {});
    const entityData = _.get(entity, 'role', {});
    const properties = getEntityProperties(entity);
    const containerData = {name: getContainerName(compMod)};
    return [[containerData], [entityData], {...entityData, properties}, definitions];
};

const getUpdatedCommentOnCollectionScript = (collection, ddlProvider) => {
    const descriptionInfo = collection?.role.compMod?.description;
    if (!descriptionInfo) {
        return '';
    }

    const {old: oldComment, new: newComment} = descriptionInfo;
    if (!newComment || newComment === oldComment) {
        return '';
    }

    const scriptGenerationConfig = {
        entityType: EntitiesThatSupportComments.TABLE,
        entityName: generateFullEntityName(collection),
        comment: wrapInSingleQuotes(newComment),
    }
    return ddlProvider.updateComment(scriptGenerationConfig);
}

const getDeletedCommentOnCollectionScript = (collection, ddlProvider) => {
    const descriptionInfo = collection?.role.compMod?.description;
    if (!descriptionInfo) {
        return '';
    }

    const {old: oldComment, new: newComment} = descriptionInfo;
    if (!oldComment || newComment) {
        return '';
    }

    const scriptGenerationConfig = {
        entityType: EntitiesThatSupportComments.TABLE,
        entityName: generateFullEntityName(collection),
    }
    return ddlProvider.dropComment(scriptGenerationConfig);
}

const generateModifyCollectionScript = (collection, definitions, ddlProvider) => {
    const compMod = _.get(collection, 'role.compMod', {});
    const isChangedProperties = getIsChangeProperties(compMod, tableProperties);
    const fullCollectionName = generateFullEntityName(collection);
    if (isChangedProperties) {
        const roleData = getEntityData(compMod, tableProperties.concat(otherTableProperties));
        const hydratedCollection = hydrateCollection({
            ...collection,
            role: {...collection.role, ...roleData}
        }, definitions);
        const addCollectionScript = getTableStatement(...hydratedCollection, true);
        const deleteCollectionScript = ddlProvider.dropTable(fullCollectionName);
        return {type: 'new', script: prepareScript(deleteCollectionScript, addCollectionScript)};
    }

    const dataProperties = _.get(compMod, 'tableProperties', '');
    const alterTableNameScript = ddlProvider.alterTableName(hydrateAlterTableName(compMod));
    const hydratedTableProperties = hydrateTableProperties(dataProperties, fullCollectionName);
    const hydratedSerDeProperties = hydrateSerDeProperties(compMod, fullCollectionName);
    const tablePropertiesScript = ddlProvider.alterTableProperties(hydratedTableProperties);
    const serDeProperties = ddlProvider.alterSerDeProperties(hydratedSerDeProperties)
    return {
        type: 'modify',
        script: prepareScript(
            alterTableNameScript,
            ...tablePropertiesScript,
            serDeProperties
        )
    };
}

const getAddCollectionsScripts = definitions => entity => {
    setDependencies(dependencies);
    const properties = getEntityProperties(entity);
    const indexes = _.get(entity, 'role.BloomIndxs', [])
    const hydratedCollection = hydrateCollection(entity, definitions);
    const collectionScript = getTableStatement(...hydratedCollection, true);
    const indexScript = getIndexes(...hydrateAddIndexes(entity, indexes, properties, definitions));

    return prepareScript(collectionScript, indexScript);
};

const getDeleteCollectionsScripts = provider => entity => {
    setDependencies(dependencies);
    const entityData = {...entity, ..._.get(entity, 'role', {})};
    const fullCollectionName = generateFullEntityName(entity)
    const collectionScript = provider.dropTable(fullCollectionName);
    const indexScript = provider.dropTableIndex(hydrateDropIndexes(entityData));

    return prepareScript(indexScript, collectionScript);
};

const getModifyCollectionsScripts = (definitions, ddlProvider) => collection => {
    setDependencies(dependencies);
    const properties = getEntityProperties(collection);
    const {script} = generateModifyCollectionScript(collection, definitions, ddlProvider);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(collection, properties, definitions);
    const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);

    return prepareScript(dropIndexScript, ...script, addIndexScript);
};

/**
 * @return {(x: Object) => Array<string>}
 * */
const getModifyCollectionCommentsScripts = (ddlProvider) => collection => {
    setDependencies(dependencies);
    const updatedCommentScript = getUpdatedCommentOnCollectionScript(collection, ddlProvider);
    const deletedCommentScript = getDeletedCommentOnCollectionScript(collection, ddlProvider);

    return prepareScript(
        updatedCommentScript,
        deletedCommentScript
    );
};

const getAddColumnsScripts = (definitions, provider) => entity => {
    setDependencies(dependencies);
    const entityData = {...entity, ..._.omit(entity.role, ['properties'])};
    const {columns} = getColumns(entityData, true, definitions);
    const properties = getEntityProperties(entity);
    const columnStatement = getColumnsStatement(columns);
    const fullCollectionName = generateFullEntityName(entity);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(entity, properties, definitions);
    const modifyScript = generateModifyCollectionScript(entity, definitions, provider);
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);
    const addColumnScript = provider.addTableColumns({name: fullCollectionName, columns: columnStatement});

    return modifyScript.type === 'new' ?
        prepareScript(dropIndexScript, ...modifyScript.script, addIndexScript) :
        prepareScript(dropIndexScript, addColumnScript, ...modifyScript.script, addIndexScript);
};

const getDeleteColumnsScripts = (definitions, provider) => entity => {
    setDependencies(dependencies);
    const entityData = {
        ...entity,
        ..._.omit(entity.role, ['properties']),
        properties: _.pickBy(entity.properties || {}, column => !column.compMod)
    };
    const {columns} = getColumns(entityData, true, definitions);
    const properties = getEntityProperties(entity);
    const columnStatement = getColumnsString(Object.keys(columns));
    const fullCollectionName = generateFullEntityName(entity);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(entity, properties, definitions);
    const modifyScript = generateModifyCollectionScript(entity, definitions, provider);
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);
    const deleteColumnScript = provider.dropTableColumns({name: fullCollectionName, columns: columnStatement});

    return modifyScript.type === 'new' ?
        prepareScript(dropIndexScript, ...modifyScript.script, addIndexScript) :
        prepareScript(dropIndexScript, deleteColumnScript, ...modifyScript.script, addIndexScript);
};

const getDeleteColumnScripsForOlderRuntime = (definitions, provider) => entity => {
    setDependencies(dependencies);
    const deleteColumnsName = _.filter(Object.keys(entity.properties || {}), name => !entity.properties[name].compMod);
    const properties = _.omit(_.get(entity, 'role.properties', {}), deleteColumnsName);
    const entityData = {role: {..._.omit(entity.role, ['properties']), properties}};
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(entity, properties, definitions);
    const fullCollectionName = generateFullEntityName(entity)
    const dropIndexScript = provider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);
    const deleteCollectionScript = provider.dropTable(fullCollectionName);
    const hydratedCollection = hydrateCollection(entityData, definitions);
    const addCollectionScript = getTableStatement(...hydratedCollection, true);

    return prepareScript(dropIndexScript, deleteCollectionScript, addCollectionScript, addIndexScript);
};

const getUpdatedCommentOnColumnScripts = (_) => (collection, ddlProvider) => {
    return _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const newComment = jsonSchema.description;
            const oldName = jsonSchema.compMod.oldField.name;
            const oldComment = collection.role.properties[oldName]?.description;
            return newComment && (!oldComment || newComment !== oldComment);
        })
        .map(([name, jsonSchema]) => {
            const newComment = jsonSchema.description;
            const scriptGenerationConfig = {
                fullTableName: generateFullEntityName(collection),
                columnName: prepareName(name),
                comment: wrapInSingleQuotes(newComment),
            }
            return ddlProvider.updateCommentOnColumn(scriptGenerationConfig);
        });
}

const getDeletedCommentOnColumnScripts = (_) => (collection, ddlProvider) => {
    return _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const newComment = jsonSchema.description;
            const oldName = jsonSchema.compMod.oldField.name;
            const oldComment = collection.role.properties[oldName]?.description;
            return oldComment && !newComment;
        })
        .map(([name, jsonSchema]) => {
            const scriptGenerationConfig = {
                fullTableName: generateFullEntityName(collection),
                columnName: prepareName(name),
            }
            return ddlProvider.dropCommentOnColumn(scriptGenerationConfig);
        });
}

const getModifiedCommentOnColumnScripts = (_) => (collection, ddlProvider) => {
    const updatedCommentScripts = getUpdatedCommentOnColumnScripts(_)(collection, ddlProvider);
    const deletedCommentScripts = getDeletedCommentOnColumnScripts(_)(collection, ddlProvider);
    return [...updatedCommentScripts, ...deletedCommentScripts];
}

const getModifyNonNullColumnsScripts = (_) => (collection, ddlProvider) => {
    const fullTableName = generateFullEntityName(collection);

    const currentRequiredColumnNames = collection.required || [];
    const previousRequiredColumnNames = collection.role.required || [];

    const columnNamesToAddNotNullConstraint = _.difference(currentRequiredColumnNames, previousRequiredColumnNames);
    const columnNamesToRemoveNotNullConstraint = _.difference(previousRequiredColumnNames, currentRequiredColumnNames);

    const addNotNullConstraintsScript = _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const shouldRemoveForOldName = columnNamesToRemoveNotNullConstraint.includes(oldName);
            const shouldAddForNewName = columnNamesToAddNotNullConstraint.includes(name);
            return shouldAddForNewName && !shouldRemoveForOldName;
        })
        .map(([columnName]) => ddlProvider.setNotNullConstraint(fullTableName, prepareName(columnName)));
    const removeNotNullConstraint = _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const shouldRemoveForOldName = columnNamesToRemoveNotNullConstraint.includes(oldName);
            const shouldAddForNewName = columnNamesToAddNotNullConstraint.includes(name);
            return shouldRemoveForOldName && !shouldAddForNewName;
        })
        .map(([name]) => ddlProvider.dropNotNullConstraint(fullTableName, prepareName(name)));

    return [...addNotNullConstraintsScript, ...removeNotNullConstraint];
}

/**
 * @param columnName {string}
 * @return string
 * */
const getCheckConstraintNameForDdlProvider = (columnName) => {
    const columnNameNoTicks = columnName.replaceAll('`', '');
    const constraintName = `${columnNameNoTicks}_constraint`;
    return wrapInTicks(constraintName);
}

const getModifyCheckConstraintsScripts = (_) => (collection, ddlProvider) => {
    const fullTableName = generateFullEntityName(collection);

    const addCheckConstraintsScripts = _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const currentCheckConstraintOnColumn = jsonSchema.check;
            const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
            return currentCheckConstraintOnColumn && !previousCheckConstraintOnColumn;
        })
        .map(([columnName, jsonSchema]) => {
            const constraintName = getCheckConstraintNameForDdlProvider(columnName);
            return ddlProvider.setCheckConstraint(fullTableName, constraintName, jsonSchema.check);
        });

    const modifyCheckConstraintsScripts = _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const currentCheckConstraintOnColumn = jsonSchema.check;
            const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
            return currentCheckConstraintOnColumn && previousCheckConstraintOnColumn
                && currentCheckConstraintOnColumn !== previousCheckConstraintOnColumn;
        })
        .map(([columnName, jsonSchema]) => {
            const oldColumnName = jsonSchema.compMod.oldField.name;
            const oldConstraintName = getCheckConstraintNameForDdlProvider(oldColumnName);
            const dropOldConstraint = ddlProvider.dropCheckConstraint(fullTableName, oldConstraintName);

            const newConstraintName = getCheckConstraintNameForDdlProvider(columnName);
            const createNewConstraint = ddlProvider.setCheckConstraint(fullTableName, newConstraintName, jsonSchema.check);

            return [dropOldConstraint, createNewConstraint];
        })
        .flat();

    const removeCheckConstraintScripts = _.toPairs(collection.properties)
        .filter(([name, jsonSchema]) => {
            const oldName = jsonSchema.compMod.oldField.name;
            const currentCheckConstraintOnColumn = jsonSchema.check;
            const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
            return previousCheckConstraintOnColumn && !currentCheckConstraintOnColumn;
        })
        .map(([name]) => {
            const constraintName = getCheckConstraintNameForDdlProvider(name);
            return ddlProvider.dropCheckConstraint(fullTableName, constraintName);
        });

    return [...addCheckConstraintsScripts, ...modifyCheckConstraintsScripts, ...removeCheckConstraintScripts];
}

const getModifyColumnsScripts = (definitions, ddlProvider) => collection => {
    setDependencies(dependencies);
    const properties = _.get(collection, 'properties', {});
    const unionProperties = _.unionWith(
        Object.entries(properties),
        Object.entries(_.get(collection, 'role.properties', {})),
        (firstProperty, secondProperty) => _.isEqual(_.get(firstProperty, '[1].GUID'), _.get(secondProperty, '[1].GUID'))
    );
    const entityData = {
        role: {
            ..._.omit(collection.role || {}, ['properties']),
            properties: Object.fromEntries(unionProperties)
        }
    };
    const hydratedAlterColumnName = hydrateAlterColumnName(collection, properties);
    const alterColumnScripts = ddlProvider.alterTableColumnName(hydratedAlterColumnName);
    const modifiedScript = generateModifyCollectionScript(entityData, definitions, ddlProvider);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(collection, properties, definitions);
    const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);

    const fullCollectionName = generateFullEntityName(collection);
    const modifiedCommentOnColumnsScripts = getModifiedCommentOnColumnScripts(_)(collection, ddlProvider);
    const modifyNotNullConstraintsScripts = getModifyNonNullColumnsScripts(_)(collection, ddlProvider);
    const modifyCheckConstraintsScripts = getModifyCheckConstraintsScripts(_)(collection, ddlProvider);
    const {columnsToDelete, columnsToAdd} = hydrateAlterColumnType(properties);
    const {columns: columnsInfo} = getColumns(entityData.role, true, definitions);
    const deleteColumnScripts = _.map(columnsToDelete, column => ddlProvider.dropTableColumn({
        name: fullCollectionName,
        column
    }));
    const addColumnScripts = _.map(columnsToAdd, column =>
        ddlProvider.addTableColumn({
            name: fullCollectionName,
            column: getColumnStatement({name: column, ...columnsInfo[column]})
        }));
    const modifyPaired = _.flatten(_.zip(deleteColumnScripts, addColumnScripts));
    return modifiedScript.type === 'new' ?
        prepareScript(dropIndexScript, ...modifiedScript.script, addIndexScript) :
        prepareScript(
            dropIndexScript,
            ...modifyPaired,
            ...alterColumnScripts,
            ...modifiedCommentOnColumnsScripts,
            ...modifyNotNullConstraintsScripts,
            ...modifyCheckConstraintsScripts,
            ...modifiedScript.script,
            addIndexScript
        );
};

const getModifyColumnsScriptsForOlderRuntime = (definitions, ddlProvider) => collection => {
    setDependencies(dependencies);
    const properties = _.get(collection, 'properties', {});
    const unionProperties = _.unionWith(
        Object.entries(properties),
        Object.entries(_.get(collection, 'role.properties', {})),
        (firstProperty, secondProperty) => _.isEqual(_.get(firstProperty, '[1].GUID'), _.get(secondProperty, '[1].GUID'))
    );
    const entityData = {
        role: {
            ..._.omit(collection.role || {}, ['properties']),
            properties: Object.fromEntries(unionProperties)
        }
    };
    const hydratedAlterColumnName = hydrateAlterColumnName(collection, properties);
    const alterColumnScripts = ddlProvider.alterTableColumnName(hydratedAlterColumnName);
    const modifiedScript = generateModifyCollectionScript(entityData, definitions, ddlProvider);
    const {hydratedAddIndex, hydratedDropIndex} = hydrateIndex(collection, properties, definitions);
    const dropIndexScript = ddlProvider.dropTableIndex(hydratedDropIndex);
    const addIndexScript = getIndexes(...hydratedAddIndex);

    const {columnsToDelete} = hydrateAlterColumnType(properties);
    const modifiedCommentOnColumnsScripts = getModifiedCommentOnColumnScripts(_)(collection, ddlProvider);
    const modifyNotNullConstraintsScripts = getModifyNonNullColumnsScripts(_)(collection, ddlProvider);
    const modifyCheckConstraintsScripts = getModifyCheckConstraintsScripts(_)(collection, ddlProvider);
    let tableModificationScripts = [];
    if (!_.isEmpty(columnsToDelete)) {
        const fullCollectionName = generateFullEntityName(collection);
        const deleteCollectionScript = ddlProvider.dropTable(fullCollectionName);
        const hydratedCollection = hydrateCollection(entityData, definitions);
        const addCollectionScript = getTableStatement(...hydratedCollection, true);
        tableModificationScripts = [deleteCollectionScript, addCollectionScript];
    }

    return modifiedScript.type === 'new' ?
        prepareScript(dropIndexScript, ...modifiedScript.script, addIndexScript) :
        prepareScript(
            dropIndexScript,
            ...tableModificationScripts,
            ...alterColumnScripts,
            ...modifiedCommentOnColumnsScripts,
            ...modifyNotNullConstraintsScripts,
            ...modifyCheckConstraintsScripts,
            ...modifiedScript.script,
            addIndexScript
        );
}

module.exports = {
    getAddCollectionsScripts,
    getDeleteCollectionsScripts,
    getModifyCollectionsScripts,
    getModifyCollectionCommentsScripts,
    getAddColumnsScripts,
    getDeleteColumnsScripts,
    getDeleteColumnScripsForOlderRuntime,
    getModifyColumnsScriptsForOlderRuntime,
    getModifyColumnsScripts
}
