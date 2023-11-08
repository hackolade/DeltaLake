const {
    getDeleteContainerScriptDto,
    getModifyContainerScriptDtos,
    getAddContainerScriptDto,
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
    getDBVersionNumber, isSupportUnityCatalog
} = require('../utils/general');
const {getModifyPkConstraintsScripts} = require("./alterScriptHelpers/entityHelpers/primaryKeyHelper");
const {
    getDeleteForeignKeyScripts,
    getAddForeignKeyScripts,
    getModifyForeignKeyScripts
} = require("./alterScriptHelpers/alterRelationshipsHelper");
const {Runtime} = require("../enums/runtime");

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
 * @param scripts {Array<string>}
 * @return {Array<string>}
 * */
const assertNoEmptyStatements = (scripts) => {
    return scripts
        .filter(Boolean)
        .map(script => script.trim())
        .filter(Boolean);
}

/**
 * @return Array<AlterScriptDto>
 * */
const getAlterContainersScriptDtos = (schema, isUnityCatalogSupports, provider, _) => {
    const addedScriptDtos = getItems(schema, 'containers', 'added').map(
        getAddContainerScriptDto(isUnityCatalogSupports)
    ).filter(Boolean);
    const deletedScriptDtos = getItems(schema, 'containers', 'deleted').map(
        getDeleteContainerScriptDto(provider)
    ).filter(Boolean);
    const modifiedScriptDtos = getItems(schema, 'containers', 'modified').flatMap(
        getModifyContainerScriptDtos(provider, _, isUnityCatalogSupports)
    ).filter(Boolean);

    return [
        ...deletedScriptDtos,
        ...addedScriptDtos,
        ...modifiedScriptDtos
    ];
};

/**
 * @return Array<AlterScriptDto>
 * */
const getAlterCollectionsScriptDtos = ({schema, definitions, provider, data, _, app}) => {
    const getCollectionScripts = (items, compMode, getScript) =>
        items.filter(item => item.compMod?.[compMode]).flatMap(getScript);

    const getColumnScripts = (items, getScript) => items.filter(item => !item.compMod).flatMap(getScript);
    const dbVersionNumber = getDBVersionNumber(data.modelData[0].dbVersion);

    const getDeletedColumnsScriptsMethod = (app, definitions, provider) => {
        if (dbVersionNumber < Runtime.RUNTIME_SUPPORTING_MODIFYING_COLUMNS_WITHOUT_NEED_TO_RECREATE_TABLE) {
            return getDeleteColumnScripsForOlderRuntime(app, definitions, provider, dbVersionNumber);
        }
        return getDeleteColumnsScripts(app, definitions, provider, dbVersionNumber)
    }

    const getModifyColumnsScriptsMethod =  (app, definitions, provider) => {
        if (dbVersionNumber < Runtime.RUNTIME_SUPPORTING_MODIFYING_COLUMNS_WITHOUT_NEED_TO_RECREATE_TABLE) {
            return getModifyColumnsScriptsForOlderRuntime(app, definitions, provider, dbVersionNumber);
        }
        return getModifyColumnsScripts(app, definitions, provider, dbVersionNumber)
    }

    const addedCollectionsScriptDtos = getCollectionScripts(
        getItems(schema, 'entities', 'added'),
        'created',
        getAddCollectionsScripts(app, definitions, dbVersionNumber)
    );
    const deletedCollectionsScriptDtos = getCollectionScripts(
        getItems(schema, 'entities', 'deleted'),
        'deleted',
        getDeleteCollectionsScripts(app, provider)
    );
    const modifiedCollectionsScriptDtos = getCollectionScripts(
        getItems(schema, 'entities', 'modified'),
        'modified',
        getModifyCollectionsScripts(app, definitions, provider, dbVersionNumber)
    );
    const modifiedCollectionCommentsScriptDtos = getItems(schema, 'entities', 'modified')
        .flatMap(item => getModifyCollectionCommentsScripts(provider)(item));

    let modifiedCollectionPrimaryKeysScriptDtos = [];
    if (dbVersionNumber >= Runtime.RUNTIME_SUPPORTING_PK_FK_CONSTRAINTS) {
        modifiedCollectionPrimaryKeysScriptDtos = getItems(schema, 'entities', 'modified')
            .flatMap(item => getModifyPkConstraintsScripts(_, provider)(item));
    }

    const addedColumnsScriptDtos = getColumnScripts(
        getItems(schema, 'entities', 'added'),
        getAddColumnsScripts(app, definitions, provider, dbVersionNumber)
    );
    const deletedColumnsScriptDtos = getColumnScripts(
        getItems(schema, 'entities', 'deleted'),
        getDeletedColumnsScriptsMethod(app, definitions, provider)
    );
    const modifiedColumnsScriptDtos = getColumnScripts(
        getItems(schema, 'entities', 'modified'),
        getModifyColumnsScriptsMethod(app, definitions, provider)
    );

    return [
        ...deletedCollectionsScriptDtos,
        ...addedCollectionsScriptDtos,
        ...modifiedCollectionsScriptDtos,
        ...modifiedCollectionCommentsScriptDtos,
        ...modifiedCollectionPrimaryKeysScriptDtos,
        ...deletedColumnsScriptDtos,
        ...addedColumnsScriptDtos,
        ...modifiedColumnsScriptDtos
    ];
};

