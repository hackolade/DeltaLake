const _ = require('lodash');
const { DiffMap } = require('../../types/DiffMap');
const { getTablePropertiesClause } = require('../../../helpers/tableHelper');
const { AlterScriptDto } = require('../../types/AlterScriptDto');
const { generateFullEntityName } = require('../../../utils/general');

/**
 * @param tableProperties {Object}
 * @return {DiffMap}
 * */
const buildTablePropertiesDiffMap = tableProperties => {
	const diffMap = new DiffMap();
	const newProperties = tableProperties.new || [];
	const oldProperties = tableProperties.old || [];

	for (const newProp of newProperties) {
		if (!newProp.propertyKey) {
			continue;
		}
		const correspondingOldProp = oldProperties.find(p => p.propertyKey === newProp.propertyKey);
		if (!correspondingOldProp) {
			diffMap.appendAdded(newProp);
		} else if (newProp.propertyValue !== correspondingOldProp.propertyValue) {
			diffMap.appendModified(newProp, correspondingOldProp);
		}
	}

	for (const oldProp of oldProperties) {
		if (!oldProp.propertyKey) {
			continue;
		}
		const correspondingNewProp = newProperties.find(p => p.propertyKey === oldProp.propertyKey);
		if (!correspondingNewProp) {
			diffMap.appendDeleted(oldProp);
		}
		// All modified items are appended in the loop above
	}

	return diffMap;
};

const getAddTablePropertyScriptDto = ddlProvider => (properties, fullCollectionName) => {
	const addPropertiesDdlString = getTablePropertiesClause(properties);
	const ddlConfig = {
		name: fullCollectionName,
		properties: addPropertiesDdlString,
	};
	const script = ddlProvider.setTableProperties(ddlConfig);
	return AlterScriptDto.getInstance([script], true, false);
};

const getDeleteTablePropertyScriptDto = ddlProvider => (properties, fullCollectionName) => {
	const propertiesWithNoValues = properties.map(prop => ({
		...prop,
		propertyValue: undefined,
	}));
	const dropPropertiesDdlString = getTablePropertiesClause(propertiesWithNoValues);
	const ddlConfig = {
		name: fullCollectionName,
		properties: dropPropertiesDdlString,
	};
	const script = ddlProvider.unsetTableProperties(ddlConfig);
	return AlterScriptDto.getInstance([script], true, true);
};

const getModifiedTablePropertiesScriptDtos =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const compMod = _.get(collection, 'role.compMod', {});
		const tableProperties = compMod.tableProperties || {};
		const fullCollectionName = generateFullEntityName({ entity: collection, dbVersion });
		const propertiesDiffMap = buildTablePropertiesDiffMap(tableProperties);

		const addedPropertiesScriptDto = getAddTablePropertyScriptDto(ddlProvider)(
			propertiesDiffMap.added,
			fullCollectionName,
		);
		const deletedPropertiesScriptDto = getDeleteTablePropertyScriptDto(ddlProvider)(
			propertiesDiffMap.deleted,
			fullCollectionName,
		);

		const modifiedPropertiesScriptDtos = propertiesDiffMap.modified.map(({ newItem }) => {
			return getAddTablePropertyScriptDto(ddlProvider)([newItem], fullCollectionName);
		});

		return [addedPropertiesScriptDto, deletedPropertiesScriptDto, ...modifiedPropertiesScriptDtos].filter(Boolean);
	};

module.exports = {
	getModifiedTablePropertiesScriptDtos,
};
