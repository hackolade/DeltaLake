const { getMostFrequentValueInList } = require('./utils');

/**
 * @typedef { (string | number | boolean) } Primitive
 */

/**
 *
 * @param {{
 *  propertiesSchema: object,
 *  documents: object[],
 * 	logger: object
 * }} param
 * @returns {object}
 */
const getVariantColumnsWithResolvedSubtype = ({ propertiesSchema, logger, documents = [] }) => {
	const propertiesEntriesWithUpdatedSubtypes = Object.entries(propertiesSchema).map(([propertyName, propertyData]) =>
		getVariantColumnWithResolvedSubType({ propertyName, propertyData, documents, logger }),
	);

	return Object.fromEntries(propertiesEntriesWithUpdatedSubtypes);
};

/**
 *
 * @param {{
 *  propertyName: string,
 *  propertyValue: object,
 *  documents: object[],
 * 	logger: object
 * }} param
 * @returns {[string, object]}
 */
const getVariantColumnWithResolvedSubType = ({ propertyName, propertyData, documents, logger }) => {
	if (propertyData?.mode !== 'var') {
		return [propertyName, propertyData];
	}

	const propertyDocumentsRecords = documents.map(document => document[propertyName]);
	const propertyDocumentsRecordsTypes = getPropertyDocumentsRecordsTypes({
		propertyName,
		propertyDocumentsRecords,
		logger,
	});
	const mostFrequentType = getMostFrequentValueInList(propertyDocumentsRecordsTypes);

	const updatedPropertyValue = {
		...propertyData,
		subtype: mostFrequentType,
	};

	return [propertyName, updatedPropertyValue];
};

/**
 *
 * @param {{
 * 	propertyName: string,
 * 	propertyDocumentsRecords: string[],
 * 	logger: object
 * }} param
 * @returns
 */
const getPropertyDocumentsRecordsTypes = ({ propertyName, propertyDocumentsRecords, logger }) =>
	propertyDocumentsRecords
		.map(record => {
			try {
				return getDocumentRecordType(record);
			} catch (error) {
				logger.log(
					'error',
					{ message: error.message, stack: error.stack, error },
					`Error on ${record} record related to ${propertyName} column type extraction`,
				);
			}
		})
		.filter(Boolean);

/**
 *
 * @param {Primitive | object | Array<Primitive | object>} record
 * @returns {string | undefined}
 */
const getDocumentRecordType = record => {
	const parsedRecord = getParsedVariantRecord(record);

	if (Array.isArray(parsedRecord)) {
		return 'array';
	}

	if (typeof parsedRecord === 'object') {
		return parsedRecord ? 'object' : 'null';
	}

	return typeof parsedRecord;
};

/**
 *
 * @param {string} record
 * @returns {Primitive | object | Array<Primitive>}
 */
const getParsedVariantRecord = record => JSON.parse(record);

module.exports = {
	getVariantColumnsWithResolvedSubtype,
};
