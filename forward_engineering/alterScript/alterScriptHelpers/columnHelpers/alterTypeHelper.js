const { AlterScriptDto } = require('../../types/AlterScriptDto');
const { checkFieldPropertiesChanged, generateFullEntityName, prepareName } = require('../../../utils/general');
const { getColumns, getColumnStatement } = require('../../../helpers/columnHelper');

/**
 * @return {boolean}
 * */
const hasLengthChanged = (collection, oldFieldName, currentJsonSchema) => {
	const oldProperty = collection.role.properties[oldFieldName];

	const previousLength = oldProperty?.length;
	const newLength = currentJsonSchema?.length;
	return previousLength !== newLength;
};

/**
 * @return {boolean}
 * */
const hasPrecisionOrScaleChanged = (collection, oldFieldName, currentJsonSchema) => {
	const oldProperty = collection.role.properties[oldFieldName];

	const previousPrecision = oldProperty?.precision;
	const newPrecision = currentJsonSchema?.precision;
	const previousScale = oldProperty?.scale;
	const newScale = currentJsonSchema?.scale;

	return previousPrecision !== newPrecision || previousScale !== newScale;
};

/**
 * @return {(collection: Object) => {
 *     role: Object,
 * }}
 * */
const getEntityData = _ => collection => {
	const properties = _.get(collection, 'properties', {});
	const unionProperties = _.unionWith(
		Object.entries(properties),
		Object.entries(_.get(collection, 'role.properties', {})),
		(firstProperty, secondProperty) => {
			if (firstProperty?.compMod?.oldField?.name) {
				return _.isEqual(_.get(firstProperty, '[1].compMod.oldField.name'), _.get(secondProperty, '[0]'));
			}
			return _.isEqual(_.get(secondProperty, '[1].compMod.oldField.name'), _.get(firstProperty, '[0]'));
		},
	);
	return {
		role: {
			..._.omit(collection.role || {}, ['properties']),
			properties: Object.fromEntries(unionProperties),
		},
	};
};

/**
 * @return {(collection: Object, definitions: any, dbVersion: string) => AlterScriptDto[]}
 * */
const getUpdateTypesScriptDtos = (_, ddlProvider) => (collection, definitions, dbVersion) => {
	const fullTableName = generateFullEntityName({ entity: collection, dbVersion });
	const entityData = getEntityData(_)(collection);
	const { columns: columnsInfo } = getColumns(entityData.role, definitions, dbVersion);

	return _.toPairs(collection.properties)
		.filter(([name, jsonSchema]) => {
			const hasTypeChanged = checkFieldPropertiesChanged(jsonSchema.compMod, ['type', 'mode']);
			if (!hasTypeChanged) {
				const oldName = jsonSchema.compMod.oldField.name;
				const isNewLength = hasLengthChanged(collection, oldName, jsonSchema);
				const isNewPrecisionOrScale = hasPrecisionOrScaleChanged(collection, oldName, jsonSchema);
				return isNewLength || isNewPrecisionOrScale;
			}
			return hasTypeChanged;
		})
		.flatMap(([name, jsonSchema]) => {
			const ddlColumnName = prepareName(name);
			const dropColumnScript = ddlProvider.dropTableColumns({
				name: fullTableName,
				columns: ddlColumnName,
			});

			const addColumnScript = ddlProvider.addTableColumn({
				name: fullTableName,
				column: getColumnStatement({ name, ...columnsInfo[name] }),
			});

			return [
				AlterScriptDto.getInstance([dropColumnScript], true, true),
				AlterScriptDto.getInstance([addColumnScript], true, false),
			];
		})
		.filter(Boolean);
};

module.exports = {
	getUpdateTypesScriptDtos,
};
