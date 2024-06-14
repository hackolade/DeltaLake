const { wrapInTicks } = require('../../utils/general');

/**
 * @typedef GetStatementsFunction
 * @param _ {Object}
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
 * @param ddlProvider {Object}
 * @returns GetStatementsFunction
 * */
const getCheckConstraintsScriptsOnColumnLevel = ddlProvider => (columns, tableName) => {
	return Object.keys(columns)
		.map(colName => ({ colName: colName.replaceAll('`', ''), ...columns[colName] }))
		.filter(column => column.constraints?.check)
		.map(column => {
			const constraintName = getCheckConstraintName(column.constraints.checkConstraintName, tableName);

			return ddlProvider.setCheckConstraint(tableName, constraintName, column.constraints.check);
		});
};

/**
 * @param ddlProvider {Object}
 * @returns GetStatementsFunction
 * */
const getCheckConstraintsScriptsOnTableLevel = ddlProvider => (entityJsonSchema, tableName) => {
	if (entityJsonSchema.chkConstr?.length) {
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
