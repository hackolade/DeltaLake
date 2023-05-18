'use strict'

const sqlFormatter = require('sql-formatter');
const {RESERVED_WORDS_AS_ARRAY} = require('../enums/reservedWords');
const {DropStatements} = require("../enums/dropStatements");

/**
 * @typedef {((args: any) => string) | ((args: any) => ChainFunction)} ChainFunction
 * */

/**
 * @return {ChainFunction}
 * */
const buildStatement = (mainStatement, isActivated) => {
    let composeStatements = (...statements) => {
        return statements.reduce((result, statement) => result + statement, mainStatement);
    };

    const chain = (...args) => {
        if (args.length) {
            composeStatements = composeStatements.bind(null, getStatement(...args));

            return chain;
        }

        return commentDeactivatedStatements(composeStatements(), isActivated);
    };

    /**
     * @param condition {boolean}
     * @param statement {string}
     * @return {string}
     * */
    const getStatement = (condition, statement) => {
        if (condition && statement === ')') {
            return '\n)';
        }
        if (statement === ';') {
            return statement;
        }

        if (condition) {
            return '\n' + indentString(statement);
        }

        return '';
    };

    return chain;
};

const isEscaped = (name) => /`[\s\S]*`/.test(name);

const prepareName = (name = '') => {
    const containSpaces = /[\s-]/g;
    if (containSpaces.test(name) && !isEscaped(name)) {
        return `\`${name}\``;
    } else if (RESERVED_WORDS_AS_ARRAY.includes(name.toLowerCase())) {
        return `\`${name}\``;
    } else if (name === '') {
        return '';
    } else if (!isNaN(name)) {
        return `\`${name}\``;
    }
    return name;
};
const replaceSpaceWithUnderscore = (name = '') => {
    return name.replace(/\s/g, '_');
}
const getName = (entity) => entity.code || entity.collectionName || entity.name || '';

const getRelationshipName = (relationship) => relationship.name || '';

const getTab = (tabNum, configData) => Array.isArray(configData) ? (configData[tabNum] || {}) : {};
const indentString = (str, tab = 4) => (str || '').split('\n').map(s => ' '.repeat(tab) + s).join('\n');

const descriptors = {};
const getTypeDescriptor = (typeName) => {
    if (descriptors[typeName]) {
        return descriptors[typeName];
    }

    try {
        descriptors[typeName] = require(`../../types/${typeName}.json`);

        return descriptors[typeName];
    } catch (e) {
        return {};
    }
};

/**
 * @param script {string}
 * @return boolean
 * */
const isScriptADropStatement = (script) => {
    return Object.values(DropStatements).some(statement => script.includes(statement));
}

/**
 * @param script {string}
 * @return boolean
 * */
const doesScriptContainDropStatement = (script) => {
    return script.split('\n')
        .filter(Boolean)
        .some(scriptLine => isScriptADropStatement(scriptLine));
}

/**
 * @param statement {string}
 * @param isActivated {boolean}
 * @return {string}
 * */
const commentDeactivatedStatements = (statement, isActivated = true) => {
    if (isActivated) {
        return statement;
    }
    const insertBeforeEachLine = (statement, insertValue) =>
        statement
            .split('\n')
            .map((line) => `${insertValue}${line}`)
            .join('\n');

    return insertBeforeEachLine(statement, '-- ');
}

const commentDeactivatedInlineKeys = (_) => (keys, deactivatedKeyNames) => {
    const [activatedKeys, deactivatedKeys] = _.partition(
        keys,
        (key) =>
            !(
                deactivatedKeyNames.has(key) ||
                deactivatedKeyNames.has(key.slice(1, -1))
            )
    );
    if (activatedKeys.length === 0) {
        return {isAllKeysDeactivated: true, keysString: deactivatedKeys.join(', ')};
    }
    if (deactivatedKeys.length === 0) {
        return {isAllKeysDeactivated: false, keysString: activatedKeys.join(', ')};
    }

    return {isAllKeysDeactivated: false, keysString: `${activatedKeys.join(', ')} /*, ${deactivatedKeys.join(', ')} */`}
}

