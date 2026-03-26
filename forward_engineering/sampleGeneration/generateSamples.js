const _ = require('lodash');
const { generateFullEntityNameFromBucketAndTableNames } = require('../utils/general');
const { mapInsertSampleToDml } = require('./mapInsertSampleToDml');
const { prepareName } = require('../../shared/general');

/**
 * @param columnIndex {number}
 * @param maxColumnsInLineOfValuesClause {number}
 * @return {string}
 * */
const getValuesClauseColumnDelimiter = (columnIndex, maxColumnsInLineOfValuesClause) => {
	const indexInLine = columnIndex % maxColumnsInLineOfValuesClause;
	if (columnIndex === 0 || indexInLine !== 0) {
		return ', ';
	}
	if (columnIndex !== 0 && indexInLine === 0) {
		return ',\n\t';
	}
	return '';
};

/**
 * @return {
 *     (
 *      entityJsonSchema: SampleGenerationEntityJsonSchema,
 *      samples: Array<Record<string, any>>
 *     ) => string
 * }
 * */
const generateSamples = (entityJsonSchema, samples) => {
	if (!samples.length) {
		return '';
	}
	const { bucketName, collectionName } = entityJsonSchema;
	const ddlTableName = generateFullEntityNameFromBucketAndTableNames(bucketName, collectionName);
	const properties = entityJsonSchema.properties || {};

	const firstSample = _.get(samples, '[0]', {});
	const columnNames = Object.keys(firstSample);
	const ddlColumnNames = columnNames.map(name => prepareName(name));
	const joinedDdlColumnNames = ddlColumnNames.join(',\n\t');

	const insertIntoClause = `INSERT INTO ${ddlTableName} (\n\t${joinedDdlColumnNames}\n) VALUES`;
	const statements = [insertIntoClause];
	const maxColumnsInLineOfValuesClause = 3;

	for (let i = 0; i < samples.length; i++) {
		const sampleDto = samples[i];
		const valueClauseParts = ['(\n\t'];
		for (let j = 0; j < columnNames.length; j++) {
			const columnName = columnNames[j];
			const sampleValue = sampleDto[columnName];
			const column = properties[columnName] || {};

			const ddlValueRepresentation = mapInsertSampleToDml(column, sampleValue);
			valueClauseParts.push(ddlValueRepresentation);
			if (j !== columnNames.length - 1) {
				const columnDelimiter = getValuesClauseColumnDelimiter(j, maxColumnsInLineOfValuesClause);
				valueClauseParts.push(columnDelimiter);
			}
		}
		valueClauseParts.push('\n)');
		statements.push(valueClauseParts.join(''));
		if (i !== samples.length - 1) {
			statements.push(',\n');
		}
	}

	return statements.join('\n') + ';';
};

module.exports = {
	generateSamples,
};
