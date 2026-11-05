const _ = require('lodash');
const { generateFullEntityName } = require('../../../utils/general');
const { AlterScriptDto } = require('../../types/AlterScriptDto');
const { wrapInTicks } = require('../../../../shared/general');

/**
 * @typedef GetAlterScriptDtoFunction
 * @param fullTableName {string}
 * @param collection {Object}
 * @returns Array<AlterScriptDto>
 */

/**
 * @param constraintName {string}
 * @param columnName {string}
 * @return string
 * */
const getCheckConstraintNameForDdlProvider = (constraintName = '', columnName) => {
	const columnNameNoTicks = columnName.replaceAll('`', '');
	const constraintNameNoTicks = constraintName.replaceAll('`', '');
	const appliedConstraintName = constraintNameNoTicks || `${columnNameNoTicks}_constraint`;

	return wrapInTicks(appliedConstraintName);
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getAddCheckConstraintsScriptsDtos = ddlProvider => (fullTableName, collection) => {
	return _.toPairs(collection.properties)
		.filter(([name, jsonSchema]) => {
			const oldName = jsonSchema.compMod.oldField.name;
			const currentCheckConstraintOnColumn = jsonSchema.check;
			const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
			return currentCheckConstraintOnColumn && !previousCheckConstraintOnColumn;
		})
		.map(([columnName, jsonSchema]) => {
			const constraintName = getCheckConstraintNameForDdlProvider(jsonSchema.checkConstraintName, columnName);
			const script = ddlProvider.setCheckConstraint(fullTableName, constraintName, jsonSchema.check);
			const isActivated = collection.role?.isActivated !== false && jsonSchema.isActivated !== false;
			return AlterScriptDto.getInstance([script], isActivated, false);
		});
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getRemoveCheckConstraintsScriptsDtos = ddlProvider => (fullTableName, collection) => {
	return _.toPairs(collection.properties)
		.filter(([name, jsonSchema]) => {
			const oldName = jsonSchema.compMod.oldField.name;
			const currentCheckConstraintOnColumn = jsonSchema.check;
			const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
			return previousCheckConstraintOnColumn && !currentCheckConstraintOnColumn;
		})
		.map(([name, jsonSchema]) => {
			const oldConstraintName = collection.role.properties[name]?.checkConstraintName;
			const constraintName = getCheckConstraintNameForDdlProvider(oldConstraintName, name);
			const script = ddlProvider.dropCheckConstraint(fullTableName, constraintName);
			const isActivated = collection.role?.isActivated !== false && jsonSchema.isActivated !== false;
			return AlterScriptDto.getInstance([script], isActivated, true);
		});
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getModifyCheckConstraintsScriptDtos = ddlProvider => (fullTableName, collection) => {
	return _.toPairs(collection.properties)
		.filter(([name, jsonSchema]) => {
			const oldName = jsonSchema.compMod.oldField.name;
			const currentCheckConstraintOnColumn = jsonSchema.check;
			const previousCheckConstraintOnColumn = collection.role.properties[oldName]?.check;
			return (
				currentCheckConstraintOnColumn &&
				previousCheckConstraintOnColumn &&
				currentCheckConstraintOnColumn !== previousCheckConstraintOnColumn
			);
		})
		.flatMap(([columnName, jsonSchema]) => {
			const oldColumnName = jsonSchema.compMod.oldField.name;
			const oldConstraintName = collection.role.properties[oldColumnName]?.checkConstraintName;
			const constraintName = getCheckConstraintNameForDdlProvider(oldConstraintName, oldColumnName);
			const dropOldConstraint = ddlProvider.dropCheckConstraint(fullTableName, constraintName);

			const newConstraintName = getCheckConstraintNameForDdlProvider(jsonSchema.checkConstraintName, columnName);
			const createNewConstraint = ddlProvider.setCheckConstraint(
				fullTableName,
				newConstraintName,
				jsonSchema.check,
			);
			const isActivated = collection.role?.isActivated !== false && jsonSchema.isActivated !== false;

			return [
				AlterScriptDto.getInstance([dropOldConstraint], isActivated, true),
				AlterScriptDto.getInstance([createNewConstraint], isActivated, false),
			];
		});
};

/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getCheckConstraintsScriptDtos =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const fullTableName = generateFullEntityName({ entity: collection, dbVersion });
		const addCheckConstraintsScriptDtos = getAddCheckConstraintsScriptsDtos(ddlProvider)(fullTableName, collection);
		const modifyCheckConstraintsScripts = getModifyCheckConstraintsScriptDtos(ddlProvider)(
			fullTableName,
			collection,
		);
		const removeCheckConstraintScripts = getRemoveCheckConstraintsScriptsDtos(ddlProvider)(
			fullTableName,
			collection,
		);

		return [
			...removeCheckConstraintScripts,
			...modifyCheckConstraintsScripts,
			...addCheckConstraintsScriptDtos,
		].filter(Boolean);
	};

module.exports = {
	getCheckConstraintsScriptDtos,
};
