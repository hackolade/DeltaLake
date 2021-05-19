const { dependencies } = require('./appDependencies');
const {
    set,
    findEntityIndex,
    getCaseInsensitiveKey,
    omitCaseInsensitive,
    isEqualCaseInsensitive,
    remove,
    findViewIndex,
    merge,
} = require('./helpers/commandsHelper');

const CREATE_COLLECTION_COMMAND = 'createCollection';
const REMOVE_COLLECTION_COMMAND = 'removeCollection';
const RENAME_COLLECTION_COMMAND = 'renameCollection';
const CREATE_BUCKET_COMMAND = 'createBucket';
const REMOVE_BUCKET_COMMAND = 'removeBucket';
const USE_BUCKET_COMMAND = 'useBucket';
const ADD_FIELDS_TO_COLLECTION_COMMAND = 'addFieldsToCollection';
const ADD_COLLECTION_LEVEL_INDEX_COMMAND = 'addCollectionLevelIndex';
const UPDATE_FIELD_COMMAND = 'updateField';
const CREATE_VIEW_COMMAND = 'createView';
const REMOVE_VIEW_COMMAND = 'removeView';
const REMOVE_COLLECTION_LEVEL_INDEX_COMMAND = 'removeCollectionLevelIndex';
const ADD_RELATIONSHIP_COMMAND = 'addRelationship';
const UPDATE_ENTITY_COLUMN = 'updateColumn';
const CREATE_RESOURCE_PLAN = 'createResourcePlan';
const ADD_TO_RESOURCE_PLAN = 'addToResourcePlan';
const CREATE_MAPPING = 'createMapping';
const UPDATE_VIEW_LEVEL_DATA_COMMAND = 'updateViewLevelData';
const RENAME_VIEW_COMMAND = 'renameView';
const UPDATE_RESOURCE_PLAN = 'updateResourcePlan';
const DROP_RESOURCE_PLAN = 'dropResourcePlan';
const UPDATE_ITEM_IN_RESOURCE_PLAN = 'updateItemInResourcePlan';
const DROP_RESOURCE_PLAN_ITEM = 'dropResourcePlanItem';
const DROP_MAPPING = 'removeMapping';
const UPDATE_ENTITY_LEVEL_DATA_COMMAND = 'updateCollectionProperties';

const DEFAULT_BUCKET = 'New database';

const convertCommandsToEntities = (commands, originalScript) => {
    return commands.reduce(
        (entitiesData, statementData) => {
            const command = statementData && statementData.type;

            if (!command) {
                return entitiesData;
            }

            const bucket = statementData.bucketName || entitiesData.currentBucket;

            if (dependencies.lodash.keys(COMMANDS_ACTION_MAP).includes(command)) {
                return COMMANDS_ACTION_MAP[command](entitiesData, bucket, statementData, originalScript);
            }

            return entitiesData;
        },
        {
            entities: [],
            views: [],
            currentBucket: DEFAULT_BUCKET,
            buckets: {},
            relationships: [],
            modelProperties: {},
        }
    );
};

const convertCommandsToReDocs = (commands, originalScript) => {
    const reData = convertCommandsToEntities(commands, originalScript);

    const result = reData.entities.map((entity) => {
        const relatedViews = reData.views.filter((view) => view.collectionName === entity.collectionName);
        return {
            objectNames: {
                collectionName: entity.collectionName,
            },
            doc: {
                dbName: entity.bucketName,
                collectionName: entity.collectionName,
                bucketInfo: reData.buckets[entity.bucketName] || {},
                entityLevel: entity.entityLevelData,
                views: relatedViews,
            },
            jsonSchema: entity.schema,
        };
    });

    return { result, info: reData.modelProperties, relationships: reData.relationships };
};

