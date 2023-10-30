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
 * @return {string}
 * */
const getCreateStatement = ({
	name, comment, location, dbProperties, isActivated
}) => buildStatement(`CREATE DATABASE IF NOT EXISTS ${name}`, isActivated)
	(comment, `COMMENT '${encodeStringLiteral(comment)}'`)
	(location, `LOCATION '${location}'`)
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
		? `USE CATALOG ${prepareName(databaseDetails.catalogName)};`
		: '';
};

/**
 * @return {string}
 * */
const getDatabaseStatement = (containerData) => {
	const tab = getTab(0, containerData);
	const name = replaceSpaceWithUnderscore(prepareName(getName(tab)));
	if (!name) {
		return '';
	}

	return getCreateStatement({
		name: name,
		comment: tab.description,
		location: tab.location,
		dbProperties: tab.dbProperties,
		isActivated: tab.isActivated
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
