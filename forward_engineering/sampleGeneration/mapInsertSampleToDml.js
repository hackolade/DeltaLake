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
 * @type {Map<string, InsertSampleMapper>}
 * */
const typeToMapperMap = new Map()
    .set('text', mapInsertStringSampleToDml)
    .set('numeric', mapInsertNumberSampleToDml)

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
