const {
    getAddContainerScript,
    getDeleteContainerScript,
    getModifyContainerScript,
} = require('./alterScriptHelpers/alterContainerHelper');
const {
    getAddCollectionsScripts,
    getDeleteCollectionsScripts,
    getModifyCollectionsScripts,
    getDeleteColumnsScripts,
    getDeleteColumnScripsForOlderRuntime,
    getModifyColumnsScriptsForOlderRuntime,
    getAddColumnsScripts,
    getModifyColumnsScripts, getModifyCollectionCommentsScripts
} = require('./alterScriptHelpers/alterEntityHelper');
const {
    getAddViewsScripts,
    getDeleteViewsScripts,
    getModifyViewsScripts,
} = require('./alterScriptHelpers/alterViewHelper');
const {
    commentDeactivatedStatements,
    buildScript,
    doesScriptContainDropStatement,
    getDBVersionNumber
} = require('../utils/generalUtils');
const {getModifyPkConstraintsScripts} = require("./alterScriptHelpers/entityHelpers/primaryKeyHelper");
const {
    getDeleteForeignKeyScripts,
    getAddForeignKeyScripts,
    getModifyForeignKeyScripts
} = require("./alterScriptHelpers/alterRelationshipsHelper");

/**
 * @typedef {import('./alterScriptHelpers/types/AlterScriptDto').AlterScriptDto} AlterScriptDto
 * */

/**
 * @param entity {Object}
 * @param nameProperty {string}
 * @param modify {'added' | 'deleted' | 'modified'}
 * @return Array<Object>
 * */
const getItems = (entity, nameProperty, modify) =>
    []
        .concat(entity.properties?.[nameProperty]?.properties?.[modify]?.items)
        .filter(Boolean)
        .map(items => Object.values(items.properties)[0]);

/**
 * @return Array<string>
 * */
const getAlterContainersScripts = (schema, provider) => {
    const addedScripts = getItems(schema, 'containers', 'added').map(
        getAddContainerScript
    );
    const deletedScripts = getItems(schema, 'containers', 'deleted').map(
        getDeleteContainerScript(provider)
    );
    const modifiedScripts = getItems(schema, 'containers', 'modified').flatMap(
        getModifyContainerScript(provider)
    );
    return [...deletedScripts, ...addedScripts, ...modifiedScripts];
};

/**
 * @return Array<string>
 * */
const getAlterCollectionsScripts = ({schema, definitions, provider, data, _, app}) => {
    const getCollectionScripts = (items, compMode, getScript) =>
        items.filter(item => item.compMod?.[compMode]).flatMap(getScript);

    const getColumnScripts = (items, getScript) => items.filter(item => !item.compMod).flatMap(getScript);
    const dbVersionNumber = getDBVersionNumber(data.modelData[0].dbVersion);
    const getDeletedColumnsScriptsMethod = dbVersionNumber < 11 ? getDeleteColumnScripsForOlderRuntime : getDeleteColumnsScripts;
    const getModifyColumnsScriptsMethod = dbVersionNumber < 11 ? getModifyColumnsScriptsForOlderRuntime : getModifyColumnsScripts;

    const addedCollectionsScripts = getCollectionScripts(
        getItems(schema, 'entities', 'added'),
        'created',
        getAddCollectionsScripts(app, definitions)
    );
    const deletedCollectionsScripts = getCollectionScripts(
        getItems(schema, 'entities', 'deleted'),
        'deleted',
        getDeleteCollectionsScripts(provider)
    );
    const modifiedCollectionsScripts = getCollectionScripts(
        getItems(schema, 'entities', 'modified'),
        'modified',
        getModifyCollectionsScripts(app, definitions, provider)
    );
    const modifiedCollectionCommentsScripts = getItems(schema, 'entities', 'modified')
        .flatMap(item => getModifyCollectionCommentsScripts(provider)(item));
    const modifiedCollectionPrimaryKeysScripts = getItems(schema, 'entities', 'modified')
        .flatMap(item => getModifyPkConstraintsScripts(_, provider)(item));

    const addedColumnsScripts = getColumnScripts(
        getItems(schema, 'entities', 'added'),
        getAddColumnsScripts(app, definitions, provider)
    );
    const deletedColumnsScripts = getColumnScripts(
        getItems(schema, 'entities', 'deleted'),
        getDeletedColumnsScriptsMethod(app, definitions, provider)
    );
    const modifiedColumnsScripts = getColumnScripts(
        getItems(schema, 'entities', 'modified'),
        getModifyColumnsScriptsMethod(app, definitions, provider)
    );

    return [
        ...deletedCollectionsScripts,
        ...addedCollectionsScripts,
        ...modifiedCollectionsScripts,
        ...modifiedCollectionCommentsScripts,
        ...modifiedCollectionPrimaryKeysScripts,
        ...deletedColumnsScripts,
        ...addedColumnsScripts,
        ...modifiedColumnsScripts,
    ];
};

