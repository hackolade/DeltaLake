let dependencies = {};

const setDependencies = app => {
    dependencies.lodash = app.require('lodash');
};

module.exports = {
    setDependencies,
    dependencies
};