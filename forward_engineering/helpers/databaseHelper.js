'use strict'

const { buildStatement, getName, getTab, replaceSpaceWithUnderscore } = require('./generalHelper');

const getCreateStatement = ({
	name, comment, location, dbProperties, isActivated
}) => buildStatement(`CREATE DATABASE IF NOT EXISTS ${name}`, isActivated)
	(comment, `COMMENT '${comment}'`)
	(location, `LOCATION '${location}'`)
	(dbProperties, `WITH DBPROPERTIES (${dbProperties})`)
	(true, ';')
		();

const getDatabaseStatement = (containerData) => {
	const tab = getTab(0, containerData);
	const name = replaceSpaceWithUnderscore(getName(tab));
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
	const name = replaceSpaceWithUnderscore(getName(tab));
	if (!name) {
		return '';
	}
	return `ALTER DATABASE ${name} SET DBPROPERTIES (${tab.dbProperties});\n\n`
};

module.exports = {
	getDatabaseStatement,
	getDatabaseAlterStatement
};
