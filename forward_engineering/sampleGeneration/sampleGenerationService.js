const {
    prepareName,
    generateFullEntityNameFromBucketAndTableNames, buildScript,
} = require('../utils/general');


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
 * @return {
 *     (
 *      entityJsonSchema: SampleGenerationEntityJsonSchema,
 *      samples: Array<Record<string, any>>
 *     ) => string
 * }
 * */
const generateSamples = (_, ddlProvider) => (entityJsonSchema, samples) => {
    if (!samples.length) {
        return '';
    }
    const { bucketName, collectionName } = entityJsonSchema;
    const ddlTableName = generateFullEntityNameFromBucketAndTableNames(bucketName, collectionName);

    const firstSample = _.get(samples, '[0]', {});
    const columnNames = Object.keys(firstSample);
    const ddlColumnNames = columnNames.map(name => prepareName(name));
    const joinedDdlColumnNames = ddlColumnNames.join(',\n\t');

    const insertIntoClause = ['INSERT INTO ', ddlTableName, '(\n\t', joinedDdlColumnNames, '\n)', ' VALUES'].join('');
    const statements = [insertIntoClause];
    const maxColumnsInLineOfValuesClause = 3;

    for (const sampleDto of samples) {
        const valueClauseParts = ['(\n\t'];
        for (let i = 0; i < columnNames.length; i++) {
            const columnName = columnNames[i];
            const sampleValue = sampleDto[columnName];
            const ddlValueRepresentation = sampleValue.toString();
            valueClauseParts.push(ddlValueRepresentation);
            if (i % maxColumnsInLineOfValuesClause !== 0 && i !== columnNames.length - 1) {
                valueClauseParts.push(', ');
            }
            if (i !== 0 && i % maxColumnsInLineOfValuesClause === 0 && i !== columnNames.length - 1) {
                valueClauseParts.push(',\n\t');
            }
        }
        valueClauseParts.push('\n)');
        statements.push(valueClauseParts.join(''));
    }

    return statements.join('\n') + ';';
}

/**
 * @return {(parsedData: Object) => string}
 * */
const generateSampleForDemonstrationOnContainerLevel = (_, ddlProvider) => (parsedData) => {
    /**
     * @type {ContainerLevelParsedJsonData}
     * */
    const sampleData = parsedData.jsonData || {};
    const collectionId = _.get(Object.keys(sampleData), '[0]');
    if (!collectionId) {
        return '';
    }
    const entityJsonSchema = (parsedData.entitiesJsonSchema || {})[collectionId] || {};
    const collectionSampleData = sampleData[collectionId] || {}
    return generateSamples(_, ddlProvider)(entityJsonSchema, [collectionSampleData]);
}

/**
 * @param app {App}
 * @param parsedData {Object}
 * @param level {'entity' | 'container'}
 * @return {string}
 * */
const generateSampleForDemonstration = (app, parsedData, level) => {
    const ddlProvider = require('../ddlProvider/ddlProvider')(app);
    const _ = app.require('lodash');

    let script = ''
    if (level === 'container') {
        script = generateSampleForDemonstrationOnContainerLevel(_, ddlProvider)(parsedData);
    }
    return script;
}


module.exports = {
    getSampleGenerationOptions,
    parseJsonData,
    generateSampleForDemonstration,
}
