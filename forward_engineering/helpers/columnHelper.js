'use strict'

const { buildStatement, getName, getTab, indentString, getTypeDescriptor, prepareName, commentDeactivatedStatements } = require('./generalHelper');

const getStructChild = (name, type, comment) => `${prepareName(name)}: ${type}` + (comment ? ` COMMENT '${comment}'` : '');

const getStructChildProperties = getTypeByProperty => property => {
	const childProperties = Object.keys(property.properties || {});
	const activatedProps = [];
	const deactivatedProps = [];

	if (childProperties.length) {
		childProperties.forEach(propertyName => {
			const childProperty = property.properties[propertyName];
			const name = (getName(childProperty) || propertyName);
			const isActivated = childProperty.isActivated !== false;
			const structChild = getStructChild(name, getTypeByProperty(childProperty), childProperty.description);
			if (isActivated) {
				activatedProps.push(structChild);
			} else {
				deactivatedProps.push(structChild);
			}
		});
	}

	if (Array.isArray(property.oneOf)) {
		const unions = getUnionFromOneOf(getTypeByProperty)(property);
		activatedProps.push(...Object.keys(unions).map(name => getStructChild(name, unions[name])));
	}

	if (Array.isArray(property.allOf)) {
		const unions = getUnionFromAllOf(getTypeByProperty)(property);
		activatedProps.push(...Object.keys(unions).map(name => getStructChild(name, unions[name])));
	}

	if (!activatedProps.length) {
		activatedProps.push('new_column: string');
	}

	return { activatedProps, deactivatedProps };
};

const getStruct = getTypeByProperty => property => {
	const getStructStatement = (propertiesString) => `struct<${propertiesString}>`;
	
	const { activatedProps, deactivatedProps } = getStructChildProperties(getTypeByProperty)(property);
	if (deactivatedProps.length === 0) {
		return getStructStatement(activatedProps.join(', '));
	} else if (activatedProps.length === 0) {
		return getStructStatement(`/* ${activatedProps.join(', ')} */`);
	}
	return getStructStatement(`${activatedProps.join(', ')} /*, ${deactivatedProps.join(', ')}*/`);
};

const getChildBySubtype = (parentType, subtype) => {
	const childValueType = ((getTypeDescriptor(parentType).subtypes || {})[subtype] || {}).childValueType || 'text';
	
	return getPropertyByType(childValueType);
};

const getPropertyByType = (type) => {
	const childTypeDescriptor = getTypeDescriptor(type);

	return Object.assign({
		type
	}, childTypeDescriptor.defaultValues || {});
};

const getArray = getTypeByProperty => property => {
	let type;

	if (Array.isArray(property.items)) {
		type = getTypeByProperty(property.items[0]);
	} else if (property.items) {
		type = getTypeByProperty(property.items);
	} else if (Array.isArray(property.oneOf)) {
		const unions = getUnionFromOneOf(getTypeByProperty)(property);
		const name = Object.keys(unions)[0];
		type = unions[name];
	} else if (Array.isArray(property.allOf)) {
		const unions = getUnionFromAllOf(getTypeByProperty)(property);
		const name = Object.keys(unions)[0];
		type = unions[name];
	}

	if (!type) {
		type = getTypeByProperty(getChildBySubtype('array', property.subtype));
	}

	return `array<${type}>`;
};

const getMapKey = (property) => {
	if (['char', 'varchar'].indexOf(property.keySubtype) !== -1) {
		return property.keySubtype + '(255)';
	} else if (property.keySubtype) {
		return property.keySubtype;
	} else if (property.keyType === 'numeric') {
		return 'int';
	} else {
		return 'string';
	}
};

const getMap = getTypeByProperty => property => {
	const key = getMapKey(property);
	const childNames = Object.keys(property.properties || {});
	let type;

	if (childNames.length) {
		type = getTypeByProperty(property.properties[childNames[0]]);
	} else if (Array.isArray(property.oneOf)) {
		const unions = getUnionFromOneOf(getTypeByProperty)(property);
		type = unions[Object.keys(unions)[0]];
	} else if (Array.isArray(property.allOf)) {
		const unions = getUnionFromAllOf(getTypeByProperty)(property);
		type = unions[Object.keys(unions)[0]];
	}

	if (!type) {
		type = getTypeByProperty(getChildBySubtype('map', property.subtype));
	}

	return `map<${key}, ${type}>`;
};

const getText = (property) => {
	const mode = property.mode;

	if (['char', 'varchar'].indexOf(mode) === -1) {
		return 'string';
	} else if (property.maxLength) {
		return mode + `(${property.maxLength})`;
	} else {
		return mode + `(${255})`;
	}
};

const getNumeric = (property) => {
	const mode = property.mode;

	if (mode !== 'decimal') {
		return mode;
	} else if (property.precision || property.scale) {
		return mode + `(${property.precision || 9}, ${property.scale || 0})`;
	} else {
		return mode;
	}
};

const getJsonType = getTypeByProperty => property => {
	if (!property.physicalType) {
		return 'string';
	}

	return getTypeByProperty(Object.assign({}, property, { type: property.physicalType }));
};

const getUnionTypeFromMultiple = getTypeByProperty => property => {
	const types = property.type.map(type => {
		const dataType = type === 'number' ? 'numeric' : type;
		
		return getTypeByProperty(getPropertyByType(dataType))
	});

	return `uniontype<${types.join(',')}>`;
};