/**
 * @return Array<string>
 * */
const getAlterViewsScripts = (schema, provider) => {
    const getViewScripts = (views, compMode, getScript) =>
        views
            .map(view => ({...view, ...(view.role || {})}))
            .filter(view => view.compMod?.[compMode]).map(getScript);

    const getColumnScripts = (items, getScript) => items
        .map(view => ({...view, ...(view.role || {})}))
        .filter(view => !view.compMod?.created && !view.compMod?.deleted).flatMap(getScript);

    const addedViewScripts = getViewScripts(
        getItems(schema, 'views', 'added'),
        'created',
        getAddViewsScripts
    );
    const deletedViewScripts = getViewScripts(
        getItems(schema, 'views', 'deleted'),
        'deleted',
        getDeleteViewsScripts(provider)
    );
    const modifiedViewScripts = getColumnScripts(
        getItems(schema, 'views', 'modified'),
        getModifyViewsScripts(provider)
    );

    return [
        ...deletedViewScripts,
        ...addedViewScripts,
        ...modifiedViewScripts,
    ];
};

/**
 * @return Array<AlterScriptDto>
 * */
const getAlterRelationshipsScriptDtos = ({schema, ddlProvider, _}) => {
    const deletedRelationships = getItems(schema, 'relationships', 'deleted')
        .filter(relationship => relationship.role?.compMod?.deleted);
    const addedRelationships = getItems(schema, 'relationships', 'added')
        .filter(relationship => relationship.role?.compMod?.created);
    const modifiedRelationships = getItems(schema, 'relationships', 'modified');

    const deleteFkScripts = getDeleteForeignKeyScripts(ddlProvider, _)(deletedRelationships);
    const addFkScripts = getAddForeignKeyScripts(ddlProvider, _)(addedRelationships);
    const modifiedFkScripts = getModifyForeignKeyScripts(ddlProvider, _)(modifiedRelationships);

    return [
        ...deleteFkScripts,
        ...addFkScripts,
        ...modifiedFkScripts,
    ];
}

/**
 * @param scriptDtos {Array<AlterScriptDto>},
 * @param data {{
 *     options: {
 *         id: string,
 *         value: any,
 *     },
 * }}
 * @return {Array<string>}
 * */
const getScriptsWithCommentedDDL = (scriptDtos, data) => {
    const {additionalOptions = []} = data.options || {};
    const applyDropStatements = (additionalOptions.find(option => option.id === 'applyDropStatements') || {}).value;

    return scriptDtos.map((dto) => {
        if (!dto.isActivated) {
            return dto.scripts
                .map((scriptDto) => commentDeactivatedStatements(scriptDto.script, false));
        }
        if (!applyDropStatements) {
            return dto.scripts
                .map((scriptDto) => commentDeactivatedStatements(scriptDto.script, scriptDto.isDropScript));
        }
        return dto.scripts.map((scriptDto) => scriptDto.script);
    })
        .flat()
        .filter(Boolean)
        .map(script => script.trim());
};

/**
 * @return {Array<AlterScriptDto>}
 * */
const getAlterScriptDtos = (schema, definitions, data, app) => {
    const provider = require('../ddlProvider/ddlProvider')(app);
    const _ = app.require('lodash');
    const containersScripts = getAlterContainersScripts(schema, provider);
    const collectionsScripts = getAlterCollectionsScripts({schema, definitions, provider, data, _, app});
    const viewsScripts = getAlterViewsScripts(schema, provider);

    const scriptDtos = containersScripts
        .concat(collectionsScripts, viewsScripts)
        .filter(Boolean)
        .map(script => script.trim())
        .map(script => ({
            isActivated: true,
            scripts: [{
                isDropScript: doesScriptContainDropStatement(script),
                script
            }]
        }));

    const relationshipsScriptDtos = getAlterRelationshipsScriptDtos({schema, ddlProvider: provider, _});

    return scriptDtos.concat(relationshipsScriptDtos);
};

const getAlterScript = (schema, definitions, data, app) => {
    const alterScriptDtos = getAlterScriptDtos(schema, definitions, data, app);
    const scripts = getScriptsWithCommentedDDL(alterScriptDtos, data);
    return joinScriptsAndFormat(scripts);
};

const joinScriptsAndFormat = scripts => {
    const formatScripts = buildScript(scripts);
    return formatScripts.split(';').map(script => script.trim()).join(';\n\n');
};

module.exports = {
    getAlterScript
}