const createCollection = (entitiesData, bucket, statementData) => {
    const { entities, currentBucket } = entitiesData;
    const updatedEntityData = getTableMergedWithReferencedTable(entities, statementData);

    if (!updatedEntityData.bucketName) {
        return { ...entitiesData, entities: [...entities, { ...updatedEntityData, bucketName: bucket }] };
    }

    if (currentBucket === DEFAULT_BUCKET) {
        return {
            ...entitiesData,
            entities: [...entities, updatedEntityData],
            bucketName: updatedEntityData.bucketName,
        };
    } else {
        return { ...entitiesData, entities: [...entities, updatedEntityData] };
    }
};

const removeCollection = (entitiesData, bucket, statementData) => {
    const { entities } = entitiesData;
    const index = findEntityIndex(entities, bucket, statementData.collectionName);
    if (index === -1) {
        return entitiesData;
    }

    return { ...entitiesData, entities: remove(entities, index) };
};

const createBucket = (entitiesData, bucket, statementData) => {
    const { buckets } = entitiesData;
    const bucketName = statementData.name;
    return {
        ...entitiesData,
        currentBucket: bucketName,
        buckets: { ...buckets, [bucketName]: statementData.data || {} },
    };
};

const removeBucket = (entitiesData, bucket, statementData) => {
    const { buckets, entities } = entitiesData;
    const bucketName = statementData.name;

    return {
        currentBucket: DEFAULT_BUCKET,
        buckets: omitCaseInsensitive(buckets, bucketName),
        entities: entities.filter((entity) => !isEqualCaseInsensitive(entity.bucketName, bucketName)),
    };
};

const useBucket = (entitiesData, bucket, statementData) => {
    return {
        ...entitiesData,
        currentBucket: statementData.bucketName,
    };
};

const addFieldsToCollection = (entitiesData, bucket, statementData) => {
    const { entities } = entitiesData;
    const index = findEntityIndex(entities, bucket, statementData.collectionName);
    if (index === -1) {
        return entitiesData;
    }

    const entity = entities[index];
    return {
        ...entitiesData,
        entities: [
            ...entities.slice(0, index),
            {
                ...entity,
                schema: {
                    ...entity.schema,
                    properties: {
                        ...entity.schema.properties,
                        ...statementData.data,
                    },
                },
            },
            ...entities.slice(index + 1),
        ],
    };
};

const updateField = (entitiesData, bucket, statementData) => {
    const { entities } = entitiesData;

    const index = findEntityIndex(entities, bucket, statementData.collectionName);
    if (index === -1) {
        return entitiesData;
    }

    const entity = entities[index];
    const field = dependencies.lodash.get(entity, 'schema.properties' , {})[statementData.name];
    if(!field) {
        return entitiesData; 
    }

    const updatedField = {
        ...field,
        ...statementData.data
    }

    return {
        ...entitiesData,
        entities: [
            ...entities.slice(0, index),
            {
                ...entity,
                schema: {
                    ...entity.schema,
                    properties: {
                        ...omitCaseInsensitive(entity.schema.properties, statementData.name),
                        [statementData.nameTo]: updatedField,
                    },
                },
            },
            ...entities.slice(index + 1),
        ],
    };
};

const createView = (entitiesData, bucket, statementData, originalScript) => {
    const { views } = entitiesData;
    const selectStatement = `AS ${originalScript.substring(statementData.select.start, statementData.select.stop)}`;

    return {
        ...entitiesData,
        views: [
            ...views,
            {
                ...statementData,
                data: {
                    ...statementData.data,
                    selectStatement,
                },
                bucketName: statementData.bucketName || bucket,
            },
        ],
    };
};

const getTableMergedWithReferencedTable = (entities, statementData) => {
    if (!statementData.tableLikeName) {
        return statementData;
    }

    const referencedTable = entities.find((entity) => entity.collectionName === statementData.tableLikeName);

    if (!referencedTable) {
        return statementData;
    }

    return {
        ...referencedTable,
        collectionName: statementData.collectionName,
        bucketName: statementData.bucketName,
        entityLevelData: {
            ...referencedTable.entityLevelData,
            ...statementData.entityLevelData,
        },
    };
};

