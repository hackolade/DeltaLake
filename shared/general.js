const { RESERVED_WORDS_AS_ARRAY } = require('./reservedWords');

const isEscaped = name => /`[\s\S]*`/.test(name);

const checkContainSpecialCharacters = (name = '') => {
	return !/^\w+$/.test(name);
};

const wrapInTicks = (str = '') => {
	return `\`${str}\``;
};

const prepareName = (name = '') => {
	const containSpacesRegexp = /[\s-]/g;
	const isEscapedName = isEscaped(name);
	const containSpaces = containSpacesRegexp.test(name);
	const containSpecialCharacters = checkContainSpecialCharacters(name);
	const includeReversedWords = RESERVED_WORDS_AS_ARRAY.includes(name.toLowerCase());
	const containVariableExpression = /\$\{.+}/g.test(name);

	const shouldBeWrappedInTicks =
		!isEscapedName &&
		(containSpaces || containSpecialCharacters || includeReversedWords || containVariableExpression);

	if (name === '') {
		return '';
	} else if (shouldBeWrappedInTicks) {
		name = name.replace('`', '``');

		return wrapInTicks(name);
	} else {
		return name;
	}
};

module.exports = {
	prepareName,
	wrapInTicks,
};
