const { dependencies } = require('../appDependencies');

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

const hydrateTableProperties = ({ new: newItems, old: oldItems }) => {
	const hydrateProperties = properties => (properties || '').split(',').map(prop => prop.trim());
	const prepareProperties = properties => properties.join(',\n');
	const preparePropertiesName = properties => properties.map(prop => prop.replace(/(=\S+)/, '')).join(', ');
	const newHydrateItems = hydrateProperties(newItems);
	const oldHydrateItems = hydrateProperties(oldItems);
	const { add, drop } = getDifferentItems(newHydrateItems, oldHydrateItems);
	return {
		add: prepareProperties(add),
		drop: preparePropertiesName(drop),
	};
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