const addIndexToCollection = (entitiesData, bucket, statementData) => {
    const { entities } = entitiesData;
    const entityIndex = findEntityIndex(entities, bucket, statementData.collectionName);
    if (entityIndex === -1) {
        return entitiesData;
    }

    const entity = entities[entityIndex];
    const entityLevelData = entity.entityLevelData || {};
    const indexes = [
        ...(entityLevelData.SecIndxs || []),
        {
            name: statementData.name,
            SecIndxKey: statementData.columns,
            ...statementData.data,
        },
    ];

    return {
        ...entitiesData,
        entities: set(entities, entityIndex, {
            ...entity,
            entityLevelData: {
                ...entityLevelData,
                SecIndxs: indexes,
            },
        }),
    };
};

const removeIndexFromCollection = (entitiesData, bucket, statementData) => {
    const { entities } = entitiesData;
    const entityIndex = findEntityIndex(entities, bucket, statementData.collectionName);
    if (entityIndex === -1) {
        return entitiesData;
    }

    const entity = entities[entityIndex];
    const entityLevelData = entity.entityLevelData || {};
    const indexes = (entityLevelData.SecIndxs || []).filter((index) => index.name !== statementData.indexName);

    return {
        ...entitiesData,
        entities: set(entities, entityIndex, {
            ...entity,
            entityLevelData: {
                ...entityLevelData,
                SecIndxs: indexes,
            },
        }),
    };
};

const updateColumn = (entitiesData, bucket, statementData) => {
    const { entities } = entitiesData;
    const entityIndex = findEntityIndex(entities, bucket, statementData.collectionName);
    if (entityIndex === -1) {
        return entitiesData;
    }

    const entity = entities[entityIndex];

    return {
        ...entitiesData,
        entities: set(entities, entityIndex, {
            ...entity,
            schema: {
                ...entity.schema,
                properties: updateProperties(entity.schema.properties, statementData.data),
            },
        }),
    };
};

const addRelationship = (entitiesData, bucket, statementData) => {
    const { relationships } = entitiesData;

    return {
        ...entitiesData,
        relationships: relationships.concat({
            childCollection: statementData.childCollection,
            parentCollection: statementData.parentCollection,
            childField: statementData.childField,
            parentField: statementData.parentField,
            relationshipType: 'Foreign Key',
            childCardinality: '1',
            parentCardinality: '1',
            relationshipName: statementData.relationshipName,
            childDbName: statementData.childDbName || bucket,
            dbName: statementData.dbName || bucket,
        }),
    };
};

const updateProperties = (properties, statementData) => {
    const _ = dependencies.lodash;

    return _.fromPairs(
        _.keys(properties).map((columnName) => {
            if (!statementData.fields.includes(columnName)) {
                return [columnName, properties[columnName]];
            }

            return [
                columnName,
                {
                    ...properties[columnName],
                    [statementData.type]: statementData.value,
                },
            ];
        })
    );
};

const createResourcePlan = (entitiesData, bucket, statementData) => {
    const { modelProperties } = entitiesData;

    if (statementData.like) {
        const originalPlan = (modelProperties.resourcePlans || []).find(({ name }) => name === statementData.like);

        if (!originalPlan) {
            return entitiesData;
        }

        return {
            ...entitiesData,
            modelProperties: {
                ...modelProperties,
                resourcePlans: [
                    ...(modelProperties.resourcePlans || []),
                    {
                        ...originalPlan,
                        name: statementData.name,
                    },
                ],
            },
        };
    }

    return {
        ...entitiesData,
        modelProperties: {
            ...modelProperties,
            resourcePlans: [
                ...(modelProperties.resourcePlans || []),
                {
                    name: statementData.name,
                    parallelism: statementData.parallelism,
                },
            ],
        },
    };
};

const addToResourcePlan = (entitiesData, bucket, statementData) => {
    const { modelProperties } = entitiesData;
    const identifier = statementData.identifier;

    const resourcePlans = modelProperties.resourcePlans || [];
    const resourcePlanIndex = getResourcePlanIndex(resourcePlans, statementData.resourceName);
    if (resourcePlanIndex === -1) {
        return entitiesData;
    }

    const updatedResourcePlan = {
        ...resourcePlans[resourcePlanIndex],
        [identifier + 's']: dependencies.lodash.get(resourcePlans, `${resourcePlanIndex}.${identifier + 's'}`, []).concat(
            statementData[identifier]
        ),
    };

    return {
        ...entitiesData,
        modelProperties: {
            ...modelProperties,
            resourcePlans: set(resourcePlans, resourcePlanIndex, updatedResourcePlan),
        },
    };
};

