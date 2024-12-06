const _ = require('lodash');
const { prepareName, getName, getFullEntityName } = require('../../utils/general');

/**
 * @param entityJsonSchema {Object}
 * @return {boolean}
 * */
const doesTableHaveAnyPK = entityJsonSchema => {
	const columnJsonSchemas = Object.values(entityJsonSchema.properties);
	return columnJsonSchemas.some(property => Boolean(property.primaryKey));
};

/**
 * @return {(entitiesJsonSchema: Object, dbName: string) => string}
 * */
const getCreatePKConstraintScript = ddlProvider => (entityJsonSchema, dbName) => {
	const pkColumnNames = _.toPairs(entityJsonSchema.properties)
		.filter(([name, jsonSchema]) => Boolean(jsonSchema.primaryKey))
		.map(([name]) => name)
		.map(name => prepareName(name));

	const entityName = prepareName(getName(entityJsonSchema));
	const tableName = getFullEntityName(prepareName(dbName), entityName);
	const constraintName = prepareName(`${entityName}_pk`);

	return ddlProvider.addPkConstraint(tableName, constraintName, pkColumnNames);
};

/**
 * @return {(entitiesJsonSchema: Object, dbName: string) => string}
 **/
const getCreatePKConstraintsScript = app => (entityJsonSchema, dbName) => {
	if (!doesTableHaveAnyPK(entityJsonSchema)) {
		return '';
	}

	const ddlProvider = require('../../ddlProvider/ddlProvider')(app);

	return getCreatePKConstraintScript(ddlProvider)(entityJsonSchema, dbName);
};

module.exports = {
	getCreatePKConstraintsScript,
};
