const _ = require('lodash');
const { generateFullEntityName, getContainerName, getDifferentItems } = require('../../../utils/general');

const hydrateDropIndexes = (entity, dbVersion) => {
	const bloomIndex = _.get(entity, 'BloomIndxs', []);
	return bloomIndex.length ? generateFullEntityName({ entity, dbVersion }) : '';
};

const hydrateAddIndexes = (entity, BloomIndxs, properties, definitions) => {
	const compMod = _.get(entity, 'role.compMod', {});
	const entityData = _.get(entity, 'role', {});
	const containerData = { name: getContainerName(compMod) };
	return [[containerData], [entityData, {}, { BloomIndxs }], { ...entityData, properties }, definitions];
};

const hydrateIndex = ({ entity, properties, definitions, dbVersion }) => {
	const bloomIndex = _.get(entity, 'role.compMod.BloomIndxs', {});
	const { drop, add } = getDifferentItems(bloomIndex.new, bloomIndex.old);
	return {
		hydratedDropIndex: hydrateDropIndexes({ ...entity, BloomIndxs: drop }, dbVersion),
		hydratedAddIndex: hydrateAddIndexes(entity, add, properties, definitions),
	};
};

module.exports = {
	hydrateDropIndexes,
	hydrateAddIndexes,
	hydrateIndex,
};
