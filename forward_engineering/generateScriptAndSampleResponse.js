/**
 * @param {string} script
 * @param {string} sample
 * @return {Array<{ title: string, script: string, mode: string }>}
 * */
const getScriptAndSampleResponse = (script, sample) => {
	const mode = 'sql';
	return [
		{
			title: 'DDL script',
			script,
			mode,
		},
		{
			title: 'Sample data',
			script: sample,
			mode,
		},
	];
};

module.exports = {
	getScriptAndSampleResponse,
};
