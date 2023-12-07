const {
    prepareName,
    generateFullEntityNameFromBucketAndTableNames,
} = require('../utils/general');
const {mapInsertSampleToDml} = require("./mapInsertSampleToDml");


const getSampleGenerationOptions = (app, data) => {
    const _ = app.require('lodash');
    const insertSamplesOption = _.get(data, 'options.additionalOptions', []).find(option => option.id === 'INCLUDE_SAMPLES') || {};
    const isSampleGenerationRequired = Boolean(insertSamplesOption?.value);
    // Append to result script if the plugin is invoked from cli and do not append if it's invoked from GUI app
    const shouldAppendSamplesToTheResultScript = data.options.origin !== 'ui';

    return {
        isSampleGenerationRequired,
        shouldAppendSamplesToTheResultScript
    }
}

/**
 * @param jsonData {Record<string, string> | string}
 * @return {ParsedJsonData}
 * */
const parseJsonData = (jsonData) => {
    if (typeof jsonData === 'string') {
        return JSON.parse(jsonData);
    }

    const collectionIdToSamples = {};
    for (const collectionId of Object.keys(jsonData)) {
        collectionIdToSamples[collectionId] = JSON.parse(jsonData[collectionId]);
    }
    return collectionIdToSamples;
}

/**
 * @param columnIndex {number}
 * @param maxColumnsInLineOfValuesClause {number}
 * @return {string}
 * */
const getValuesClauseColumnDelimiter = (columnIndex, maxColumnsInLineOfValuesClause) => {
    const indexInLine = columnIndex % maxColumnsInLineOfValuesClause;
    if (columnIndex === 0 || indexInLine !== 0) {
        return ', ';
    }
    if (columnIndex !== 0 && indexInLine === 0) {
        return ',\n\t';
    }
    return '';
}

/**
 * @return {
 *     (
 *      entityJsonSchema: SampleGenerationEntityJsonSchema,
 *      samples: Array<Record<string, any>>
 *     ) => string
 * }
 * */
const generateSamples = (_) => (entityJsonSchema, samples) => {
    if (!samples.length) {
        return '';
    }
    const {bucketName, collectionName} = entityJsonSchema;
    const ddlTableName = generateFullEntityNameFromBucketAndTableNames(bucketName, collectionName);
    const properties = entityJsonSchema.properties || {};

    const firstSample = _.get(samples, '[0]', {});
    const columnNames = Object.keys(firstSample);
    const ddlColumnNames = columnNames.map(name => prepareName(name));
    const joinedDdlColumnNames = ddlColumnNames.join(',\n\t');

    const insertIntoClause = ['INSERT INTO ', ddlTableName, '(\n\t', joinedDdlColumnNames, '\n)', ' VALUES'].join('');
    const statements = [insertIntoClause];
    const maxColumnsInLineOfValuesClause = 3;

    for (let i = 0; i < samples.length; i++) {
        const sampleDto = samples[i];
        const valueClauseParts = ['(\n\t'];
        for (let j = 0; j < columnNames.length; j++) {
            const columnName = columnNames[j];
            const sampleValue = sampleDto[columnName];
            const column = properties[columnName] || {};

            const ddlValueRepresentation = mapInsertSampleToDml(column, sampleValue);
            valueClauseParts.push(ddlValueRepresentation);
            if (j !== columnNames.length - 1) {
                const columnDelimiter = getValuesClauseColumnDelimiter(j, maxColumnsInLineOfValuesClause);
                valueClauseParts.push(columnDelimiter);
            }
        }
        valueClauseParts.push('\n)');
        statements.push(valueClauseParts.join(''));
        if (i !== samples.length - 1) {
            statements.push(',\n')
        }
    }

    return statements.join('\n') + ';';
}

/**
 * @return {(parsedData: Object) => string}
 * */
const generateSampleForDemonstrationOnContainerLevel = (_) => (parsedData) => {
    /**
     * @type {ContainerLevelParsedJsonData}
     * */
    const sampleData = parsedData.jsonData || {};
    const collectionIds = Object.keys(sampleData);

    return collectionIds.map(collectionId => {
        const entityJsonSchema = (parsedData.entitiesJsonSchema || {})[collectionId] || {};
        const collectionSampleData = sampleData[collectionId] || {}
        return generateSamples(_)(entityJsonSchema, [collectionSampleData]);
    })
        .concat([''])
        .join('\n\n');
}

/**
 * @return {(parsedData: Object) => string}
 * */
const generateSampleForDemonstrationOnEntityLevel = (_) => (parsedData) => {
    /**
     * @type {ContainerLevelParsedJsonData}
     * */
    const sampleData = parsedData.jsonData || {};
    const entityData = _.get(parsedData, 'entityData[0]', {});
    const containerData = _.get(parsedData, 'containerData[0]', {});
    const entityJsonSchema = {
        ...entityData,
        bucketName: containerData.name,
        ...(parsedData.jsonSchema || {}),
    };
    return generateSamples(_)(entityJsonSchema, [sampleData]);
}

/**
 * @param app {App}
 * @param parsedData {Object}
 * @param level {'entity' | 'container'}
 * @return {string}
 * */
const generateSampleForDemonstration = (app, parsedData, level) => {
    const _ = app.require('lodash');

    if (level === 'entity') {
        return generateSampleForDemonstrationOnEntityLevel(_)(parsedData);
    }
    if (level === 'container') {
        return generateSampleForDemonstrationOnContainerLevel(_)(parsedData);
    }
    return '';
}

/**
 * @return {({
 *     sampleData: ContainerLevelParsedJsonData,
 *     collectionId: string,
 *     entitiesJsonSchema: Record<string, Object>,
 * }) => string}
 * */
const generateSampleForSeparateBucketTable = (_) => ({
                                                         entitiesJsonSchema = {},
                                                         collectionId,
                                                         sampleData = {}
                                                     }) => {
    if (!collectionId) {
        return '';
    }
    const entityJsonSchema = entitiesJsonSchema[collectionId] || {};
    const collectionSampleData = sampleData[collectionId] || {}
    return generateSamples(_)(entityJsonSchema, [collectionSampleData]);
}

/**
 * @return {
 *      (
 *          entityJsonSchema: Object,
 *          samples: Array<Object>,
 *      ) => string
 * }
 * */
const generateSamplesScript = (_) => (entityJsonSchema, samples) => {
    if (!samples?.length) {
        return '';
    }
    if (!(entityJsonSchema.bucketName && entityJsonSchema.collectionName)) {
        return '';
    }
    return generateSamples(_)(entityJsonSchema, samples);
}

module.exports = {
    getSampleGenerationOptions,
    parseJsonData,
    generateSampleForDemonstration,
    generateSamplesScript,
    generateSampleForSeparateBucketTable,
}
