let dependencies = {};

const setDependencies = app => {
	dependencies.async = app.require('async');
};

module.exports = {
	setDependencies,
	dependencies,
};
