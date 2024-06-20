let dependencies = {};

const setDependencies = app => {
	dependencies.lodash = app.require('lodash');
	dependencies.async = app.require('async');
};

module.exports = {
	setDependencies,
	dependencies,
};
