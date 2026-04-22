/**
 * @typedef {import('./types/coreApplicationTypes').App} AppInstance
 * @typedef {import('./types/types').ColumnDefinition} ColumnDefinition
 * @typedef {import('./types/types').ConstraintDto} ConstraintDto
 * @typedef {import('./types/types').JsonSchema} JsonSchema
 */

const { getTypeByProperty } = require('./helpers/columnHelper');
const keyHelper = require('./helpers/keyHelper');

class DbtProvider {
	/**
	 * @returns {DbtProvider}
	 */
	static createDbtProvider() {
		return new DbtProvider();
	}

	/**
	 * @param {{ columnDefinition: ColumnDefinition }}
	 * @returns {string}
	 */
	decorateType({ columnDefinition }) {
		const type = getTypeByProperty([], '')(columnDefinition);
		const isComplexType = /^(array|struct)/i.test(type);

		return isComplexType ? type.replace(/<[\s\S]+>$/, '<>') : type;
	}

	/**
	 * @param {{ jsonSchema: JsonSchema }}
	 * @returns {ConstraintDto[]}
	 */
	getCompositeKeyConstraints({ jsonSchema }) {
		const compositePrimaryKeys = keyHelper.getCompositePrimaryKeys({ jsonSchema });
		const compositeUniqueKeys = keyHelper.getCompositeUniqueKeys({ jsonSchema });

		return [...compositePrimaryKeys, ...compositeUniqueKeys];
	}

	/**
	 * @param {{ columnDefinition: ColumnDefinition; jsonSchema: JsonSchema }}
	 * @returns {ConstraintDto[]}
	 */
	getColumnConstraints({ columnDefinition, jsonSchema }) {
		return keyHelper.getColumnConstraints({ columnDefinition });
	}

	/**
	 * @param {{ modelData: object[]; containerData: object[]; entityData: object[];}}
	 * @returns {{ databaseName?: string, schemaName?: string }}
	 */
	getEntityProperties({ modelData, containerData, entityData }) {
		return {
			schemaName: containerData?.[0]?.code ?? containerData?.[0]?.name,
		};
	}
}

module.exports = DbtProvider;
