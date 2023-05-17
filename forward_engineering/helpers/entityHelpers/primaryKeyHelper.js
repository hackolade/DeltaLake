


/**
 * @return {(entitiesJsonSchema: Object) => Array<string>}
 **/
const getCreatePKConstraintsScripts = (app) => (entitiesJsonSchema) => {
    const _ = app.require('lodash');
    const ddlProvider = require('../../ddlProvider/ddlProvider')(app);

    return [];
}

module.exports = {
    getCreatePKConstraintsScripts,
}
