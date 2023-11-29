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
const mapInsertStringSampleToDml = (column, sample) => {
    return wrapInSingleQuotes(sample);
}

/**
 * @param column {Object}
 * @param sample {any}
 * */
const mapInsertNumberSampleToDml = (column, sample) => {
    return Number(sample);
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
const mapJsonObjectToDml = (column, sample) => {
    if (column.type !== 'jsonObject') {
        return '';
    }
    return JSON.stringify(sample);
}

const mapMapToDml = (column, sample) => {
    const keyType = column.keyType || 'text';
    /**
     * @type {InsertSampleMapper}
     * */
    const keyMapper = typeToMapperMap.get(keyType) || (() => {});

    const mapKeyValuePairs = [];
    const properties = column.properties || {};
    for (const propertyName of Object.keys(properties)) {
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
 * @type {Map<string, InsertSampleMapper>}
 * */
const typeToMapperMap = new Map()
    .set('text', mapInsertStringSampleToDml)
    .set('numeric', mapInsertNumberSampleToDml)
    .set('timestamp', mapSqlCodeToDml)
    .set('date', mapSqlCodeToDml)
    .set('interval', mapSqlCodeToDml)
    .set('map', mapMapToDml)

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
