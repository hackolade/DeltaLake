const { getDatabaseStatement, getDatabaseAlterStatement } = require('../databaseHelper')
const { dependencies } = require('../appDependencies');
const { getEntityData } = require('./generalHelper');
const { getIsChangeProperties } = require('./common');
const {EntitiesThatSupportComments} = require("./enums/entityType");
const {wrapInSingleQuotes, replaceSpaceWithUnderscore} = require("../generalHelper");

let _;

const containerProperties = ['comment', 'location', 'dbProperties', 'description'];
const otherContainerProperties = ['name', 'location'];

const setDependencies = ({ lodash }) => _ = lodash;

const getContainerData = compMod => getEntityData(compMod, containerProperties);

const hydrateDrop = container => {
	const { role } = container;
	return role?.code || role?.name;
};

const getAddContainerScript = container => {
	const dataContainer = [container.role || {}]
	return getDatabaseStatement(dataContainer);
};

const getDeleteContainerScript = provider => container => {
	const hydratedDrop = hydrateDrop(container);
	return provider.dropDatabase(hydratedDrop);
};

/**
 * @return {{
 *     old?: string,
 *     new?: string,
 * }}
 * */
const extractDescription = (container) => {
	return container?.role?.compMod?.description || {};
}

/**
 * @return string
 * */
const getUpsertCommentsScript = (container, ddlProvider) => {
	const description = extractDescription(container);
	if (description.new && description.new !== description.old) {
		return ddlProvider.updateComment({
			entityType: EntitiesThatSupportComments.SCHEMA,
			entityName: replaceSpaceWithUnderscore(container.role.name),
			comment: wrapInSingleQuotes(description.new),
		})
	}
	return '';
}

/**
 * @return string
 * */
const getDropCommentsScript = (container, ddlProvider) => {
	const description = extractDescription(container);
	if (description.old && !description.new) {
		return ddlProvider.dropComment({
			entityType: EntitiesThatSupportComments.SCHEMA,
			entityName: replaceSpaceWithUnderscore(container.role.name)
		})
	}
	return '';
}

const getAlterCommentsScript = (container, ddlProvider) => {
	return [
		getUpsertCommentsScript(container, ddlProvider),
		getDropCommentsScript(container, ddlProvider),
	].filter(Boolean).join('\n\n');
}

const extractNamesFromCompMod = (compMod) => {
	const extractName = type => compMod.code?.[type] || compMod.name?.[type];
	return {
		new: extractName('new'),
		old: extractName('old')
	};
}

const getModifyContainerScript = provider => container => {
	setDependencies(dependencies);
	const compMod = _.get(container, 'role.compMod', {});
	const names = extractNamesFromCompMod(compMod);

	const didPropertiesChange = getIsChangeProperties({ ...compMod, name: names }, otherContainerProperties);
	const containerData = { ...getContainerData(compMod), name: names.new };
	if (!didPropertiesChange) {
		const alterCommentsScript = getAlterCommentsScript(container, provider);
		const alterDatabaseScript = getDatabaseAlterStatement([containerData]);
		return [
			alterCommentsScript,
			alterDatabaseScript,
		].filter(Boolean).join('\n\n');
	}
	const hydratedDrop = hydrateDrop({ role: { ...containerData, name: names.old }});
	const deletedScript = provider.dropDatabase(hydratedDrop);
	const addedScript = getAddContainerScript({ role: containerData });

	return [deletedScript, addedScript];
};

module.exports = {
	getAddContainerScript,
	getDeleteContainerScript,
	getModifyContainerScript
}
