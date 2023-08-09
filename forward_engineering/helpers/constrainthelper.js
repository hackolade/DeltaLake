const { commentDeactivatedInlineKeys } = require('../utils/generalUtils');

const getPrimaryKeyOptions = (entityJsonSchema, keysNames) => {
    if (entityJsonSchema.primaryKey && Array.isArray(entityJsonSchema.primaryKey)) {
        return entityJsonSchema.primaryKey[0] || {};
    }

    const primaryKeyFieldName = keysNames[0];
    return entityJsonSchema.properties?.[primaryKeyFieldName]?.primaryKeyOptions;
};

const getPrimaryKeyStatement = (_) => (entityJsonSchema, keysNames, deactivatedColumnNames, isParentItemActivated) => {
    const getStatement = ({ keys, constraintName, notEnforced, deferrable, initiallyDeferrable, noRely }) => {
        let statement = '';
        statement += constraintName ? `CONSTRAINT ${constraintName} ` : '';
        statement += `PRIMARY KEY (${keys})`;
        statement += notEnforced ? ' NOT ENFORCED' : '';
        statement += deferrable ? ' DEFERRABLE' : '';
        statement += initiallyDeferrable ? ' INITIALLY DEFERRED' : '';
        statement += noRely ? ' NORELY' : '';

        return statement;
    };

    if (!Array.isArray(keysNames) || !keysNames.length) {
        return '';
    }

    const options = getPrimaryKeyOptions(entityJsonSchema, keysNames);

    if (!options) {
        return '';
    }

    if (!isParentItemActivated) {
        return getStatement({ ...options, keys: keysNames.join(', ') });
    }

    const {isAllKeysDeactivated, keysString} = commentDeactivatedInlineKeys(_)(keysNames, deactivatedColumnNames);
    if (isAllKeysDeactivated) {
        return '-- ' + getStatement({ ...options, keys: keysString });
    }
    return getStatement({ ...options, keys: keysString });
};

module.exports = {
    getPrimaryKeyStatement,
}