const addMapping = (entitiesData, bucket, statementData) => {
    const { modelProperties } = entitiesData;

    const resourcePlans = modelProperties.resourcePlans || [];
    const resourceIndex = getResourcePlanIndex(resourcePlans, statementData.resourceName);
    if (resourceIndex < 0) {
        return entitiesData;
    }

    const planPools = resourcePlans[resourceIndex].pools || [];
    const poolIndex = dependencies.lodash.findIndex(planPools, ({ name }) => name === statementData.poolName);
    if (poolIndex < 0) {
        return entitiesData;
    }

    const updatedPool = addMappingToPoolByIndex(planPools, poolIndex, statementData.mapping);
    const updatedResourcePlans = set(resourcePlans, resourceIndex, {
        ...resourcePlans[resourceIndex],
        pools: set(planPools, poolIndex, updatedPool),
    });

    return {
        ...entitiesData,
        modelProperties: {
            ...modelProperties,
            resourcePlans: updatedResourcePlans,
        },
    };
};

const removeView = (entitiesData, bucket, statementData) => {
    const { views } = entitiesData;
    const index = findViewIndex(views, bucket, statementData.viewName);
    if (index === -1) {
        return entitiesData;
    }

    return { ...entitiesData, views: remove(views, index) };
};

const updateViewLevelData = (entitiesData, bucket, statementData, originalScript) => {
    const { views } = entitiesData;
    const index = findViewIndex(views, bucket, statementData.viewName);
    if (index === -1) {
        return entitiesData;
    }

    const view = views[index];

    const newData = statementData.data || {};

    if (statementData.select) {
        newData.selectStatement = `AS ${originalScript.substring(
            statementData.select.start,
            statementData.select.stop
        )}`;
    }

    return {
        ...entitiesData,
        views: set(views, index, {
            ...view,
            data: merge(view.data, newData),
        }),
    };
};

const renameView = (entitiesData, bucket, statementData) => {
    const { views } = entitiesData;
    const index = findViewIndex(views, bucket, statementData.viewName);
    if (index === -1) {
        return entitiesData;
    }

    const view = views[index];

    return {
        ...entitiesData,
        views: set(views, index, {
            ...view,
            name: statementData.newViewName,
        }),
    };
};

const renameCollection = (entitiesData, bucket, statementData) => {
    const { entities } = entitiesData;
    const index = findEntityIndex(entities, bucket, statementData.collectionName);
    if (index === -1) {
        return entitiesData;
    }

    const entity = entities[index];

    return {
        ...entitiesData,
        entities: set(entities, index, {
            ...entity,
            name: statementData.newCollectionName,
        }),
    };
};

const updateResourcePlan = (entitiesData, bucket, statementData) => {
    const { modelProperties } = entitiesData;

    const resourcePlans = modelProperties.resourcePlans || [];
    const resourcePlanIndex = getResourcePlanIndex(resourcePlans, statementData.resourceName);
    if (resourcePlanIndex === -1) {
        return entitiesData;
    }

    const newData = { ...statementData.data, name: statementData.renameTo || statementData.resourceName };
    const updatedResourcePlan = merge(resourcePlans[resourcePlanIndex], newData);

    return {
        ...entitiesData,
        modelProperties: {
            ...modelProperties,
            resourcePlans: set(resourcePlans, resourcePlanIndex, updatedResourcePlan),
        },
    };
};

const dropResourcePlan = (entitiesData, bucket, statementData) => {
    const { modelProperties } = entitiesData;

    const resourcePlans = modelProperties.resourcePlans || [];
    const resourcePlanIndex = getResourcePlanIndex(resourcePlans, statementData.resourceName);
    if (resourcePlanIndex === -1) {
        return entitiesData;
    }

    return {
        ...entitiesData,
        modelProperties: {
            ...modelProperties,
            resourcePlans: remove(resourcePlans, resourcePlanIndex),
        },
    };
};

