const {getDatabaseStatement, getDatabaseAlterStatement} = require('../databaseHelper')
const {getEntityData, getIsChangeProperties} = require('../../utils/generalUtils');
const {getAlterCommentsScriptDtos} = require("./containerHelpers/commentsHelper");

/**
 * @typedef {import('./types/AlterScriptDto').AlterScriptDto} AlterScriptDto
 * */

const containerProperties = ['comment', 'location', 'dbProperties', 'description'];
const otherContainerProperties = ['name', 'location'];

const getContainerData = compMod => getEntityData(compMod, containerProperties);

/**
 * @param container {Object}
 * @return {string | undefined}
 * */
const getDatabaseName = container => {
    const {role} = container;
    return role?.code || role?.name;
};

/**
 * @param container {Object}
 * @return {AlterScriptDto | undefined}
 * */
const getAddContainerScriptDto = container => {
    const dataContainer = [container.role || {}]
    const script = getDatabaseStatement(dataContainer);
    if (!script?.length) {
        return undefined;
    }
    return {
        scripts: [{
            isDropScript: false,
            script,
        }]
    }
};

/**
 * @return {(container: Object) => AlterScriptDto}
 * */
const getDeleteContainerScriptDto = provider => container => {
    const databaseName = getDatabaseName(container);
    const script = provider.dropDatabase(databaseName);
    return {
        scripts: [{
            isDropScript: true,
            script,
        }]
    }
};

/**
 * @param compMod {Object}
 * @return {{
 *     new: string,
 *     old: string,
 * }}
 * */
const extractNamesFromCompMod = (compMod) => {
    const extractName = type => compMod.code?.[type] || compMod.name?.[type];
    return {
        new: extractName('new'),
        old: extractName('old')
    };
}

/**
 * @return {(container: Object) => Array<AlterScriptDto>}
 * */
const getModifyContainerScriptDtos = (provider, _) => container => {
    const compMod = _.get(container, 'role.compMod', {});
    const names = extractNamesFromCompMod(compMod);

    const didPropertiesChange = getIsChangeProperties(_)({...compMod, name: names}, otherContainerProperties);
    const containerData = {...getContainerData(compMod), name: names.new};
    if (!didPropertiesChange) {
        const alterCommentsScriptDtos = getAlterCommentsScriptDtos(provider)(container);
        const alterDatabaseScript = getDatabaseAlterStatement([containerData]);
        if (!alterDatabaseScript?.length) {
            return alterCommentsScriptDtos;
        }
        return [
            ...alterCommentsScriptDtos,
            {
                scripts: [{
                    script: alterDatabaseScript,
                    isDropScript: false,
                }]
            },
        ];
    }
    const databaseName = getDatabaseName({role: {...containerData, name: names.old}});
    const deletedScript = provider.dropDatabase(databaseName);
    const addedScriptDto = getAddContainerScriptDto({role: containerData});

    return [
        {
            scripts: [{
                script: deletedScript,
                isDropScript: true,
            }]
        },
        addedScriptDto
    ].filter(Boolean);
};

module.exports = {
    getAddContainerScriptDto,
    getDeleteContainerScriptDto,
    getModifyContainerScriptDtos
}
