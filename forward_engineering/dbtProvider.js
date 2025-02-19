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
	 * @type {AppInstance}
	 */
	#appInstance;

	/**
	 * @param {{ appInstance: AppInstance }}
	 */
	constructor({ appInstance }) {
		this.#appInstance = appInstance;
	}

	/**
	 * @param {{ appInstance }}
	 * @returns {DbtProvider}
	 */
	static createDbtProvider({ appInstance }) {
		return new DbtProvider({ appInstance });
	}

	/**
	 * @param {{ columnDefinition: ColumnDefinition }}
	 * @returns {{ type: string }}
	 */
	decorateType({ columnDefinition }) {
		return getTypeByProperty()(columnDefinition);
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
}

module.exports = DbtProvider;
