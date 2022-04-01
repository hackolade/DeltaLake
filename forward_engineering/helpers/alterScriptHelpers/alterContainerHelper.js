const { getDatabaseStatement, getDatabaseAlterStatement } = require('../databaseHelper')
const { dependencies } = require('../appDependencies');
const { getEntityData } = require('./generalHelper');
const { getIsChangeProperties } = require('./common');

let _;

const containerProperties = ['comment', 'location', 'dbProperties'];
const otherContainerProperties = ['name', 'location'];

const setDependencies = ({ lodash }) => _ = lodash;

const getContainerData = compMod => getEntityData(compMod, containerProperties);

const hydrateDrop = container => {
	const { role } = container;
	return role?.code || role?.name;
}; 

const getAddContainerScript = container => {
	const dataContainer = [container.role || {}]
	const containerStatement = getDatabaseStatement(dataContainer);
	return containerStatement;
};

const getDeleteContainerScript = provider => container => {
	const hydratedDrop = hydrateDrop(container);
	return provider.dropDatabase(hydratedDrop);
};

const getModifyContainerScript = provider => container => {
	setDependencies(dependencies);
	const compMod = _.get(container, 'role.compMod', {});
	const getName = type => compMod.code?.[type] || compMod.name?.[type];
	const name = { 
		new: getName('new'),
		old: getName('old')
	};
	const isChangeProperties = getIsChangeProperties({ ...compMod, name }, otherContainerProperties);
	const containerData = { ...getContainerData(compMod), name: name.new };
	if (!isChangeProperties) {
		return getDatabaseAlterStatement([containerData]);
	}
	const hydratedDrop = hydrateDrop({ role: { ...containerData, name: name.old }});
	const deletedScript = provider.dropDatabase(hydratedDrop);
	const addedScript = getAddContainerScript({ role: containerData });
	
	return [deletedScript, addedScript];
};

module.exports = {
	getAddContainerScript,
	getDeleteContainerScript,
	getModifyContainerScript
}