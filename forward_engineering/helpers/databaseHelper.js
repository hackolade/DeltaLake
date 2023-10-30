'use strict'

const {
	buildStatement,
	getName,
	getTab,
	replaceSpaceWithUnderscore,
	encodeStringLiteral,
	isSupportUnityCatalog,
	prepareName
} = require('../utils/generalUtils');

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
 * @return {string}
 * */
const getCreateStatement = ({
	name, comment, location, managedLocation, dbProperties, isActivated, isUnityCatalogSupports
}) => buildStatement(`CREATE DATABASE IF NOT EXISTS ${name}`, isActivated)
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
		? `USE CATALOG \`${databaseDetails.catalogName}\`;`
		: '';
};

/**
 * @return {string}
 * @param {*} containerData
 * @param {boolean} isUnityCatalogSupports
 * */
const getDatabaseStatement = (containerData, isUnityCatalogSupports) => {
	const tab = getTab(0, containerData);
	const name = replaceSpaceWithUnderscore(prepareName(getName(tab)));
	if (!name) {
		return '';
	}

	return getCreateStatement({
		name: name,
		comment: tab.description,
		location: tab.location,
		managedLocation: tab.managedLocation,
		dbProperties: tab.dbProperties,
		isActivated: tab.isActivated,
		isUnityCatalogSupports,
	});
};

const getDatabaseAlterStatement = (containerData) => {
	const tab = getTab(0, containerData);
	if (!tab.dbProperties) {
		return '';
	}
	const name = replaceSpaceWithUnderscore(prepareName(getName(tab)));
	if (!name) {
		return '';
	}
	return `ALTER DATABASE ${name} SET DBPROPERTIES (${tab.dbProperties});\n\n`
};

module.exports = {
	getUseCatalogStatement,
	getDatabaseStatement,
	getDatabaseAlterStatement
};
