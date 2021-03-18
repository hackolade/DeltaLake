'use strict'

const { getName, prepareName } = require('./generalHelper');

const getPathById = (schema, id, path) => {
	if (schema.GUID === id) {
		return path;
	}

	if (schema.properties) {
		return Object.keys(schema.properties).reduce((newPath, propertyName) => {
			if (newPath) {
				return newPath;
			} else {
				return getPathById(schema.properties[propertyName], id, [...path, schema.properties[propertyName].GUID]);
			}
		}, undefined);
	} else if (schema.items) {
		if (Array.isArray(schema.items)) {
			return schema.items.reduce((newPath, item) => {
				if (newPath) {
					return newPath;
				} else {
					return getPathById(item, id, [...path, item.GUID]);
				}
			}, undefined);
		} else {
			return getPathById(schema.items, id, [...path, schema.items.GUID]);
		}
	}
};

const getRootItemNameById = (id, properties) => {
	const propertyName = Object.keys(properties).find(propertyName => (properties[propertyName].GUID === id));

	if (properties[propertyName] && properties[propertyName].code) {
		return prepareName(properties[propertyName].code);
	}

	return prepareName(propertyName);
};

const findFieldNameById = (id, source) => {
	let path = getPathById(source, id, []);

	if (path) {
		return getRootItemNameById(path[0], source.properties);
	} else {
		return "";
	}
};

const getNamesByIds = (ids, sources) => {
	return ids.reduce((hash, id) => {
		for (let i = 0; i < sources.length; i++) {
			const name = findFieldNameById(id, sources[i]);

			if (name) {
				return Object.assign({}, hash, { [id]: name });
			}
		}

		return hash;
	}, {});
};

const getPathsByIds = (ids, sources) => {
	return ids.map(id => {
		for (let i = 0; i < sources.length; i++) {
			const path = getPathById(sources[i], id, []);

			if (path) {
				return path;
			}
		}
	}).filter(path => path);
};

const eachProperty = (schema, path, callback) => {
	if (schema.properties) {
		return Object.keys(schema.properties).forEach((propertyName, i) => {
			const nextPath = [...path, schema.properties[propertyName].GUID];

			callback(propertyName, schema.properties[propertyName], nextPath);

			eachProperty(schema.properties[propertyName], nextPath, callback);
		});
	} else if (schema.items) {
		const items = Array.isArray(schema.items) ? schema.items : [schema.items];

		return items.forEach((item, i) => {
			const nextPath = [...path, item.GUID];

			callback(i, item, nextPath);

			eachProperty(item, nextPath, callback);
		});
	}
};

const getIdToNameHashTable = (jsonSchemas) => {
	return jsonSchemas.reduce((nameHashTable, jsonSchema) => {
		eachProperty(jsonSchema, [], (name, item, path) => {
			nameHashTable[item.GUID] = getName(item) || name;
		});

		return nameHashTable;
	}, {});
};

const getNameByPath = (idToNameHashTable, path) => {
	const name = path.map(id => {
		return idToNameHashTable[id] instanceof Number ? '$elem$' : idToNameHashTable[id];
	}).join('.');
	return prepareName(name);
};

const getPrimaryKeys = (jsonSchema) => {
	const primaryKeys = [];

	eachProperty(jsonSchema, [], (name, item, path) => {
		if (item.primaryKey) {
			primaryKeys.push(path);
		}
	});

	return primaryKeys;
};

const getItemByPath = (path, jsonSchema) => {
	if (!jsonSchema || path.length === 0) {
		return null;
	}
	let item;
	if (jsonSchema.properties) {
		item = Object.values(jsonSchema.properties).find(item => item.GUID === path[0]);
	} else if (jsonSchema.items) {
		if (Array.isArray(jsonSchema.items)) {
			item = jsonSchema.items.find(item => item.GUID === path[0]);
		} else {
			item = jsonSchema.items;
		}
	}
	if (item) {
		if (path.length === 1) {
			return item;
		}
		return getItemByPath(path.slice(1), item);
	}
	return null;
}

module.exports = {
	getPathById,
	getNamesByIds,
	getPrimaryKeys,
	getIdToNameHashTable,
	getNameByPath,
	getPathsByIds,
	getItemByPath
};
