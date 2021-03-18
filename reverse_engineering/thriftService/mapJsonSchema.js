
const mapJsonSchema = (_) => (jsonSchema, parentJsonSchema, callback, key) => {
	const mapProperties = (properties, mapper) =>
		Object.keys(properties).reduce((newProperties, propertyName) => {
			const schema = mapper(properties[propertyName], propertyName);

			if (_.isEmpty(schema)) {
				return newProperties;
			}

			return { ...newProperties, [propertyName]: schema };
		}, {});
	const mapItems = (items, mapper) => {
		if (Array.isArray(items)) {
			return items.map((jsonSchema, i) => mapper(jsonSchema, i)).filter(item => !_.isEmpty(item));
		} else if (_.isPlainObject(items)) {
			return mapper(items, 0);
		} else {
			return items;
		}
	};
	const mapChoices = (parentJsonSchema, subSchemas, mapper) => {
		let subSchemasUpdated = mapItems(subSchemas, mapper);

		if (!Array.isArray(subSchemasUpdated)) {
			return subSchemasUpdated;
		}

		subSchemasUpdated = subSchemasUpdated.filter(subSchema => subSchema.properties);

		if (subSchemasUpdated.length > 1) {
			return subSchemasUpdated;
		}

		const subSchema = subSchemasUpdated[0];

		if (!_.has(subSchema, 'properties')) {
			return subSchemasUpdated;
		}

		if (!_.has(parentJsonSchema, 'properties')) {
			parentJsonSchema.properties = {};
		}

		Object.keys(subSchema.properties).forEach((key) => {
			if (_.has(parentJsonSchema, 'properties.' + key)) {
				return;
			} 

			parentJsonSchema.properties[key] = subSchema.properties[key];
		});

		return [];
	};
	const applyTo = (properties, jsonSchema, mapper) => {
		return properties.reduce((jsonSchema, propertyName) => {
			if (!jsonSchema[propertyName]) {
				return jsonSchema;
			}

			const schema = mapper(jsonSchema[propertyName], propertyName);

			if (_.isEmpty(schema)) {
				const copySchema = Object.assign({}, jsonSchema);

				delete copySchema[propertyName];

				return copySchema;
			}

			return Object.assign({}, jsonSchema, {
				[propertyName]: schema,
			});
		}, jsonSchema);
	};
	if (!_.isPlainObject(jsonSchema)) {
		return jsonSchema;
	}
	const copyJsonSchema = Object.assign({}, jsonSchema);
	const mapper = _.partial(mapJsonSchema(_), _, copyJsonSchema, callback);
	const propertiesLike = ['properties', 'definitions', 'patternProperties'];
	const itemsLike = ['items', 'not'];
	const choices = ['oneOf', 'allOf', 'anyOf'];

	const jsonSchemaWithNewProperties = applyTo(propertiesLike, copyJsonSchema, _.partial(mapProperties, _, mapper));
	const updatedItems = applyTo(itemsLike, jsonSchemaWithNewProperties, _.partial(mapItems, _, mapper));
	const newJsonSchema = applyTo(choices, updatedItems, _.partial(mapChoices, updatedItems, _, mapper));

	return callback(newJsonSchema, parentJsonSchema, key);
};

module.exports = mapJsonSchema;
