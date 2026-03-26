const { wrapInTicks } = require('../../../shared/general');

/**
 * @typedef GetStatementsFunction
 * @param tableName {string}
 * @returns Array<string>
 */

/**
 * @param constraintName {string}
 * @param tableName {string}
 * @param [index] {number}
 * @return {string}
 */
const getCheckConstraintName = (constraintName, tableName, index) => {
	if (constraintName) {
		return wrapInTicks(constraintName);
	}

	let generatedName = `${tableName}_constraint`;

	if (index !== undefined && !isNaN(index)) {
		generatedName = `${generatedName}_${index + 1}`;
	}

	return wrapInTicks(generatedName);
};

/**
 * @param app {Object}
 * @returns GetStatementsFunction
 * */
const getCheckConstraintsScriptsOnColumnLevel = app => (columns, tableName) => {
	const ddlProvider = require('../../ddlProvider/ddlProvider')(app);

	return Object.keys(columns)
		.map(colName => ({ colName: colName.replaceAll('`', ''), ...columns[colName] }))
		.filter(column => column.constraints?.check)
		.map(column => {
			const constraintName = getCheckConstraintName(column.constraints.checkConstraintName, tableName);

			return ddlProvider.setCheckConstraint(tableName, constraintName, column.constraints.check);
		});
};

/**
 * @param app {Object}
 * @returns GetStatementsFunction
 * */
const getCheckConstraintsScriptsOnTableLevel = app => (entityJsonSchema, tableName) => {
	if (entityJsonSchema.chkConstr?.length) {
		const ddlProvider = require('../../ddlProvider/ddlProvider')(app);

		return entityJsonSchema.chkConstr.map((checkConstr, index) => {
			const constraintName = getCheckConstraintName(
				checkConstr.chkConstrName,
				entityJsonSchema.collectionName,
				index,
			);

			return ddlProvider.setCheckConstraint(tableName, constraintName, checkConstr.constrExpression);
		});
	}

	return [];
};

const buildConstraints = (tableConstraints, columnConstraints) => {
	if (!tableConstraints && !columnConstraints) {
		return '';
	}

	if (tableConstraints && !columnConstraints) {
		return tableConstraints;
	}

	if (!tableConstraints && columnConstraints) {
		return columnConstraints;
	}

	return [tableConstraints, columnConstraints].join('\n');
};

module.exports = {
	getCheckConstraintsScriptsOnColumnLevel,
	getCheckConstraintsScriptsOnTableLevel,
	buildConstraints,
};
