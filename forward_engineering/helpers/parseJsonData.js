/**
 * @param jsonData {Record<string, string> | string}
 * @return {ParsedJsonData}
 * */
const parseJsonData = jsonData => {
	if (typeof jsonData === 'string') {
		return JSON.parse(jsonData);
	}

	const collectionIdToSamples = {};
	for (const collectionId of Object.keys(jsonData)) {
		collectionIdToSamples[collectionId] = JSON.parse(jsonData[collectionId]);
	}
	return collectionIdToSamples;
};

module.exports = {
	parseJsonData,
};