/**
 * @return Array<AlterScriptDto>
 * */
const getAlterViewsScriptDtos = (schema, provider, _) => {

    /**
     * @return Array<AlterScriptDto>
     * */
    const getViewScripts = (views, compMode, getScript) =>
        views
            .map(view => ({...view, ...(view.role || {})}))
            .filter(view => view.compMod?.[compMode]).map(getScript);


    /**
     * @return Array<AlterScriptDto>
     * */
    const getColumnScripts = (items, getScript) => items
        .map(view => ({...view, ...(view.role || {})}))
        .filter(view => !view.compMod?.created && !view.compMod?.deleted).flatMap(getScript);

    const addedViewScriptDtos = getViewScripts(
        getItems(schema, 'views', 'added'),
        'created',
        getAddViewsScripts(_)
    );
    const deletedViewScriptDtos = getViewScripts(
        getItems(schema, 'views', 'deleted'),
        'deleted',
        getDeleteViewsScripts(provider)
    );
    const modifiedViewScriptDtos = getColumnScripts(
        getItems(schema, 'views', 'modified'),
        getModifyViewsScripts(provider, _)
    );

    return [
        ...deletedViewScriptDtos,
        ...addedViewScriptDtos,
        ...modifiedViewScriptDtos,
    ]
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
const getAlterStatementsWithCommentedUnwantedDDL = (scriptDtos, data) => {
    const {additionalOptions = []} = data.options || {};
    const applyDropStatements = (additionalOptions.find(option => option.id === 'applyDropStatements') || {}).value;

    const scripts = scriptDtos.map((dto) => {
        if (dto.isActivated === false) {
            return dto.scripts
                .map((scriptDto) => commentDeactivatedStatements(scriptDto.script, false));
        }
        if (!applyDropStatements) {
            return dto.scripts
                .map((scriptDto) => commentDeactivatedStatements(scriptDto.script, !scriptDto.isDropScript));
        }
        return dto.scripts.map((scriptDto) => scriptDto.script);
    })
        .flat();
    return assertNoEmptyStatements(scripts);
};

/**
 * @return {Array<AlterScriptDto>}
 * */
const getAlterScriptDtos = (schema, definitions, data, app) => {
    const provider = require('../ddlProvider/ddlProvider')(app);
    const _ = app.require('lodash');
    const isUnityCatalogSupports = isSupportUnityCatalog(data.modelData[0].dbVersion);
    const containersScriptDtos = getAlterContainersScriptDtos(schema, isUnityCatalogSupports, provider, _);
    const collectionsScriptDtos = getAlterCollectionsScriptDtos({schema, definitions, provider, data, _, app});
    const viewsScriptDtos = getAlterViewsScriptDtos(schema, provider, _);
    let relationshipsScriptDtos = [];
    if (isUnityCatalogSupports) {
        relationshipsScriptDtos = getAlterRelationshipsScriptDtos({schema, ddlProvider: provider, _});
    }

    return [
        ...containersScriptDtos,
        ...collectionsScriptDtos,
        ...viewsScriptDtos,
        ...relationshipsScriptDtos,
    ];
};

/**
 * @param alterScriptDtos {Array<AlterScriptDto>}
 * @param data {{
 *     options: {
 *         id: string,
 *         value: any,
 *     },
 * }}
 * @return {string}
 * */
const joinAlterScriptDtosIntoAlterScript = (alterScriptDtos, data) => {
    const scriptAsStringsWithCommentedUnwantedDDL = getAlterStatementsWithCommentedUnwantedDDL(alterScriptDtos, data);
    return buildScript(scriptAsStringsWithCommentedUnwantedDDL);
}

module.exports = {
    joinAlterScriptDtosIntoAlterScript,
    getAlterScriptDtos,
}