const getUnionFromOneOf = getTypeByProperty => property => {
	const types = property.oneOf.reduce((types, item) => {
		return Object.keys(item.properties || {}).reduce((types, itemName) => {
			const itemProperty = item.properties[itemName];
			const name = getName(itemProperty) || itemName;
			const propertyType = getTypeByProperty(itemProperty);

			if (!Array.isArray(types[name])) {
				types[name] = [];
			}

			types[name].push(propertyType);

			return types;
		}, types);
	}, {});

	return Object.keys(types).reduce((result, propertyName) => {
		result[propertyName] = `uniontype<${(types[propertyName] || []).join(', ')}>`;

		return result;
	}, {});
};

const getUnionFromAllOf = getTypeByProperty => property => {
	return property.allOf.reduce((types, subschema) => {
		if (!Array.isArray(subschema.oneOf)) {
			return types;
		}
		
		return Object.assign(
			{},
			types,
			getUnionFromOneOf(getTypeByProperty)(subschema)
		);
	}, {});
};

const getDefinitionByReference = (definitions, reference) => {
	const definitionNamePath = reference.$ref.split('/');
	const definitionName = definitionNamePath[definitionNamePath.length - 1];
	let source = {};

	switch (definitionNamePath[0]) {
		case '#':
			source = definitions[0] || {};
			break;
		case '#model':
			source = definitions[1] || {};
			break;
		case '#external':
			source = definitions[2] || {};
			break;
	}

	const definitionsProperties = source.properties || {};

	if (definitionsProperties[definitionName]) {
		return definitionsProperties[definitionName];
	}

	const allDefinitions = definitions.reduce((result, { properties }) => ({
		...result,
		...(properties || {})
	}), {});

	return allDefinitions[definitionName] || definitionName;
};

const getTypeByProperty = (definitions = []) => property => {
	if (Array.isArray(property.type)) {
		return getUnionTypeFromMultiple(getTypeByProperty(definitions))(property);
	}

	if (property.$ref) {
		property = getDefinitionByReference(definitions, property)
	}
	
	switch(property.type) {
		case 'jsonObject':
		case 'jsonArray':
			return getJsonType(getTypeByProperty(definitions))(property);
		case 'text':
			return getText(property);
		case 'numeric':
			return getNumeric(property);
		case 'bool':
			return 'boolean';
		case 'interval':
			return 'string';
		case 'struct':
			return getStruct(getTypeByProperty(definitions))(property);
		case 'array':
			return getArray(getTypeByProperty(definitions))(property);
		case 'map':
			return getMap(getTypeByProperty(definitions))(property);
		case undefined:
			return 'string';
		default:
			return property.type;
	}
};

const getColumn = (name, type, comment, constraints, isActivated) => ({
	[name]: { type, comment, constraints, isActivated }
});

const getColumns = (jsonSchema, areColumnConstraintsAvailable, definitions) => {
	const deactivatedColumnNames = new Set();
	let columns = Object.keys(jsonSchema.properties || {}).reduce((hash, columnName) => {
		const property = jsonSchema.properties[columnName];
		const isRequired = (jsonSchema.required || []).includes(columnName);
		const name = getName(property) || columnName;
		if (!property.isActivated) {
			deactivatedColumnNames.add(name);
		}
		
		return Object.assign(
			{},
			hash,
			getColumn(
				prepareName(name),
				getTypeByProperty(definitions)(property),
				property.description,
				areColumnConstraintsAvailable ? {
					notNull: isRequired,
					unique: property.unique,
					check: property.check,
					defaultValue: property.default
				} : {},
				property.isActivated
			)
		);
	}, {});

	if (Array.isArray(jsonSchema.oneOf)) {
		const unions = getUnionFromOneOf(getTypeByProperty(definitions))(jsonSchema);

		columns = Object.keys(unions).reduce((hash, typeName) => Object.assign(
			{},
			hash,
			getColumn(prepareName(typeName), unions[typeName])
		), columns);
	} 
	
	if (Array.isArray(jsonSchema.allOf)) {
		const unions = getUnionFromAllOf(getTypeByProperty(definitions))(jsonSchema);
		
		columns = Object.keys(unions).reduce((hash, typeName) => Object.assign(
			{},
			hash,
			getColumn(prepareName(typeName), unions[typeName])
		), columns);
	}

	return { columns, deactivatedColumnNames };
};

const getColumnStatement = ({ name, type, comment, constraints, isActivated, isParentActivated }) => {
	const commentStatement = comment ? ` COMMENT '${comment}'` : '';
	const constraintsStaitment = constraints ? getColumnConstraintsStaitment(constraints) : '';
	const isColumnActivated = isParentActivated ? isActivated : true;
	return commentDeactivatedStatements(`${name} ${type}${constraintsStaitment}${commentStatement}`, isColumnActivated);
};

const getColumnsStatement = (columns, isParentActivated) => {
	return Object.keys(columns).map((name) => {
		return getColumnStatement(Object.assign(
			{},
			columns[name],
			{ name, isParentActivated }
		))
	}).join(',\n');
};

const getColumnConstraintsStaitment = ({ notNull, unique, check, defaultValue }) => {
	const constraints = [
		(notNull && !unique) ? 'NOT NULL' : '',
		unique ? 'UNIQUE' : '',
		defaultValue ? `DEFAULT ${defaultValue}` : '',
		check ? `CHECK ${check}` : ''
	].filter(Boolean);
	const constraintsStaitment = constraints.join(' ');

	return constraintsStaitment ? ` ${constraintsStaitment} DISABLE NOVALIDATE` : '';
};

module.exports = {
	getColumns,
	getColumnsStatement,
	getColumnStatement
};
