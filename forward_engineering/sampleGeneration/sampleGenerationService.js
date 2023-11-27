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

const generateSampleForDemonstrationOnContainerLevel = (_, ddlProvider) => (parsedData) => {
    const { prepareName, generateFullEntityNameFromBucketAndTableNames } = require('../utils/general');
    /**
     * @type {ContainerLevelParsedJsonData}
     * */
    const sampleData = parsedData.jsonData;
    const collectionId = _.get(Object.keys(sampleData), '[0]');
    if (!collectionId) {
        return '';
    }
    const entityJsonSchema = (parsedData.entitiesJsonSchema || {})[collectionId] || {};
    const { bucketName, collectionName } = entityJsonSchema;

    const ddlTableName = generateFullEntityNameFromBucketAndTableNames(bucketName, collectionName);

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

    return "INSERT INTO ... VALUES(...);";
}


module.exports = {
    getSampleGenerationOptions,
    parseJsonData,
    generateSampleForDemonstration,
}
