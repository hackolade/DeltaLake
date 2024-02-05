const {getDatabaseStatement, getDatabaseAlterStatement, getBucketKeyword} = require('../../helpers/databaseHelper')
const {getEntityData, getIsChangeProperties, prepareName, replaceSpaceWithUnderscore} = require('../../utils/general');
const {getAlterCommentsScriptDtos} = require("./containerHelpers/commentsHelper");
const {AlterScriptDto} = require("../types/AlterScriptDto");


const containerProperties = ['comment', 'location', 'dbProperties', 'description'];
const otherContainerProperties = ['name', 'location'];

const getContainerData = compMod => getEntityData(compMod, containerProperties);

/**
 * @param container {Object}
 * @return {string | undefined}
 * */
const getDatabaseName = container => {
    const {role} = container;
    return replaceSpaceWithUnderscore(prepareName(role?.code || role?.name));
};

/**
 * @param {boolean} isUnityCatalogSupports
 * @param {number} dbVersionNumber
 * @return {(container: AlterScriptDto | undefined) => AlterScriptDto | undefined}
 * */
const getAddContainerScriptDto = (isUnityCatalogSupports, dbVersionNumber) => container => {
    const dataContainer = [container.role || {}]
    const script = getDatabaseStatement(dataContainer, isUnityCatalogSupports, dbVersionNumber);
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
const getDeleteContainerScriptDto = (provider, dbVersionNumber) => container => {
    const databaseName = getDatabaseName(container);
    const script = provider.dropDatabase(databaseName, getBucketKeyword(dbVersionNumber));
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
const getModifyContainerScriptDtos = (provider, _, isUnityCatalogSupports, dbVersionNumber) => container => {
    const compMod = _.get(container, 'role.compMod', {});
    const names = extractNamesFromCompMod(compMod);

    const didPropertiesChange = getIsChangeProperties(_)({...compMod, name: names}, otherContainerProperties);
    const containerData = {...getContainerData(compMod), name: names.new};
    if (!didPropertiesChange) {
        const alterCommentsScriptDtos = getAlterCommentsScriptDtos(provider)(container);
        const alterDatabaseScript = getDatabaseAlterStatement([containerData], dbVersionNumber);
        const unsettedTags = getUnsetesTags()
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
            ...unsettedTags
        ];
    }
    const databaseName = getDatabaseName({role: {...containerData, name: names.old}});
    const deletedScript = provider.dropDatabase(databaseName, getBucketKeyword(dbVersionNumber));
    const addedScriptDto = getAddContainerScriptDto(isUnityCatalogSupports, dbVersionNumber)({role: containerData});

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
