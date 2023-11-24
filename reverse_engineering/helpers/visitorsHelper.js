/**
 * @typedef TableProperty
 * @property propertyKey {string}
 * @property propertyValue {string}
 */

/**
 * @typedef CheckConstraint
 * @property chkConstrName {string}
 * @property constrExpression {string}
 */

/**
 * @param tableProperties {Array<TableProperty>}
 * @returns {Array<CheckConstraint>}
 */
const getCheckConstraintsFromTableProperties = (tableProperties) => {
    const checkConstraintRegExp = /.constraints./;
    const rawCheckConstraints = tableProperties.filter(tableProperty => {
        return checkConstraintRegExp.test(tableProperty.propertyKey);
    });

    if (!rawCheckConstraints.length) {
        return [];
    }

    return rawCheckConstraints.map(constraint => {
        const indexBegin = constraint.propertyKey.lastIndexOf('.') + 1;
        const name = constraint.propertyKey.substring(indexBegin);

        return {
            chkConstrName: name,
            constrExpression: constraint.propertyValue
        };
    });
};

/**
 * @param tableProperties {Array<TableProperty>}
 * @returns {Array<TableProperty>}
 */
const getFilteredTableProperties = (tableProperties) => {
    const checkConstraintRegExp = /.constraints./;

    return tableProperties.filter(tableProperty => {
        return !checkConstraintRegExp.test(tableProperty.propertyKey);
    });
};

const normalizeTableProperties = (tableProperties) => {
    if (Array.isArray(tableProperties)) {
        return tableProperties.length > 1
            ? tableProperties
            : tableProperties[0];
    }

    return tableProperties;
}

module.exports = {
    getCheckConstraintsFromTableProperties,
    getFilteredTableProperties
    getFilteredTableProperties,
    normalizeTableProperties
}