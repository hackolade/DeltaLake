const { dependencies } = require('../appDependencies');

const splitTableAndViewNames = names => {
	const namesByCategory = dependencies.lodash.partition(names, isView);

	return { views: namesByCategory[0].map(name => name.slice(0, -4)), tables: namesByCategory[1] };
};

const getCount = (count, recordSamplingSettings) => {
	const per = recordSamplingSettings.relative.value;
	const size = (recordSamplingSettings.active === 'absolute')
		? recordSamplingSettings.absolute.value
		: Math.round(count / 100 * per);
	return size;
};

const prepareNamesForInsertionIntoScalaCode = (databasesNames, collectionsNames) =>
	databasesNames.reduce((entities, dbName) => {
		const { tables } = splitTableAndViewNames(collectionsNames[dbName]);
		const tableNames = tables.map(tableName => `\"${tableName}\"`).join(', ');

		return {
			tableNames: [...entities.tableNames, `\"${dbName}\" -> List(${tableNames})`],
			dbNames: databasesNames.map(name => `\"${name}\"`)
		}
	}, { viewNames: [], tableNames: [] })

const convertCustomTags = (custom_tags, logger) => {
	try {
		return Object.keys(custom_tags).reduce((tags, tagKey) => {
			return [...tags, { customTagKey: tagKey, customtagvalue: custom_tags[tagKey] }]
		}, []);
	} catch (e) {
		logger.log('error', custom_tags, 'Error converting custom tags');
		return []
	}
}

const isView = name => name.slice(-4) === ' (v)';

module.exports = {
	prepareNamesForInsertionIntoScalaCode,
	splitTableAndViewNames,
	convertCustomTags,
	getCount
};