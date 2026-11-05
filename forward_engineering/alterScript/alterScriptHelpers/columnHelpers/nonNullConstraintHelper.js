const _ = require('lodash');
const { generateFullEntityName } = require('../../../utils/general');
const { AlterScriptDto } = require('../../types/AlterScriptDto');
const { prepareName } = require('../../../../shared/general');

/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getModifyNonNullColumnsScriptDtos =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const fullTableName = generateFullEntityName({ entity: collection, dbVersion });
		const isCollectionActivated = collection.role?.isActivated !== false;

		const currentRequiredColumnNames = collection.required || [];
		const previousRequiredColumnNames = collection.role.required || [];

		const columnNamesToAddNotNullConstraint = _.difference(currentRequiredColumnNames, previousRequiredColumnNames);
		const columnNamesToRemoveNotNullConstraint = _.difference(
			previousRequiredColumnNames,
			currentRequiredColumnNames,
		);

		const addNotNullConstraintsScriptDtos = _.toPairs(collection.properties)
			.filter(([name, jsonSchema]) => {
				const oldName = jsonSchema.compMod.oldField.name;
				const shouldRemoveForOldName = columnNamesToRemoveNotNullConstraint.includes(oldName);
				const shouldAddForNewName = columnNamesToAddNotNullConstraint.includes(name);
				return shouldAddForNewName && !shouldRemoveForOldName;
			})
			.map(([columnName, jsonSchema]) => {
				const isActivated = isCollectionActivated && jsonSchema.isActivated !== false;
				return AlterScriptDto.getInstance(
					[ddlProvider.setNotNullConstraint(fullTableName, prepareName(columnName))],
					isActivated,
					false,
				);
			})
			.filter(Boolean);
		const removeNotNullConstraintScriptDtos = _.toPairs(collection.properties)
			.filter(([name, jsonSchema]) => {
				const oldName = jsonSchema.compMod.oldField.name;
				const shouldRemoveForOldName = columnNamesToRemoveNotNullConstraint.includes(oldName);
				const shouldAddForNewName = columnNamesToAddNotNullConstraint.includes(name);
				return shouldRemoveForOldName && !shouldAddForNewName;
			})
			.map(([name, jsonSchema]) => {
				const isActivated = isCollectionActivated && jsonSchema.isActivated !== false;
				return AlterScriptDto.getInstance(
					[ddlProvider.dropNotNullConstraint(fullTableName, prepareName(name))],
					isActivated,
					true,
				);
			})
			.filter(Boolean);

		return [...addNotNullConstraintsScriptDtos, ...removeNotNullConstraintScriptDtos];
	};

module.exports = {
	getModifyNonNullColumnsScriptDtos,
};
