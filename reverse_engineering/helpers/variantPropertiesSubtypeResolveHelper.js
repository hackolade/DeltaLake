const { getMostFrequentValueInList } = require('./utils');

/**
 * @typedef { (string | number | boolean) } Primitive
 */

/**
 *
 * @param {{
 *  propertiesSchema: object,
 *  documents: object[]
 * }} param
 * @returns {object}
 */
const getVariantColumnsWithResolvedSubtype = ({ propertiesSchema, documents = [] }) => {
	const propertiesEntriesWithUpdatedSubtypes = Object.entries(propertiesSchema).map(([propertyName, propertyData]) =>
		getVariantColumnWithResolvedSubType({ propertyName, propertyData, documents }),
	);

	return Object.fromEntries(propertiesEntriesWithUpdatedSubtypes);
};

/**
 *
 * @param {{
 *  propertyName: string,
 *  propertyValue: object,
 *  documents: object[]
 * }} param
 * @returns {[string, object]}
 */
const getVariantColumnWithResolvedSubType = ({ propertyName, propertyData, documents }) => {
	if (propertyData?.mode !== 'var') {
		return [propertyName, propertyData];
	}

	const propertyDocumentsRecords = documents.map(document => document[propertyName]);
	const parsedDocumentsRecords = propertyDocumentsRecords.map(getParsedVariantRecord);
	const parsedDocumentsRecordsTypes = parsedDocumentsRecords.map(getDocumentRecordType);
	const mostFrequentType = getMostFrequentValueInList(parsedDocumentsRecordsTypes);

	const updatedPropertyValue = {
		...propertyData,
		subtype: mostFrequentType,
	};

	return [propertyName, updatedPropertyValue];
};

/**
 *
 * @param {string} record
 * @returns {Primitive | object | Array<Primitive>}
 */
const getParsedVariantRecord = record => {
	try {
		const parsedRecord = JSON.parse(record);
		return parsedRecord;
	} catch {
		return {};
	}
};

/**
 *
 * @param {Primitive | object | Array<Primitive | object>} parsedRecord
 * @returns {string}
 */
const getDocumentRecordType = parsedRecord => {
	if (Array.isArray(parsedRecord)) {
		return 'array';
	}

	if (typeof parsedRecord === 'object') {
		return parsedRecord ? 'object' : null;
	}

	return typeof parsedRecord;
};

module.exports = {
	getVariantColumnsWithResolvedSubtype,
};
