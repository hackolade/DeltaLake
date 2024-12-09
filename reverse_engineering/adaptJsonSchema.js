const _ = require('lodash');
const mapJsonSchema = require('./thriftService/mapJsonSchema');

const adaptJsonSchema = (data, logger, callback, app) => {
	try {
		const jsonSchema = JSON.parse(data.jsonSchema);
		const result = mapJsonSchema(jsonSchema, {}, (schema, parentJsonSchema, key) => {
			if (schema.type === 'array' && !schema.subtype) {
				return {
					...schema,
					subtype: getArraySubtypeByChildren(schema),
				};
			} else {
				return schema;
			}
		});

		callback(null, {
			...data,
			jsonSchema: JSON.stringify(result),
		});
	} catch (error) {
		const err = {
			message: error.message,
			stack: error.stack,
		};
		logger.log('error', err, 'Remove nulls from JSON Schema');
		callback(err);
	}
};

const getArraySubtypeByChildren = arraySchema => {
	const subtype = type => `array<${type}>`;

	if (!arraySchema.items) {
		return;
	}

	if (Array.isArray(arraySchema.items) && _.uniq(arraySchema.items.map(item => item.type)).length > 1) {
		return subtype('union');
	}

	let item = Array.isArray(arraySchema.items) ? arraySchema.items[0] : arraySchema.items;

	if (!item) {
		return;
	}

	switch (item.type) {
		case 'string':
		case 'text':
			return subtype('txt');
		case 'number':
		case 'numeric':
		case 'integer':
			return subtype('num');
		case 'interval':
			return subtype('intrvl');
		case 'object':
		case 'struct':
			return subtype('struct');
		case 'array':
			return subtype('array');
		case 'map':
			return subtype('map');
		case 'union':
			return subtype('union');
		case 'timestamp':
			return subtype('ts');
		case 'date':
			return subtype('date');
	}

	if (item.items) {
		return subtype('array');
	}

	if (item.properties) {
		return subtype('struct');
	}
};

module.exports = {
	adaptJsonSchema,
};
