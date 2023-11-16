/**
 * @param constraintName {string}
 * @param tableName {string}
 * @param [index] {number}
 * @return {string}
 */
const getCheckConstraintName = (constraintName, tableName, index) => {
	if (constraintName) {
		return constraintName;
	}

	let generatedName = `${tableName}_constraint`;

	if (index !== undefined && !isNaN(index)) {
		generatedName = `${generatedName}_${index + 1}`;
	}

	return generatedName;
};


/**
 * @param columns {Object[]}
 * @param tableName {string}
 * @return string[]
 * */
const getCheckConstraintsScriptsOnColumnLevel = (columns, tableName) => {
	return Object.keys(columns)
		.map(colName => ({ colName: colName.replaceAll('`', ''), ...columns[colName] }))
		.filter(column => column.constraints.check)
		.map(column => {
			const constraintName = getCheckConstraintName(column.constraints.checkConstraintName, tableName);

			return `ALTER TABLE ${tableName} ADD CONSTRAINT \`${constraintName}\` CHECK (${column.constraints.check})`;
		});
};

/**
 *
 * @param entityJsonSchema {Object}
 * @param tableName {string}
 * @return {Array<string>}
 */
const getCheckConstraintsScriptsOnTableLevel = (entityJsonSchema, tableName) => {
	if (entityJsonSchema.chkConstr?.length) {
		return entityJsonSchema.chkConstr.map((checkConstr, index) => {
			const constraintName = getCheckConstraintName(checkConstr.chkConstrName, entityJsonSchema.collectionName, index);

			return `ALTER TABLE ${tableName} ADD CONSTRAINT \`${constraintName}\` CHECK (${checkConstr.constrExpression})`;
		});
	}

	return [];
};

module.exports = {
	getCheckConstraintsScriptsOnColumnLevel,
	getCheckConstraintsScriptsOnTableLevel
};
