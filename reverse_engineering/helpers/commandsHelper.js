const findEntityIndex = (entities, bucket, name) => {
    const entityIndex = entities.findIndex(entity => (
        isEqualCaseInsensitive(entity.bucketName, bucket) &&
        isEqualCaseInsensitive(entity.collectionName, name)
    ));

    if (entityIndex !== -1) {
        return entityIndex;
    }

    return entities.findIndex(entity => entity.collectionName === name);
};

const findViewIndex = (entities, bucket, name) => {
    return entities.findIndex(
        (entity) => isEqualCaseInsensitive(entity.bucketName, bucket) && isEqualCaseInsensitive(entity.name, name)
    );
};

const getCaseInsensitiveKey = (object, key) => {
    if (object[key]) {
        return key;
    }

    return Object.keys(object).find(objectKey => isEqualCaseInsensitive(objectKey, key));
};

const omitCaseInsensitive = (object, key) => {
    const objectCopy = { ...object };
    delete objectCopy[getCaseInsensitiveKey(object,key)];

    return objectCopy;
};

const isEqualCaseInsensitive = (str1, str2) => (str1 || '').toLowerCase() === (str2 || '').toLowerCase();

const remove = (items, index) => [...items.slice(0, index), ...items.slice(index + 1)];

const set = (items, index, value) => [...items.slice(0, index), value, ...items.slice(index + 1)];
  
const merge = (target, source) => {
    if (!isObject(target) || !isObject(source)) {
        return source || target;
    }

    return Object.keys(source).reduce((merged, key) => {
        const value = isObject(source[key]) ? merge(merged[key] || {}, source[key]) : source[key];

        return {
            ...merged,
            [key]: value
        };
    }, target);
};

const getCurrentBucket = (entitiesData, statementData) => statementData.bucketName || entitiesData.currentBucket;

const isObject = item => item && typeof item === 'object' && !Array.isArray(item);

module.exports = {
    findEntityIndex,
    getCaseInsensitiveKey,
    omitCaseInsensitive,
    isEqualCaseInsensitive,
    remove,
    set,
    merge,
    getCurrentBucket,
    findViewIndex,
}