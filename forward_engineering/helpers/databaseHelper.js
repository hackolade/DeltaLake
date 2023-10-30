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
const getUseCatalogStatement = (modelData, databaseData) => {
	const modelDetails = getTab(0, modelData);
	const databaseDetails = getTab(0, databaseData);

	return databaseDetails.catalogName && isSupportUnityCatalog(modelDetails.dbVersion)
		? `USE CATALOG \`${databaseDetails.catalogName}\`;`
		: '';
};

/**
 * @return {string}
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
