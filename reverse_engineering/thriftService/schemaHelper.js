const _ = require('lodash');

const cleanContent = (str) => {
	const start = str.indexOf('<');
	const end = str.lastIndexOf('>');
	
	if (start < 0 || end < 0) {
		return str;
	} else {
		return str.slice(start + 1, end);
	}
};

const getType = str => {
	const i = str.indexOf('<');
	
	return i < 0 ? str : str.slice(0, i)
};

const splitContent = (content) => {
	const getStack = (inItem, outItem) => {
		const stack = [];
		return {
			put(item) {
				if (item === inItem) {
					stack.push(item);
				} else if (item === outItem) {
					stack.pop();
				}
			},
			length() {
				return stack.length;
			}
		};
	};

	const guillemetStack = getStack('<', '>');
	const braceStack = getStack('(', ')');
	let contentPart = [];
	const result = [];
	const arrayContent = content.split('');
	
	for (let i = 0; i < arrayContent.length; i++) {
		const symb = arrayContent[i];
		
		guillemetStack.put(symb);
		braceStack.put(symb);
		const stackLength = guillemetStack.length() + braceStack.length();
		
		if (stackLength !== 0) {
			contentPart.push(symb);        
		} else if (symb === ',') {
			result.push(contentPart.join('').trim());
			contentPart = [];
		} else {
			contentPart.push(symb);
		}
	}
	result.push(contentPart.join('').trim());
	
	return result;
};

const parseStruct = (splittedContent, sample = {}) => {
	const getKeyName = (keyItem) => {
		return keyItem.slice(0, keyItem.indexOf(':'));
	};
	
	return splittedContent.reduce((schema, keyItem) => {
		const keyName = getKeyName(keyItem).trim();
		const keyContent = keyItem.slice(keyName.length + 1).trim();
		const childSchema = getJsonSchema(keyContent, sample[keyName]);

		return setProperty(keyName, childSchema, schema);
	}, {
		type: "struct",
		properties: {}
	});
};

const getMapKeyType = (childItem) => {
	if ([ "numeric", "text" ].indexOf(childItem.type) !== -1) {
		return {
			keyType: childItem.type,
			keySubtype: childItem.mode,

		};
	} else {
		return {
			keyType: "text",
			keySubtype: "string"
		};
	}
};

const getMapSubtype = (type) => {
	const subtype = type => `map<${type}>`;

	switch(type) {
		case "text": return subtype("txt");
		case "numeric": return subtype("num");
		case "bool": return subtype("bool");
		case "timestamp": return subtype("ts");
		case "date": return subtype("date");
		case "interval": return subtype("intrvl");
		case "array": return subtype("array");
		case "map": return subtype("map");
		case "struct": return subtype("struct");
		case "union": return subtype("union");
	}
};

const parseMap = ([ keySubtype, subtype ], sample = {}) => {
	const childName = Object.keys(sample)[0] || "New column";
	const subtypeSchema = getJsonSchema(subtype, sample[childName]);
	const keySubtypeSchema = getJsonSchema(keySubtype);
	
	return setProperty(childName, Object.assign({}, subtypeSchema), Object.assign({
		type: "map",
		subtype: getMapSubtype(subtypeSchema.type),
		properties: {}
	}, getMapKeyType(keySubtypeSchema)));
};

const getArraySubtypeByType = (type) => {
	const subtype = (type) => `array<${type}>`;
	switch(type) {
		case "text": return subtype("txt");
		case "numeric": return subtype("num");
		case "timestamp": return subtype("ts");
		case "date": return subtype("date");
		case "interval": return subtype("intrvl");
		case "array": return subtype("array");
		case "map": return subtype("map");
		case "struct": return subtype("struct");
		case "union": return subtype("union");
	}
};

const parseArray = ([ content ], sample = []) => {
	const items = getJsonSchema(content, sample[0]);

	return setProperty("New column", items, {
		type: "array",
		subtype: getArraySubtypeByType(items.type),
		items: {}
	});
};

const parsePrimitive = ([ type ]) => {
	const preparedType = type.trim();
	const hiveType = preparedType.replace(/\(.*?\)$/, "");
	const modifiers = _.get(preparedType.match(/\((.*?)\)$/), "[1]", "").split(",");
	
	switch (hiveType) {
		case "string":
		case "varchar":
		case "char":
			return {
				type: "text",
				mode: hiveType,
				maxLength: modifiers[0] || ""
			};
		case "int":
		case "tinyint":
		case "smallint":
		case "bigint":
		case "float":
		case "double":
			return {
				type: "numeric",
				mode: hiveType
			};
		case "decimal":
			return {
				type: "numeric",
				mode: hiveType,
				precision: modifiers[0] || "",
				scale: modifiers[1] || ""
			};
		case "boolean":
			return {
				type: "bool"
			};
		case "interval_day_time":
		case "interval_year_month":
			return {
				type: "interval"
			};
		case "binary":
		case "timestamp":
		case "date":
		case "interval":
		default:
			return {
				type: hiveType
			};
	}
};

const parseUnion = (types, sample) => {
	const isComplex = (type) => [ 'struct', 'map', 'array' ].indexOf(type) !== -1;
	const jsonSchemas = types.map(getJsonSchema);
	const complexTypes = jsonSchemas.some((schema) => isComplex(schema.type)); 
	
	if (!complexTypes) {
		return {
			type: _.uniq(jsonSchemas.map(schema => schema.type))
		};
	}

	return {
		type: "union",
		subSchemas: jsonSchemas
	};
};

const getParserByType = (type) => {
	switch (type) {
		case 'struct': return parseStruct;
		case 'map': return parseMap;
		case 'array': return parseArray;
		case 'uniontype': return parseUnion;
		default: return parsePrimitive;
	}
};

const getJsonSchema = (str, sample) => {
	const type = getType(str);
	const content = splitContent(cleanContent(str));
	
	return getParserByType(type)(content, sample);
};

const getOneOf = (subSchemas, columnName) => {
	return subSchemas.map(subSchema => {
		return {
			type: "object",
			properties: {
				[columnName]: subSchema
			}
		};
	})
};

const getChoice = (jsonSchema, subSchemas, columnName) => {
	const oneOf = getOneOf(subSchemas, columnName);
	
	if (jsonSchema["allOf"]) {
		jsonSchema["allOf"].push({ oneOf });
	} else if (!jsonSchema["oneOf"]) {
		jsonSchema["oneOf"] = oneOf;
	} else {
		const oldOneOf = jsonSchema["oneOf"];
		delete jsonSchema["oneOf"];
		jsonSchema["allOf"] = [
			{ oneOf: oldOneOf },
			{ oneOf }
		];
	}

	return jsonSchema;
};

const setProperty = (columnName, subSchema, jsonSchema) => {
	if (subSchema.type === "union") {
		return getChoice(jsonSchema, subSchema.subSchemas, columnName);
	} else if (jsonSchema.type === "array") {
		jsonSchema.items = subSchema;
	} else {
		if (!jsonSchema.properties) {
			jsonSchema.properties = {};
		}
		jsonSchema.properties[columnName] = subSchema;
	}

	return jsonSchema;
};

module.exports = {
	getJsonSchema,
	getChoice,
	getArraySubtypeByType,
	getMapSubtype,
	getMapKeyType,
};
