'use strict'

const {
	buildStatement,
	getName,
	getTab,
	replaceSpaceWithUnderscore,
	encodeStringLiteral,
	prepareName
} = require('../utils/general');
const { getCatalogTagsStatement, getSchemaTagsStatement } = require('../helpers/unityTagsHelper');

/**
 * @param {string|undefined} location
 * @param {string|undefined} managedLocation
 * @param {boolean} isUnityCatalogSupports
 * @return {string}
 */
const getLocationOption = (location, managedLocation, isUnityCatalogSupports) => {
	if (isUnityCatalogSupports && managedLocation) {
		return `MANAGED LOCATION '${managedLocation}'`;
	} else if (location) {
		return `LOCATION '${location}'`;
	} else {
		return '';
	}
};

/**
 * @param {string} name
 * @param {string|undefined} comment
 * @param {string|undefined} location
 * @param {string|undefined} managedLocation
 * @param {string|undefined} dbProperties
 * @param {boolean} isActivated
 * @param {boolean} isUnityCatalogSupports
 * @param {number} dbVersionNumber
 * @return {string}
 * */
const getCreateStatement = ({
	name, comment, location, managedLocation, dbProperties, isActivated, isUnityCatalogSupports, dbVersionNumber
}) => buildStatement(`CREATE ${getBucketKeyword(dbVersionNumber)} IF NOT EXISTS ${name}`, isActivated)
	(comment, `COMMENT '${encodeStringLiteral(comment)}'`)
	(location || managedLocation, getLocationOption(location, managedLocation, isUnityCatalogSupports))
	(dbProperties, `WITH DBPROPERTIES (${dbProperties})`)
	(true, ';')
		();


/**
 * @return {string}
 * */
const getUseCatalogStatement = (databaseData) => {
    const databaseDetails = getTab(0, databaseData);

    return databaseDetails.catalogName
        ? `USE CATALOG ${prepareName(databaseDetails.catalogName)};`
        : '';
};

/**
 * @return {string}
 * @param {*} containerData
 * @param {boolean} isUnityCatalogSupports
 * @param {number} dbVersionNumber
 * */
const getDatabaseStatement = (containerData, isUnityCatalogSupports, dbVersionNumber) => {
    const UNITY_TAGS_RUNTIME_REQUIRED = 13;
    const tab = getTab(0, containerData);
    const name = replaceSpaceWithUnderscore(prepareName(getName(tab)));
    if (!name) {
        return '';
    }

    let unityCatalogTags = '';
    let unitySchemaTags = '';
    const createStatement = getCreateStatement({
        name: name,
        comment: tab.description,
        location: tab.location,
        managedLocation: tab.managedLocation,
        dbProperties: tab.dbProperties,
        isActivated: tab.isActivated,
        isUnityCatalogSupports,
        dbVersionNumber
    });

    if (dbVersionNumber >= UNITY_TAGS_RUNTIME_REQUIRED) {
        unityCatalogTags = getCatalogTagsStatement(tab);
        unitySchemaTags = getSchemaTagsStatement(tab, name);
    }

    return [createStatement, unityCatalogTags, unitySchemaTags].join('\n\n');
};

const getDatabaseAlterStatement = (containerData, dbVersionNumber) => {
	const tab = getTab(0, containerData);
	if (!tab.dbProperties) {
		return '';
	}
	const name = replaceSpaceWithUnderscore(prepareName(getName(tab)));
	if (!name) {
		return '';
	}
	return `ALTER ${getBucketKeyword(dbVersionNumber)} ${name} SET DBPROPERTIES (${tab.dbProperties});\n\n`
};

const getBucketKeyword = (dbVersionNumber) => {
	return dbVersionNumber < 9 ? 'DATABASE' : 'SCHEMA';
}

module.exports = {
	getUseCatalogStatement,
	getDatabaseStatement,
	getDatabaseAlterStatement,
	getBucketKeyword
};