const updateResourcePlanItem = (entitiesData, bucket, statementData) => {
    const { modelProperties } = entitiesData;
    const identifier = statementData.identifier;

    const resourcePlans = modelProperties.resourcePlans || [];
    const { resourcePlanIndex, itemIndex } = getResourcePlanAndItemIndexes(resourcePlans, statementData, identifier);
    if (resourcePlanIndex === -1 || itemIndex === -1) {
        return entitiesData;
    }

    const updatedItems = set(
        resourcePlans[resourcePlanIndex][identifier + 's'],
        itemIndex,
        merge(resourcePlans[resourcePlanIndex][identifier + 's'][itemIndex], statementData.data)
    );
    const updatedResourcePlan = {
        ...resourcePlans[resourcePlanIndex],
        [identifier + 's']: updatedItems,
    };

    return {
        ...entitiesData,
        modelProperties: {
            ...modelProperties,
            resourcePlans: set(resourcePlans, resourcePlanIndex, updatedResourcePlan),
        },
    };
};

const removeItemFromResourcePlan = (entitiesData, bucket, statementData) => {
    const { modelProperties } = entitiesData;
    const identifier = statementData.identifier;

    const resourcePlans = modelProperties.resourcePlans || [];
    const { resourcePlanIndex, itemIndex } = getResourcePlanAndItemIndexes(resourcePlans, statementData, identifier);
    if (resourcePlanIndex === -1 || itemIndex === -1) {
        return entitiesData;
    }

    const updatedItems = remove(resourcePlans[resourcePlanIndex][identifier + 's'], itemIndex);
    const updatedResourcePlan = {
        ...resourcePlans[resourcePlanIndex],
        [identifier + 's']: updatedItems,
    };

    return {
        ...entitiesData,
        modelProperties: {
            ...modelProperties,
            resourcePlans: set(resourcePlans, resourcePlanIndex, updatedResourcePlan),
        },
    };
};

const removeMapping = (entitiesData, bucket, statementData) => {
    const { modelProperties } = entitiesData;

    const resourcePlans = modelProperties.resourcePlans || [];
    const resourceIndex = getResourcePlanIndex(resourcePlans, statementData.resourceName);
    if (resourceIndex < 0) {
        return entitiesData;
    }

    const planPools = resourcePlans[resourceIndex].pools || [];
    const poolIndex = dependencies.lodash.findIndex(planPools, ({ mappings }) =>
        (mappings || []).find(({ name }) => name === statementData.name)
    );
    if (poolIndex < 0) {
        return entitiesData;
    }

    const updatedPool = removeMappingFromPool(planPools, poolIndex, statementData.name);
    const updatedResourcePlans = set(resourcePlans, resourceIndex, {
        ...resourcePlans[resourceIndex],
        pools: set(planPools, poolIndex, updatedPool),
    });

    return {
        ...entitiesData,
        modelProperties: {
            ...modelProperties,
            resourcePlans: updatedResourcePlans,
        },
    };
};

const updateEntityLevelData = (entitiesData, bucket, statementData) => {
    const { entities } = entitiesData;
    const index = findEntityIndex(entities, bucket, statementData.collectionName);
    if (index === -1) {
        return entitiesData;
    }

    const entity = entities[index];

    return {
        ...entitiesData,
        entities: set(entities, index, {
            ...entity,
            entityLevelData: merge(entity.entityLevelData, statementData.data)
        })
    };
}

const getResourcePlanIndex = (resourcePlans, resourceName) => {
    return dependencies.lodash.findIndex(resourcePlans, (plan) => plan.name === resourceName);
};

const addMappingToPoolByIndex = (pools, poolIndex, mapping) => {
    return { ...pools[poolIndex], mappings: dependencies.lodash.get(pools[poolIndex], 'mappings', []).concat(mapping) };
};

