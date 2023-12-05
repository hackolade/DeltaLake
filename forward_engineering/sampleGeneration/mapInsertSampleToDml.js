const {wrapInSingleQuotes} = require("../utils/general");

/**
 * @typedef {
 *     (column: Object, sample: any) => string
 * } InsertSampleMapper
 * */

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapStringToDml = (column, sample) => {
    return wrapInSingleQuotes(sample);
}

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapNumberToDml = (column, sample) => {
    return Number(sample);
}

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapBooleanToDml = (column, sample) => {
    return Boolean(sample);
}

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapSqlCodeToDml = (column, sample) => {
    return (sample || '').toString();
}

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapTimestampToDml = (column, sample = '') => {
    if (sample.toUpperCase().includes('TIMESTAMP')) {
        return mapSqlCodeToDml(column, sample);
    }
    if (sample.startsWith("'") && sample.endsWith("'")) {
        return sample;
    }
    return mapStringToDml(column, sample);
}

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapDateToDml = (column, sample = '') => {
    if (sample.toUpperCase().includes('DATE')) {
        return mapSqlCodeToDml(column, sample);
    }
    if (sample.startsWith("'") && sample.endsWith("'")) {
        return sample;
    }
    return mapStringToDml(column, sample);
}

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapJsonObjectToDml = (column, sample) => {
    const stringified = JSON.stringify(sample);
    return wrapInSingleQuotes(stringified);
}

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapJsonArrayToDml = (column, sample) => {
    const stringified = JSON.stringify(sample);
    return wrapInSingleQuotes(stringified);
}


/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapMapToDml = (column, sample = {}) => {
    const keyType = column.keyType || 'text';
    /**
     * @type {InsertSampleMapper}
     * */
    const keyMapper = typeToMapperMap.get(keyType) || (() => {});

    const mapKeyValuePairs = [];
    const properties = column.properties || {};
    for (const propertyName of Object.keys(sample)) {
        const propertyJsonSchema = properties[propertyName] || {};
        const propertyType = propertyJsonSchema.type || 'text';
        /**
         * @type {InsertSampleMapper}
         * */
        const valueMapper = typeToMapperMap.get(propertyType) || (() => {});

        if (mapKeyValuePairs.length !== 0) {
            mapKeyValuePairs.push(', ');
        }

        const dmlKey = keyMapper(column, propertyName);
        const dmlValue = valueMapper(propertyJsonSchema, sample[propertyName]);
        mapKeyValuePairs.push(dmlKey);
        mapKeyValuePairs.push(', ');
        mapKeyValuePairs.push(dmlValue);
    }

    mapKeyValuePairs.unshift('MAP(');
    mapKeyValuePairs.push(')');
    return mapKeyValuePairs.join('');
}

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapArrayToDml = (column, sample = []) => {
    const arrayElements = [];
    let items = column.items || [];
    if (!Array.isArray(items)) {
        items = [items];
    }

    for (let i = 0; i < Math.min(items.length, sample.length); i++) {
        const value = sample[i];
        const valueJsonSchema = items[i];
        const valueType = valueJsonSchema.type || 'text';

        /**
         * @type {InsertSampleMapper}
         * */
        const valueMapper = typeToMapperMap.get(valueType) || (() => {});
        const dmlValue = valueMapper(valueJsonSchema, value);

        if (arrayElements.length !== 0) {
            arrayElements.push(', ');
        }
        arrayElements.push(dmlValue);
    }
    arrayElements.unshift('ARRAY(');
    arrayElements.push(')');
    return arrayElements.join('');
}

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapStructToDml = (column, sample = {}) => {
    /**
     * @type {InsertSampleMapper}
     * */
    const keyMapper = typeToMapperMap.get('text') || (() => {});

    const structKeyValuePairs = [];
    const properties = column.properties || {};
    for (const propertyName of Object.keys(sample || {})) {
        const propertyJsonSchema = properties[propertyName] || {};
        const propertyType = propertyJsonSchema.type || 'text';
        /**
         * @type {InsertSampleMapper}
         * */
        const valueMapper = typeToMapperMap.get(propertyType) || (() => {});

        if (structKeyValuePairs.length !== 0) {
            structKeyValuePairs.push(', ');
        }

        const dmlKey = keyMapper(column, propertyName);
        const dmlValue = valueMapper(propertyJsonSchema, sample[propertyName]);
        structKeyValuePairs.push(dmlKey);
        structKeyValuePairs.push(', ');
        structKeyValuePairs.push(dmlValue);
    }

    structKeyValuePairs.unshift('NAMED_STRUCT(');
    structKeyValuePairs.push(')');
    return structKeyValuePairs.join('');
}

/**
 * @type {Map<string, InsertSampleMapper>}
 * */
const typeToMapperMap = new Map()
    .set('bool', mapBooleanToDml)
    .set('text', mapStringToDml)
    .set('numeric', mapNumberToDml)
    .set('timestamp', mapTimestampToDml)
    .set('date', mapDateToDml)
    .set('interval', mapSqlCodeToDml)
    .set('map', mapMapToDml)
    .set('array', mapArrayToDml)
    .set('struct', mapStructToDml)
    .set('jsonObject', mapJsonObjectToDml)
    .set('jsonArray', mapJsonArrayToDml)

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapInsertSampleToDml = (column, sample) => {
    const mapper = typeToMapperMap.get(column.type);
    if (!mapper) {
        return sample.toString();
    }
    return mapper(column, sample);
}

module.exports = {
    mapInsertSampleToDml,
}
