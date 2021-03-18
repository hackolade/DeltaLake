'use strict'

const RESERVED_WORDS = require('./reserverWords');
const { dependencies } = require('./appDependencies');
let _;

const setDependencies = ({ lodash }) => _ = lodash;

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

	const getStatement = (condition, statement) => {
		if (statement === ')') {
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

const isEscaped = (name) => /\`[\s\S]*\`/.test(name);

const prepareName = name => {
	const containSpaces = /\s/g;
	if (containSpaces.test(name) && !isEscaped(name)) {
		return `\`${name}\``;
	} else if (RESERVED_WORDS.includes(name.toLowerCase())) {
		return `\`${name}\``;
	}
	return name;
};
const replaceSpaceWithUnderscore = (name = '') => {
	return name.replace(/\s/g, '_');
}
const getName = (entity) => entity.code || entity.collectionName || entity.name || '';
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

const commentDeactivatedInlineKeys = (keys, deactivatedKeyNames) => {
	setDependencies(dependencies);

	const [activatedKeys, deactivatedKeys] = _.partition(
		keys,
		(key) =>
			!(
				deactivatedKeyNames.has(key) ||
				deactivatedKeyNames.has(key.slice(1, -1))
			)
	);
	if (activatedKeys.length === 0) {
		return { isAllKeysDeactivated: true, keysString: deactivatedKeys.join(', ') };
	}
	if (deactivatedKeys.length === 0) {
		return { isAllKeysDeactivated: false, keysString: activatedKeys.join(', ') };
	}

	return { isAllKeysDeactivated: false, keysString: `${activatedKeys.join(', ')} /*, ${deactivatedKeys.join(', ')} */` }
}

const removeRedundantTrailingCommaFromStatement = (statement) => {
	setDependencies(dependencies);
	
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
		splitedStatement[lineWithTrailingCommaIndex] = `${splitedStatement[lineWithTrailingCommaIndex].slice(0,-1)} -- ,`;
		return splitedStatement.join('\n');
	}
	return statement;
} 

module.exports = {
	buildStatement,
	getName,
	getTab,
	indentString,
	getTypeDescriptor,
	prepareName,
	replaceSpaceWithUnderscore,
	commentDeactivatedStatements,
	commentDeactivatedInlineKeys,
	removeRedundantTrailingCommaFromStatement,
};