const removeMappingFromPool = (pools, poolIndex, mappingName) => {
    return { ...pools[poolIndex], mappings: pools[poolIndex].mappings.filter(({ name }) => name !== mappingName) };
};

const getResourcePlanAndItemIndexes = (resourcePlans, statementData, identifier) => {
    const _ = dependencies.lodash;
    const resourcePlanIndex = getResourcePlanIndex(resourcePlans, statementData.resourceName);
    const items = _.get(resourcePlans, `${resourcePlanIndex}.${identifier + 's'}`, []);
    const itemIndex = _.findIndex(items, ({ name }) => name === statementData[identifier]);

    return { resourcePlanIndex, itemIndex };
};

const COMMANDS_ACTION_MAP = {
    [CREATE_COLLECTION_COMMAND]: createCollection,
    [REMOVE_COLLECTION_COMMAND]: removeCollection,
    [CREATE_BUCKET_COMMAND]: createBucket,
    [REMOVE_BUCKET_COMMAND]: removeBucket,
    [USE_BUCKET_COMMAND]: useBucket,
    [ADD_FIELDS_TO_COLLECTION_COMMAND]: addFieldsToCollection,
    [ADD_COLLECTION_LEVEL_INDEX_COMMAND]: addIndexToCollection,
    [UPDATE_FIELD_COMMAND]: updateField,
    [CREATE_VIEW_COMMAND]: createView,
    [REMOVE_VIEW_COMMAND]: removeView,
    [REMOVE_COLLECTION_LEVEL_INDEX_COMMAND]: removeIndexFromCollection,
    [ADD_RELATIONSHIP_COMMAND]: addRelationship,
    [UPDATE_ENTITY_COLUMN]: updateColumn,
    [CREATE_RESOURCE_PLAN]: createResourcePlan,
    [ADD_TO_RESOURCE_PLAN]: addToResourcePlan,
    [CREATE_MAPPING]: addMapping,
    [UPDATE_VIEW_LEVEL_DATA_COMMAND]: updateViewLevelData,
    [RENAME_VIEW_COMMAND]: renameView,
    [UPDATE_RESOURCE_PLAN]: updateResourcePlan,
    [DROP_RESOURCE_PLAN]: dropResourcePlan,
    [UPDATE_ITEM_IN_RESOURCE_PLAN]: updateResourcePlanItem,
    [DROP_RESOURCE_PLAN_ITEM]: removeItemFromResourcePlan,
    [DROP_MAPPING]: removeMapping,
    [RENAME_COLLECTION_COMMAND]: renameCollection,
    [UPDATE_ENTITY_LEVEL_DATA_COMMAND]: updateEntityLevelData,
};

module.exports = {
    convertCommandsToReDocs,
    CREATE_COLLECTION_COMMAND,
    REMOVE_COLLECTION_COMMAND,
    CREATE_BUCKET_COMMAND,
    REMOVE_BUCKET_COMMAND,
    USE_BUCKET_COMMAND,
    ADD_FIELDS_TO_COLLECTION_COMMAND,
    UPDATE_FIELD_COMMAND,
    CREATE_VIEW_COMMAND,
    ADD_COLLECTION_LEVEL_INDEX_COMMAND,
    REMOVE_COLLECTION_LEVEL_INDEX_COMMAND,
    ADD_RELATIONSHIP_COMMAND,
    UPDATE_ENTITY_COLUMN,
    CREATE_RESOURCE_PLAN,
    ADD_TO_RESOURCE_PLAN,
    CREATE_MAPPING,
    REMOVE_VIEW_COMMAND,
    RENAME_VIEW_COMMAND,
    UPDATE_VIEW_LEVEL_DATA_COMMAND,
    UPDATE_RESOURCE_PLAN,
    UPDATE_ITEM_IN_RESOURCE_PLAN,
    DROP_RESOURCE_PLAN_ITEM,
    DROP_MAPPING,
    RENAME_COLLECTION_COMMAND,
    UPDATE_ENTITY_LEVEL_DATA_COMMAND,
};
