const { dependencies } = require('../appDependencies');
const { replaceSpaceWithUnderscore, getName } = require('../generalHelper');

let _;
const setDependencies = ({ lodash }) => _ = lodash;

const getContainerName = compMod => compMod.keyspaceName;

const getEntityData = (object, properties = [], type = 'new') => 
	properties.reduce((transformObject, property) => {
		const value = object[property]?.[type];
		return {
			...transformObject,
			...(value ? { [property]: value } : {}),
		};
	}, {});

const getFullEntityName = (dbName, entityName) => dbName ? `${dbName}.${entityName}` : entityName;

const generateFullEntityName = entity => {
	setDependencies(dependencies);
	const compMod = _.get(entity, 'role.compMod', {});
	const entityData = _.get(entity, 'role', {});
	const dbName = replaceSpaceWithUnderscore(getContainerName(compMod));
	const entityName = replaceSpaceWithUnderscore(getName(entityData));
	return getFullEntityName(dbName, entityName);
};

const getEntityProperties = entity => {
	setDependencies(dependencies);
	const propertiesInRole = _.get(entity, 'role.properties', {});
	const propertiesInEntity = _.get(entity, 'properties', {});
	return { ...propertiesInEntity || {}, ...propertiesInRole };
};

const getEntityName = (compMod = {}, type = 'collectionName') => {
	return {
		oldName: replaceSpaceWithUnderscore(compMod.code?.old || compMod[type]?.old),
		newName: replaceSpaceWithUnderscore(compMod.code?.new || compMod[type]?.new),
	}
};

const prepareScript = (...scripts) => scripts.filter(Boolean);

module.exports = {
	getEntityData,
	getFullEntityName,
	generateFullEntityName,
	getEntityProperties,
	getContainerName,
	getEntityName,
	prepareScript
};
