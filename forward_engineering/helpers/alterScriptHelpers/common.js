const { dependencies } = require('../appDependencies');
const { getTablePropertiesClause } = require('../tableHelper');

let _;
const setDependencies = ({ lodash }) => _ = lodash;

const getDifferentItems = (newItems = [], oldItems = []) => {
	setDependencies(dependencies);
	const intersection = _.intersectionWith(newItems, oldItems, _.isEqual);
	return {
		add: _.xorWith(newItems, intersection, _.isEqual),
		drop:_.xorWith(oldItems, intersection, _.isEqual)
	};
};

const hydrateTableProperties = ({ new: newItems, old: oldItems }, name) => {
	const preparePropertiesName =  properties => _.map(properties, ({ propertyKey }) => propertyKey).join(', ');
	const { add, drop } = getDifferentItems(newItems, oldItems);
	const dataProperties = {
		add: getTablePropertiesClause(add),
		drop: preparePropertiesName(drop),
	};
	return { dataProperties, name };
};

const compareProperties = ({new: newProperty, old: oldProperty}) => {
	setDependencies(dependencies);
	if (!newProperty && !oldProperty) {
		return;
	}
	return !_.isEqual(newProperty, oldProperty);
};

const getIsChangeProperties = (compMod, properties) => 
	properties.some(property => compareProperties(compMod[property] || {}));

module.exports = {
	hydrateTableProperties,
	getDifferentItems,
	getIsChangeProperties
}