const removeRedundantTrailingCommaFromStatement = (_) => (statement) => {
    const splitedStatement = statement.split('\n');
    if (splitedStatement.length < 4 || !splitedStatement[splitedStatement.length - 2].trim().startsWith('--')) {
        return statement;
    }
    const lineWithTrailingCommaIndex = _.findLastIndex(splitedStatement, line => {
        if (line.trim() !== ');' && !line.trim().startsWith('--')) {
            return true;
        }
    });
    if (lineWithTrailingCommaIndex !== -1) {
        splitedStatement[lineWithTrailingCommaIndex] = `${splitedStatement[lineWithTrailingCommaIndex].slice(0, -1)} -- ,`;
        return splitedStatement.join('\n');
    }
    return statement;
}

const getCleanedUrl = url => {
    if (url.endsWith('/')) {
        return url.slice(0, -1)
    }
    return url;
}

const encodeStringLiteral = (str = '') => {
    return str.replace(/(['\\])/gi, '\\$1').replace(/\n/gi, '\\n');
}

const wrapInSingleQuotes = (str = '') => {
    return `'${encodeStringLiteral(str)}'`;
}

const wrapInTicks = (str = '') => {
    return `\`${str}\``;
}

const buildScript = (statements) => {
    const script = statements.filter((statement) => statement).join('\n\n');
    const formattedScript = sqlFormatter.format(script, {indent: '    '}) + '\n';

    return formattedScript.replace(/\{ \{ (.+?) } }/g, '{{$1}}');
};

const getContainerName = compMod => compMod.keyspaceName;

const getEntityData = (object, properties = [], type = 'new') =>
    properties.reduce((transformObject, property) => {
        const value = object[property]?.[type];
        return {
            ...transformObject,
            ...(value ? {[property]: value} : {}),
        };
    }, {});

const getFullEntityName = (dbName, entityName) => dbName ? `${dbName}.${entityName}` : entityName;

const generateFullEntityName = entity => {
    const compMod = entity?.role?.compMod || {};
    const entityData = entity?.role || {};
    const dbName = replaceSpaceWithUnderscore(getContainerName(compMod));
    const entityName = replaceSpaceWithUnderscore(getName(entityData));
    return getFullEntityName(dbName, entityName);
};

const getEntityNameFromCollection = (collection) => {
    const entityData = collection?.role || {};
    return replaceSpaceWithUnderscore(getName(entityData));
}

const getEntityProperties = entity => {
    const propertiesInRole = entity?.role?.properties || {};
    const propertiesInEntity = entity?.properties || {};
    return {...propertiesInEntity || {}, ...propertiesInRole};
};

const getEntityName = (compMod = {}, type = 'collectionName') => {
    return {
        oldName: replaceSpaceWithUnderscore(compMod.code?.old || compMod[type]?.old),
        newName: replaceSpaceWithUnderscore(compMod.code?.new || compMod[type]?.new),
    }
};

const prepareScript = (...scripts) => scripts.filter(Boolean);

const getDBVersionNumber = dbVersionString => ~~(dbVersionString.split(' ')[1]);

const getDifferentItems = (_) => (newItems = [], oldItems = []) => {
    const intersection = _.intersectionWith(newItems, oldItems, _.isEqual);
    return {
        add: _.xorWith(newItems, intersection, _.isEqual),
        drop: _.xorWith(oldItems, intersection, _.isEqual)
    };
};

const compareProperties = (_) => ({new: newProperty, old: oldProperty}) => {
    if (!newProperty && !oldProperty) {
        return;
    }
    return !_.isEqual(newProperty, oldProperty);
};

const getIsChangeProperties = (_) => (compMod, properties) =>
    properties.some(property => compareProperties(_)(compMod[property] || {}));

module.exports = {
    buildStatement,
    getName,
    getTab,
    indentString,
    getTypeDescriptor,
    getRelationshipName,
    prepareName,
    replaceSpaceWithUnderscore,
    commentDeactivatedStatements,
    commentDeactivatedInlineKeys,
    removeRedundantTrailingCommaFromStatement,
    getCleanedUrl,
    encodeStringLiteral,
    buildScript,
    wrapInSingleQuotes,
    wrapInTicks,
    doesScriptContainDropStatement,
    getEntityData,
    getFullEntityName,
    generateFullEntityName,
    getEntityNameFromCollection,
    getEntityProperties,
    getContainerName,
    getEntityName,
    prepareScript,
    getDBVersionNumber,
    getIsChangeProperties,
    getDifferentItems,
};
