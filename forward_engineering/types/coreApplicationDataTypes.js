class ContainerJsonSchema {
	/**
	 * @type {string}
	 */
	name;

	/**
	 * @type {boolean}
	 */
	isActivated;
}

class ContainerStyles {
	/**
	 * @type {Object}
	 * */
	backgroundColor;
}

class EntityData {
	/**
	 * @type {string | undefined}
	 */
	collectionName;

	/**
	 * @type {boolean | undefined}
	 */
	isActivated;

	/**
	 * @type {string | undefined}
	 */
	bucketId;

	/**
	 * @type {any | undefined}
	 */
	additionalProperties;

	/**
	 * @type {boolean | undefined}
	 */
	tableIfNotExists;
}

class InternalDefinitions {
	/**
	 * @type {string}
	 */
	$schema;

	/**
	 * @type {"definitions"}
	 */
	type;

	/**
	 * @type {string}
	 */
	GUID;
}

class ModelDefinitions {
	/**
	 * @type {string}
	 */
	$schema;

	/**
	 * @type {"definitions"}
	 */
	type;

	/**
	 * @type {string}
	 */
	GUID;
}

class ExternalDefinitions {
	/**
	 * @type {string}
	 */
	$schema;

	/**
	 * @type {"externalDefinitions"}
	 */
	type;

	/**
	 * @type {string}
	 */
	GUID;
}

class FieldJsonSchema {
	/**
	 * @type {string}
	 */
	type;

	/**
	 * @type {boolean}
	 */
	isActivated;

	/**
	 * @type {string}
	 */
	mode;

	/**
	 * @type {string}
	 */
	subtype;

	/**
	 * @type {[
	 *     "compositePartitionKey",
	 *     "compositeClusteringKey",
	 *     "compositePrimaryKey",
	 *     "compositeUniqueKey",
	 * ]}
	 */
	compositeKey;

	/**
	 * @type {boolean}
	 */
	compositePartitionKey;

	/**
	 * @type {boolean}
	 */
	compositeClusteringKey;

	/**
	 * @type {boolean}
	 */
	compositePrimaryKey;

	/**
	 * @type {boolean}
	 */
	compositeUniqueKey;

	/**
	 * @type {string}
	 */
	GUID;
}

class EntityJsonSchema {
	/**
	 * @type {string}
	 */
	$schema;

	/**
	 * @type {"object"}
	 */
	type;

	/**
	 * @type {string}
	 */
	title;

	/**
	 * @type {{
	 *     [fieldName: string]: FieldJsonSchema
	 * }}
	 */
	properties;

	/**
	 * @type {boolean}
	 */
	isActivated;

	/**
	 * @type {boolean}
	 */
	additionalProperties;

	/**
	 * @type {boolean}
	 */
	tableIfNotExists;

	/**
	 * @type {string}
	 */
	GUID;
}

module.exports = {
	ContainerJsonSchema,
	ContainerStyles,
	EntityData,
	InternalDefinitions,
	ModelDefinitions,
	ExternalDefinitions,
	FieldJsonSchema,
	EntityJsonSchema,
};
