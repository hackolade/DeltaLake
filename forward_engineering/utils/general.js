'use strict'

const sqlFormatter = require('@sqltools/formatter');
const {RESERVED_WORDS_AS_ARRAY} = require('../enums/reservedWords');
const {Runtime} = require("../enums/runtime");

const MAX_STANDARD_ASCII_SYMBOL_CODE = 127;

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

const isExtendedAsciiCharacter = (char) => char.charCodeAt(0) > MAX_STANDARD_ASCII_SYMBOL_CODE;

const containExtendedAsciiCharacters = (name = '') => {
    return name.split('').some(isExtendedAsciiCharacter);
}

const prepareName = (name = '') => {
    const containSpacesRegexp = /[\s-]/g;
    const isEscapedName = isEscaped(name);
    const containSpaces = containSpacesRegexp.test(name);
    const containExtendedAsciiChars = containExtendedAsciiCharacters(name)
    const includeReversedWords = RESERVED_WORDS_AS_ARRAY.includes(name.toLowerCase());
	const containVariableExpression = /\$\{.+\}/g.test(name);

    const shouldBeWrappedInTicks = !isEscapedName
        && (containSpaces || containExtendedAsciiChars || includeReversedWords || containVariableExpression);

    if (name === '') {
        return ''
    } else if (shouldBeWrappedInTicks) {
        return wrapInTicks(name);
    } else {
        return name;
    }
};
const replaceSpaceWithUnderscore = (name = '') => {
    return name.replace(/\s/g, '_');
}

const replaceDotWithUnderscore = (name = '') => {
	return name.replace(/\./g, '_');
}

const getName = (entity) => entity.code || entity.collectionName || entity.name || '';

const getRelationshipName = (relationship) => {
	return replaceDotWithUnderscore(replaceSpaceWithUnderscore(relationship.name || ''));
};

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

const wrapInBrackets = (str = '') => {
    return /^\(\S+\)$/.test(str) ? str : `(${str})`;
}

const buildScript = (statements) => {
    const nonEmptyScripts = statements.filter((statement) => statement);
    const formattedScripts = nonEmptyScripts.map(
        script => sqlFormatter.format(script, { indent: '    ', linesBetweenQueries: 2 })
            .replace(/\{ \{ (.+?) } }/g, '{{$1}}')
    );

    return formattedScripts.join('\n\n') + '\n\n';
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
    const dbName = replaceSpaceWithUnderscore(prepareName(getContainerName(compMod)));
    const entityName = replaceSpaceWithUnderscore(prepareName(getName(entityData)));
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

/**
 * @return {Array<any>}
 * */
const prepareScript = (...scripts) => scripts.filter(Boolean);

/**
 * @param dbVersionString {string}
 * @return {number}
 * */
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

const isSupportUnityCatalog = (dbVersion = '') => {
    const runtimeVersion = getDBVersionNumber(dbVersion);
    return runtimeVersion >= Runtime.MINIMUM_UNITY_CATALOG_SUPPORT_VERSION;
}

const isSupportNotNullConstraints = (dbVersion = '') => {
    const runtimeVersion = getDBVersionNumber(dbVersion);
    return runtimeVersion >= Runtime.RUNTIME_SUPPORTING_NOT_NULL_CONSTRAINTS;
}

/**
 * @param compMod {Record<string, any>}
 * @param propertiesToCheck {Array<string>}
 * @return {boolean}
 * */
const checkFieldPropertiesChanged = (compMod, propertiesToCheck) => {
    return propertiesToCheck.some(prop => compMod?.oldField[prop] !== compMod?.newField[prop]);
};

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
    getCleanedUrl,
    encodeStringLiteral,
    buildScript,
    wrapInSingleQuotes,
    wrapInTicks,
    wrapInBrackets,
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
    isSupportUnityCatalog,
    isSupportNotNullConstraints,
    checkFieldPropertiesChanged,
};
