const fetchRequestHelper = require('./fetchRequestHelper');
const normalizeTag = (tagArray, level) => {
	let normalizedTag = {};

	if (!tagArray || !Array.isArray(tagArray)) {
		return normalizedTag;
	}

	let [catalogName, schemaName, tableName, columnName, tagKey, tagValue] = tagArray;

	switch (level) {
		case 'catalogTags':
			[catalogName, tagKey, tagValue] = tagArray;
			normalizedTag = { catalogName, tagKey, tagValue };
			break;
		case 'schemaTags':
			[catalogName, schemaName, tagKey, tagValue] = tagArray;
			normalizedTag = { catalogName, schemaName, tagKey, tagValue };
			break;
		case 'tableTags':
			[catalogName, schemaName, tableName, tagKey, tagValue] = tagArray;
			normalizedTag = { catalogName, schemaName, tableName, tagKey, tagValue };
			break;
		case 'columnTags':
			normalizedTag = { catalogName, schemaName, tableName, columnName, tagKey, tagValue };
			break;
	}

	return normalizedTag;
};

const getNormalizedUnityTags = async (connectionInfo, logger) => {
	const rawUnityTags = await fetchRequestHelper.fetchTagsForUnityCatalogs(connectionInfo, logger);
	const levels = Object.keys(rawUnityTags);

	if (!levels?.length) {
		return {
			catalogTags: [],
			schemaTags: [],
			tableTags: [],
			columnTags: [],
		};
	}

	return levels.reduce((builtTags, currentLevel) => {
		builtTags[currentLevel] = rawUnityTags[currentLevel].map(rawUnityTag => {
			return normalizeTag(rawUnityTag, currentLevel);
		});

		return builtTags;
	}, {});
};

const applyUnityTagsToTableProperties = (columnTags, properties) => {
	if (!columnTags?.length) {
		return properties;
	}

	return properties.map(column => {
		const tagsForColumn = columnTags.filter(columnTag => column.name === columnTag.columnName);

		if (!tagsForColumn?.length) {
			return column;
		}

		const unityColumnTags = tagsForColumn.map(tag => ({
			unityTagKey: tag.tagKey,
			unityTagValue: tag.tagValue,
		}));

		return {
			...column,
			unityColumnTags,
		};
	});
};

const applyUnityTagsToTable = (tableTags, tableData) => {
	if (!tableTags.length) {
		return tableData;
	}

	const tagsForTable = tableTags.filter(tag => tag.columnName === tableData.name);

	if (!tagsForTable.length) {
		return tableData;
	}

	const unityEntityTags = tagsForTable.map(tag => ({
		unityTagKey: tag.tagKey,
		unityTagValue: tag.tagValue,
	}));

	return {
		...tableData,
		propertiesPane: {
			...tableData.propertiesPane,
			unityEntityTags,
		},
	};
};

const applyUnityTagsToSchema = (dbName, dbInfo, tagsToApply) => {
	const { catalogName } = dbInfo;
	const catalogTags = tagsToApply.catalogTags
		.filter(tag => {
			return catalogName === tag.catalogName;
		})
		.map(tag => ({
			unityTagKey: tag.tagKey,
			unityTagValue: tag.tagValue,
		}));

	const schemaTags = tagsToApply.schemaTags
		.filter(tag => {
			return catalogName === tag.catalogName && dbName === tag.schemaName;
		})
		.map(tag => ({
			unityTagKey: tag.tagKey,
			unityTagValue: tag.tagValue,
		}));

	return {
		...dbInfo,
		...(catalogTags.length && { unityCatalogTags: catalogTags }),
		...(schemaTags.length && { unitySchemaTags: schemaTags }),
	};
};

const getUnityTagsForView = viewTags => {
	if (!viewTags.length) {
		return {};
	}

	const unityViewTags = viewTags.map(tag => ({
		unityTagKey: tag.tagKey,
		unityTagValue: tag.tagValue,
	}));

	return { unityViewTags };
};

const filterUnityTagsByTable = (dbInfo, unityTags) => {
	const { catalogName, schemaName, tableName } = dbInfo;
	const { tableTags: allTableTags, columnTags: allColumnTags } = unityTags;
	const filterTags = tag => {
		return tag.catalogName === catalogName && tag.schemaName === schemaName && tag.tableName === tableName;
	};

	const tagsForCurrentTable = allTableTags.filter(filterTags);
	const tagsForCurrentTableColumns = allColumnTags.filter(filterTags);

	return {
		tableTags: tagsForCurrentTable,
		columnTags: tagsForCurrentTableColumns,
	};
};

const filterUnityTagsByView = (dbInfo, unityTags) => {
	const { catalogName, schemaName, viewName } = dbInfo;
	const { tableTags: tableAndViewTags } = unityTags;

	return tableAndViewTags.filter(tag => {
		return tag.catalogName === catalogName && tag.schemaName === schemaName && tag.tableName === viewName;
	});
};

module.exports = {
	getNormalizedUnityTags,
	applyUnityTagsToTableProperties,
	applyUnityTagsToTable,
	applyUnityTagsToSchema,
	getUnityTagsForView,
	filterUnityTagsByTable,
	filterUnityTagsByView,
};
