const handleSubtype = (childType, parentType) => {
	if (childType.type === 'array') {
		return {
			subtype: `${parentType}<array>`,
			properties: [handleType(childType)],
		};
	}
	if (childType.type === 'map') {
		return {
			subtype: `${parentType}<map>`,
			properties: [handleType(childType)],
		};
	}
	if (childType.type === 'struct') {
		return {
			subtype: `${parentType}<struct>`,
			properties: [handleType(childType)],
		};
	}
	switch (childType.type) {
		case 'tinyint':
		case 'smallint':
		case 'int':
		case 'bigint':
		case 'float':
		case 'double':
		case 'decimal':
			return { subtype: `${parentType}<num>` };
		case 'char':
		case 'varchar':
		case 'string':
			return { subtype: `${parentType}<txt>` };
		case 'binary':
			return { subtype: `${parentType}<bin>` };
		case 'boolean':
			return { subtype: `${parentType}<bool>` };
		case 'date':
			return { subtype: `${parentType}<date>` };
		case 'timestamp':
		case 'timestamp_ntz':
			return { subtype: `${parentType}<ts>` };
		case 'interval':
			return { subtype: `${parentType}<intrvl>` };
		case 'union':
			return { subtype: `${parentType}<union>` };
		default:
			return { subtype: `${parentType}<txt>` };
	}
};

const handleType = typeContainer => {
	if (typeContainer.type === 'array') {
		return {
			type: 'array',
			...handleSubtype(typeContainer.elements, 'array'),
		};
	}
	if (typeContainer.type === 'struct') {
		return {
			subtype: 'struct<str>',
			keyType: 'string',
			properties: typeContainer.params.map(column => reverseTableColumn(column)),
		};
	}
	if (typeContainer.type === 'map') {
		const handledType = handleType(typeContainer.key);

		return {
			type: 'document',
			childType: 'map',
			keyType: handledType.type,
			keySubtype: handledType.mode,
			...handleSubtype(typeContainer.val, 'map'),
		};
	}
	switch (typeContainer.type) {
		case 'tinyint':
		case 'smallint':
		case 'int':
		case 'bigint':
		case 'float':
		case 'double':
		case 'decimal':
			return {
				type: 'numeric',
				mode: typeContainer.type,
				precision: typeContainer.precision,
				scale: typeContainer.scale,
			};
		case 'char':
		case 'varchar':
		case 'string':
			return { type: 'text', mode: typeContainer.type };
		case 'boolean':
			return { type: 'bool' };
		case 'binary':
			return { type: 'binary', mode: typeContainer.type };
		case 'timestamp':
			return { type: 'timestamp', mode: '' };
		case 'timestamp_ntz':
			return { type: 'timestamp', mode: typeContainer.type };
		case 'date':
			return { type: 'date' };
		case 'interval':
			return { type: 'interval' };
		default:
			return { type: 'text' };
	}
};

const reverseTableColumn = column => {
	return {
		...handleType(column.colType),
		name: column.colName,
		description: column.colComment,
		...(column.generatedDefaultValue && { generatedDefaultValue: column.generatedDefaultValue }),
		...(column.primaryKey && { primaryKey: true, primaryKeyOptions: column.primaryKeyOptions }),
	};
};

module.exports = { reverseTableColumn };
