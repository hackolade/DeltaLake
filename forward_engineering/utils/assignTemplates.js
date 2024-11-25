const template = (modifiers = '') => new RegExp('\\$\\{(.*?)}', modifiers);
const getAllTemplates = str => str.match(template('gi')) || [];
const parseTemplate = str => (str.match(template('i')) || [])[1];

const assignTemplates = (str, templates) => {
	return getAllTemplates(str).reduce((result, item) => {
		const templateName = parseTemplate(item);

		return result.replace(item, () => {
			return templates[templateName] || templates[templateName] === 0 ? templates[templateName] : '';
		});
	}, str);
};

module.exports = assignTemplates;
