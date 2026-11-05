const { AlterScriptDto } = require('../../types/AlterScriptDto');

/**
 * @typedef GetAlterScriptDtoFunction
 * @param fullTableName {string}
 * @param collection {Object}
 * @returns Array<AlterScriptDto>
 */

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getAddCheckConstraintsScriptsDtosFromTable = ddlProvider => (fullTableName, collection) => {
	const checkConstraints = collection?.role?.compMod?.chkConstr || {};
	const newCheckConstraints = checkConstraints.new || [];
	const oldCheckConstraints = checkConstraints.old || [];
	const isActivated = collection.role?.isActivated !== false;

	return newCheckConstraints
		.filter(newCheckConstraint => {
			if (!oldCheckConstraints.length) {
				return true;
			}

			const oldCorrespondingConstraint = oldCheckConstraints.find(
				oldCheckConstraint => oldCheckConstraint.GUID === newCheckConstraint.GUID,
			);

			if (!oldCorrespondingConstraint) {
				return true;
			}

			return (
				oldCorrespondingConstraint.chkConstrName !== newCheckConstraint.chkConstrName ||
				oldCorrespondingConstraint.constrExpression !== newCheckConstraint.constrExpression
			);
		})
		.map(newCheckConstraint => {
			return ddlProvider.setCheckConstraint(
				fullTableName,
				newCheckConstraint.chkConstrName,
				newCheckConstraint.constrExpression,
			);
		})
		.map(script => AlterScriptDto.getInstance([script], isActivated, false));
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getRemoveCheckConstraintsScriptsDtosFromTable = ddlProvider => (fullTableName, collection) => {
	const checkConstraints = collection?.role?.compMod?.chkConstr || {};
	const newCheckConstraints = checkConstraints.new || [];
	const oldCheckConstraints = checkConstraints.old || [];
	const isActivated = collection.role?.isActivated !== false;

	return oldCheckConstraints
		.filter(oldCheckConstraint => {
			if (!newCheckConstraints.length) {
				return true;
			}

			const newCorrespondingConstraint = newCheckConstraints.find(
				newCheckConstraint => newCheckConstraint.GUID === oldCheckConstraint.GUID,
			);

			if (!newCorrespondingConstraint) {
				return true;
			}

			return (
				newCorrespondingConstraint.chkConstrName !== oldCheckConstraint.chkConstrName ||
				newCorrespondingConstraint.constrExpression !== oldCheckConstraint.constrExpression
			);
		})
		.map(oldCheckConstraint => {
			return ddlProvider.dropCheckConstraint(fullTableName, oldCheckConstraint.chkConstrName);
		})
		.map(script => AlterScriptDto.getInstance([script], isActivated, true));
};

/**
 * @param ddlProvider {Object}
 * @returns {GetAlterScriptDtoFunction}
 */
const getModifyCheckConstraintsScriptDtos = ddlProvider => (fullTableName, collection) => {
	const removeCheckConstraintsScriptDtosFromTable = getRemoveCheckConstraintsScriptsDtosFromTable(ddlProvider)(
		fullTableName,
		collection,
	);
	const addCheckConstraintsScriptDtosFromTable = getAddCheckConstraintsScriptsDtosFromTable(ddlProvider)(
		fullTableName,
		collection,
	);

	return [...removeCheckConstraintsScriptDtosFromTable, ...addCheckConstraintsScriptDtosFromTable].filter(Boolean);
};

module.exports = {
	getModifyCheckConstraintsScriptDtos,
};
