/**
 * @param entity {Object}
 * @param nameProperty {string}
 * @param modify {'added' | 'deleted' | 'modified'}
 * @return Array<Object>
 * */
const getItems = (entity, nameProperty, modify) =>
	[]
		.concat(entity.properties?.[nameProperty]?.properties?.[modify]?.items)
		.filter(Boolean)
		.map(items => Object.values(items.properties)[0]);

module.exports = {
	getItems,
};
