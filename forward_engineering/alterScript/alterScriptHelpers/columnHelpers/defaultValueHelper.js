const _ = require('lodash');
const { AlterScriptDto } = require('../../types/AlterScriptDto');
const { generateFullEntityName } = require('../../../utils/general');
const { prepareName } = require('../../../../shared/general');

/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getUpdatedDefaultColumnValueScriptDtos =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const isCollectionActivated = collection.role?.isActivated !== false;

		return _.toPairs(collection.properties)
			.filter(([name, jsonSchema]) => {
				const newDefaultValue = jsonSchema.default;
				const oldName = jsonSchema.compMod.oldField.name;
				const oldDefaultValue = collection.role.properties[oldName]?.default;
				return newDefaultValue && (!oldDefaultValue || newDefaultValue !== oldDefaultValue);
			})
			.map(([name, jsonSchema]) => {
				const newDefaultValue = jsonSchema.default;
				const scriptGenerationConfig = {
					fullTableName: generateFullEntityName({ entity: collection, dbVersion }),
					columnName: prepareName(name),
					defaultValue: newDefaultValue,
				};
				const isActivated = isCollectionActivated && jsonSchema.isActivated !== false;
				return AlterScriptDto.getInstance(
					[ddlProvider.updateColumnDefaultValue(scriptGenerationConfig)],
					isActivated,
					false,
				);
			})
			.filter(Boolean);
	};

/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getDeletedDefaultColumnValueScriptDtos =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const isCollectionActivated = collection.role?.isActivated !== false;

		return _.toPairs(collection.properties)
			.filter(([name, jsonSchema]) => {
				const newDefault = jsonSchema.default;
				const oldName = jsonSchema.compMod.oldField.name;
				const oldDefault = collection.role.properties[oldName]?.default;
				return oldDefault && !newDefault;
			})
			.map(([name, jsonSchema]) => {
				const scriptGenerationConfig = {
					fullTableName: generateFullEntityName({ entity: collection, dbVersion }),
					columnName: prepareName(name),
				};
				const isActivated = isCollectionActivated && jsonSchema.isActivated !== false;
				return AlterScriptDto.getInstance(
					[ddlProvider.dropColumnDefaultValue(scriptGenerationConfig)],
					isActivated,
					true,
				);
			})
			.filter(Boolean);
	};

/**
 * @return {({ collection, dbVersion }: { collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getModifiedDefaultColumnValueScriptDtos =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const updatedDefaultValuesScriptDtos = getUpdatedDefaultColumnValueScriptDtos(ddlProvider)({
			collection,
			dbVersion,
		});
		const dropDefaultValuesScriptDtos = getDeletedDefaultColumnValueScriptDtos(ddlProvider)({
			collection,
			dbVersion,
		});
		return [...updatedDefaultValuesScriptDtos, ...dropDefaultValuesScriptDtos];
	};

module.exports = {
	getModifiedDefaultColumnValueScriptDtos,
};
