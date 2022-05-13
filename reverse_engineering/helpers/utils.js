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
			tableNames: [...entities.tableNames, `\"${dbName}\": [${tableNames}]`],
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
const isViewDdl = (statement = '') => /^create (or replace |global |temporary ){0,1}view/.test(statement.toLocaleLowerCase());
const isTableDdl = (statement = '') => /^create (or replace ){0,1}table/.test(statement.toLocaleLowerCase());

const cleanEntityName = (sparkVersion, name = '') => {
	return isSupportGettingListOfViews(sparkVersion) ? name.replace(/ \(v\)$/, '') : name;
}

const isSupportGettingListOfViews = (sparkVersionString = '') => {
	const MAX_NOT_SUPPORT_VERSION = 6;
	const databricksRuntimeMajorVersion = parseInt(sparkVersionString.slice(0, sparkVersionString.indexOf('.')));
	return databricksRuntimeMajorVersion > MAX_NOT_SUPPORT_VERSION;
}

const getErrorMessage = (error = {}) => {
	if (typeof error === 'string') {
		return error;
	}

	if (error.code === 'ENOTFOUND') {
		return 'Cannot connect to workspace. Please check the Workspace URL or network connection.';
	}

	return error.message || 'Reverse Engineering error';
};

const removeParentheses = string => string.replace(/^\(|\)$/g, '');

module.exports = {
	prepareNamesForInsertionIntoScalaCode,
	splitTableAndViewNames,
	convertCustomTags,
	getErrorMessage,
	getCount,
	isViewDdl,
	isTableDdl,
	cleanEntityName,
	isSupportGettingListOfViews,
	removeParentheses,
};