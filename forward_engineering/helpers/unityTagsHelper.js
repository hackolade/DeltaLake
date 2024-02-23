'use strict';

/**
 * @typedef {Object} UnityTag
 * @property {string} id
 * @property {string} unityTagKey
 * @property {string} unityTagValue
 */

const { wrapInSingleQuotes } = require('../utils/general');

/**
 * @param {Array<UnityTag>} tags
 * @returns {string}
 */
const buildTagPairs = (tags) => {
    const tagsWithKeys = tags.filter(tag => tag?.unityTagKey);

    return tagsWithKeys.reduce((statement, tag, idx) => {
        const isLastPair = idx === tagsWithKeys.length - 1;
        const comaIfNeeded = isLastPair ? '\n' : ',\n';
        let currentTag = wrapInSingleQuotes(tag.unityTagKey);

        if (!tag.unityTagValue) {
            return statement + currentTag + comaIfNeeded;
        }

        currentTag = currentTag + ' = ' + wrapInSingleQuotes(tag.unityTagValue);

        return statement + currentTag + comaIfNeeded;
    }, '\n');
};

/**
 * @param {Object} containerData
 * @return {string}
 */

const getCatalogTagsStatement = (containerData) => {
    const { catalogName, unityCatalogTags } = containerData;

    if (!catalogName || !unityCatalogTags?.length) {
        return '';
    }

    const tags = buildTagPairs(unityCatalogTags);

    return `ALTER CATALOG ${catalogName} SET TAGS (${tags});`;
};

const getSchemaTagsStatement = (containerData, preparedName) => {
    const { unitySchemaTags } = containerData;

    if (!unitySchemaTags?.length) {
        return '';
    }

    const tags = buildTagPairs(unitySchemaTags);

    return `ALTER SCHEMA ${preparedName} SET TAGS (${tags});`;
};

const getEntityTagsStatement = (entity, fullTableName) => {
    if (!entity.unityEntityTags?.length) {
        return '';
    }

    const tags = buildTagPairs(entity.unityEntityTags);

    return `ALTER TABLE ${fullTableName} SET TAGS (${tags});`;
};

const getColumnTagsStatement = (_, columns, fullTableName) => {
    return _.toPairs(columns)
        .map(([colName, schema]) => {
            if (!schema.unityColumnTags?.length) {
                return undefined;
            }

            const tags = buildTagPairs(schema.unityColumnTags);

            return `ALTER TABLE ${fullTableName} ALTER COLUMN ${colName} SET TAGS (${tags});`;
        })
        .filter(Boolean);
};

/**
 * @param {UnityTag[]} unsetTags
 * @returns {string}
 */
const getUnsetTagsNamesParamString = unsetTags => {
	return unsetTags.map(({ unityTagKey }) => wrapInSingleQuotes(unityTagKey)).join(', ');
};

/**
 * @param {UnityTag[]} tagsToFilter
 * @param {UnityTag[]} filterBy
 * @returns {UnityTag[]}
 */
const getUnityTagsFromCompMod = (tagsToFilter, filterBy) => {
	return tagsToFilter.filter(tag => {
		if (!filterBy.length) {
			return true;
		}

		const correspondingTag = filterBy.find(filterTag => filterTag.id === tag.id);

		if (!correspondingTag) {
			return true;
		}

		return correspondingTag.unityTagKey !== tag.unityTagKey || correspondingTag.unityTagValue !== tag.unityTagValue;
	});
};

module.exports = {
    getCatalogTagsStatement,
    getSchemaTagsStatement,
    getEntityTagsStatement,
    getColumnTagsStatement,
    buildTagPairs,
    getUnsetTagsNamesParamString,
    getUnityTagsFromCompMod,
};