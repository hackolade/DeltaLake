const _ = require('lodash');

/**
 * @param {CoreData} data
 * @return {{
 * isSampleGenerationRequired: boolean,
 * shouldAppendSamplesToTheResultScript: boolean
 * }}
 */
const getSampleGenerationOptions = data => {
	const insertSamplesOption =
		_.get(data, 'options.additionalOptions', []).find(option => option.id === 'INCLUDE_SAMPLES') || {};
	const isSampleGenerationRequired = Boolean(insertSamplesOption?.value);
	// Append to result script if the plugin is invoked from cli and do not append if it's invoked from GUI app
	const shouldAppendSamplesToTheResultScript = data.options.origin !== 'ui';

	return {
		isSampleGenerationRequired,
		shouldAppendSamplesToTheResultScript,
	};
};

module.exports = {
	getSampleGenerationOptions,
};
