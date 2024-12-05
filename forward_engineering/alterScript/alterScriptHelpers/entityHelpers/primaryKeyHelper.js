const _ = require('lodash');
const { generateFullEntityName, getEntityNameFromCollection, prepareName } = require('../../../utils/general');
const { AlterScriptDto } = require('../../types/AlterScriptDto');

/**
 * @return {(collection: Object, guid: string) => Object | undefined}
 * */
const getPropertyNameByGuid = (collection, guid) => {
	const propertyInArray = _.toPairs(collection?.role?.properties)
		.filter(([name, jsonSchema]) => jsonSchema.GUID === guid)
		.map(([name]) => name);
	if (!propertyInArray.length) {
		return undefined;
	}
	return propertyInArray[0];
};

/**
 * @return {(collection: Object, guids: string[]) => Array<Object>}
 * */
const getPropertiesNamesByGuids = (collection, guids) => {
	return guids.map(guid => getPropertyNameByGuid(collection, guid)).filter(Boolean);
};

/**
 * @return {(collection: Object) => boolean}
 * */
const didCompositePkChange = collection => {
	const pkDto = collection?.role?.compMod?.primaryKey || {};
	const newPrimaryKeys = pkDto.new || [];
	const oldPrimaryKeys = pkDto.old || [];
	if (newPrimaryKeys.length !== oldPrimaryKeys.length) {
		return true;
	}
	if (newPrimaryKeys.length === 0 && oldPrimaryKeys.length === 0) {
		return false;
	}

	return !_.isEmpty(_.differenceWith(oldPrimaryKeys, newPrimaryKeys, _.isEqual));
};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getAddCompositePkScripts =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const didPkChange = didCompositePkChange(collection);
		if (!didPkChange) {
			return [];
		}
		const fullTableName = generateFullEntityName({ entity: collection, dbVersion });
		const constraintName = getEntityNameFromCollection(collection) + '_pk';
		const pkDto = collection?.role?.compMod?.primaryKey || {};
		const newPrimaryKeys = pkDto.new || [];

		return newPrimaryKeys
			.map(newPk => {
				const compositePrimaryKey = newPk.compositePrimaryKey || [];
				const guidsOfColumnsInPk = compositePrimaryKey.map(compositePkEntry => compositePkEntry.keyId);
				const columnNamesForDDL = getPropertiesNamesByGuids(collection, guidsOfColumnsInPk);
				if (!columnNamesForDDL.length) {
					return undefined;
				}
				return ddlProvider.addPkConstraint(fullTableName, constraintName, columnNamesForDDL);
			})
			.filter(Boolean)
			.map(scriptLine => ({
				scripts: [
					{
						isDropScript: false,
						script: scriptLine,
					},
				],
			}));
	};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getDropCompositePkScripts =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const didPkChange = didCompositePkChange(collection);
		if (!didPkChange) {
			return [];
		}
		const fullTableName = generateFullEntityName({ entity: collection, dbVersion });
		const pkDto = collection?.role?.compMod?.primaryKey || {};
		const oldPrimaryKeys = pkDto.old || [];
		return oldPrimaryKeys
			.map(oldPk => ddlProvider.dropPkConstraint(fullTableName))
			.map(scriptLine => ({
				scripts: [
					{
						isDropScript: true,
						script: scriptLine,
					},
				],
			}));
	};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getModifyCompositePkScripts =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const dropCompositePkScripts = getDropCompositePkScripts(ddlProvider)({ collection, dbVersion });
		const addCompositePkScripts = getAddCompositePkScripts(ddlProvider)({ collection, dbVersion });

		return [...dropCompositePkScripts, ...addCompositePkScripts];
	};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getAddPkScripts =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const fullTableName = generateFullEntityName({ entity: collection, dbVersion });
		const constraintName = getEntityNameFromCollection(collection) + '_pk';

		return _.toPairs(collection.properties)
			.filter(([name, jsonSchema]) => {
				const isRegularPrimaryKey = jsonSchema.primaryKey && !jsonSchema.compositePrimaryKey;
				const oldName = jsonSchema.compMod.oldField.name;
				const wasTheFieldAPrimaryKey = Boolean(collection.role.properties[oldName]?.primaryKey);
				return isRegularPrimaryKey && !wasTheFieldAPrimaryKey;
			})
			.map(([name, jsonSchema]) => {
				const nameForDDl = prepareName(name);
				const columnNamesForDDL = [nameForDDl];
				return ddlProvider.addPkConstraint(fullTableName, constraintName, columnNamesForDDL);
			})
			.map(scriptLine => ({
				scripts: [
					{
						isDropScript: false,
						script: scriptLine,
					},
				],
			}));
	};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getDropPkScripts =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const fullTableName = generateFullEntityName({ entity: collection, dbVersion });

		return _.toPairs(collection.properties)
			.filter(([name, jsonSchema]) => {
				const oldName = jsonSchema.compMod.oldField.name;
				const oldJsonSchema = collection.role.properties[oldName];
				const wasTheFieldARegularPrimaryKey = oldJsonSchema?.primaryKey && !oldJsonSchema?.compositePrimaryKey;

				const isNotAPrimaryKey = !jsonSchema.primaryKey && !jsonSchema.compositePrimaryKey;
				return wasTheFieldARegularPrimaryKey && isNotAPrimaryKey;
			})
			.map(([name, jsonSchema]) => {
				return ddlProvider.dropPkConstraint(fullTableName);
			})
			.map(scriptLine => ({
				scripts: [
					{
						isDropScript: true,
						script: scriptLine,
					},
				],
			}));
	};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getModifyPkScripts =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const dropPkScripts = getDropPkScripts(ddlProvider)({ collection, dbVersion });
		const addPkScripts = getAddPkScripts(ddlProvider)({ collection, dbVersion });

		return [...dropPkScripts, ...addPkScripts];
	};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => Array<AlterScriptDto>}
 * */
const getModifyPkConstraintsScripts =
	ddlProvider =>
	({ collection, dbVersion }) => {
		const modifyCompositePkScripts = getModifyCompositePkScripts(ddlProvider)({ collection, dbVersion });
		const modifyPkScripts = getModifyPkScripts(ddlProvider)({ collection, dbVersion });

		return [...modifyCompositePkScripts, ...modifyPkScripts];
	};

module.exports = {
	getModifyPkConstraintsScripts,
};
