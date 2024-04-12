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
const {AlterScriptDto} = require("./types/AlterScriptDto");


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
 * @return {Array<AlterScriptDto>}
 * */
const getAlterContainersScriptDtos = ({ schema, isUnityCatalogSupports, provider, _, data }) => {
    const dbVersion = data.modelData[0].dbVersion;
    const addedScriptDtos = getItems(schema, 'containers', 'added').map(
        getAddContainerScriptDto(isUnityCatalogSupports, dbVersion)
    ).filter(Boolean);
    const deletedScriptDtos = getItems(schema, 'containers', 'deleted').map(
        getDeleteContainerScriptDto(provider, dbVersion)
    ).filter(Boolean);
    const modifiedScriptDtos = getItems(schema, 'containers', 'modified').flatMap(
        getModifyContainerScriptDtos(provider, _, isUnityCatalogSupports, dbVersion)
    ).filter(Boolean);

    return [
        ...deletedScriptDtos,
        ...addedScriptDtos,
        ...modifiedScriptDtos
    ];
};

/**
 * @typedef FilterOutExistingStatementsParams
 * @type {object}
 * @property {Array<AlterScriptDto>} alterScriptDtos
 * @property {Set<string>} existingAlterStatements
 */
/**
 * @param {FilterOutExistingStatementsParams} param
 * @returns {FilterOutExistingStatementsParams}
 */
const filterOutExistingStatements = ({ alterScriptDtos, existingAlterStatements }) => {
	const filteredAlterScriptDtos = alterScriptDtos
		.filter(Boolean)
		.flatMap(alterScriptDto =>
			alterScriptDto?.scripts
				.filter(scriptDto => !existingAlterStatements.has(scriptDto?.script))
				.map(scriptDto =>
					AlterScriptDto.getInstance([scriptDto.script], alterScriptDto.isActivated, scriptDto.isDropScript),
				),
		)
		.filter(Boolean);

	const filteredExistingAlterScriptStatements = new Set([
		...Array.from(existingAlterStatements),
		...alterScriptDtos.flatMap(dto => dto?.scripts.map(scriptDto => scriptDto?.script)).filter(Boolean),
	]);

	return { alterScriptDtos: filteredAlterScriptDtos, existingAlterStatements: filteredExistingAlterScriptStatements };
};

/**
 * @return Array<AlterScriptDto>
 * */
const getAlterCollectionsScriptDtos = ({schema, definitions, provider, data, _, app}) => {
    const existingAlterStatements = new Set();
    const getCollectionScripts = (items, compMode, getScript) =>
        items.filter(item => item.compMod?.[compMode]).flatMap(getScript);

    const getColumnScripts = (items, getScript) => items.filter(item => !item.compMod).flatMap(getScript);
    const dbVersion = data.modelData[0].dbVersion;

    const getDeletedColumnsScriptsMethod = (app, definitions, provider) => {
        if (getDBVersionNumber(dbVersion) < Runtime.RUNTIME_SUPPORTING_MODIFYING_COLUMNS_WITHOUT_NEED_TO_RECREATE_TABLE) {
            return getDeleteColumnScripsForOlderRuntime(app, definitions, provider, dbVersion);
        }
        return getDeleteColumnsScripts(app, definitions, provider, dbVersion)
    }

    const getModifyColumnsScriptsMethod =  (app, definitions, provider) => {
        if (getDBVersionNumber(dbVersion) < Runtime.RUNTIME_SUPPORTING_MODIFYING_COLUMNS_WITHOUT_NEED_TO_RECREATE_TABLE) {
            return getModifyColumnsScriptsForOlderRuntime(app, definitions, provider, dbVersion);
        }
        return getModifyColumnsScripts(app, definitions, provider, dbVersion)
    }

    const addedCollectionsScriptDtos = getCollectionScripts(
        getItems(schema, 'entities', 'added'),
        'created',
        getAddCollectionsScripts(app, definitions, dbVersion)
    );
    const deletedCollectionsScriptDtos = getCollectionScripts(
        getItems(schema, 'entities', 'deleted'),
        'deleted',
        getDeleteCollectionsScripts(app, provider, dbVersion)
    );
    const modifiedCollectionsScriptDtos = getCollectionScripts(
        getItems(schema, 'entities', 'modified'),
        'modified',
        getModifyCollectionsScripts(app, definitions, provider, dbVersion)
    );
    const modifiedCollectionCommentsScriptDtos = getItems(schema, 'entities', 'modified')
        .flatMap(item => getModifyCollectionCommentsScripts(provider)({ collection: item, dbVersion }));

    let modifiedCollectionPrimaryKeysScriptDtos = [];
    if (getDBVersionNumber(dbVersion) >= Runtime.RUNTIME_SUPPORTING_PK_FK_CONSTRAINTS) {
        modifiedCollectionPrimaryKeysScriptDtos = getItems(schema, 'entities', 'modified')
            .flatMap(item => getModifyPkConstraintsScripts(_, provider)({ collection: item, dbVersion }));
    }

    const addedColumnsScriptDtos = getColumnScripts(
			getItems(schema, 'entities', 'added'),
			getAddColumnsScripts(app, definitions, provider, dbVersion),
		);
    const {
        alterScriptDtos: addedColumnsScriptDtosWithNoDuplicates,
        existingAlterStatements: existingAlterStatementsWithAddedColumns,
    } = filterOutExistingStatements({
        alterScriptDtos: addedColumnsScriptDtos,
        existingAlterStatements,
    });

    const deletedColumnsScriptDtos = getColumnScripts(
        getItems(schema, 'entities', 'deleted'),
        getDeletedColumnsScriptsMethod(app, definitions, provider),
    );
    const {
        alterScriptDtos: deletedColumnsScriptDtosWithNoDuplicates,
        existingAlterStatements: existingAlterStatementsWithDeletedColumns,
    } = filterOutExistingStatements({
        alterScriptDtos: deletedColumnsScriptDtos,
        existingAlterStatements: existingAlterStatementsWithAddedColumns,
    });

    const modifiedColumnsScriptDtos = getColumnScripts(
        getItems(schema, 'entities', 'modified'),
        getModifyColumnsScriptsMethod(app, definitions, provider),
    );
    const {
        alterScriptDtos: modifiedColumnsScriptDtosWithNoDuplicates,
    } = filterOutExistingStatements({
        alterScriptDtos: modifiedColumnsScriptDtos,
        existingAlterStatements: existingAlterStatementsWithDeletedColumns,
    });

	return [
		...deletedCollectionsScriptDtos,
		...addedCollectionsScriptDtos,
		...modifiedCollectionsScriptDtos,
		...modifiedCollectionCommentsScriptDtos,
		...modifiedCollectionPrimaryKeysScriptDtos,
		...deletedColumnsScriptDtosWithNoDuplicates,
		...addedColumnsScriptDtosWithNoDuplicates,
		...modifiedColumnsScriptDtosWithNoDuplicates,
	].filter(Boolean);
};

/**
 * @return Array<AlterScriptDto>
 * */
const getAlterViewsScriptDtos = (schema, provider, _, dbVersion) => {

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
        getDeleteViewsScripts(provider, dbVersion)
    );
    const modifiedViewScriptDtos = getColumnScripts(
        getItems(schema, 'views', 'modified'),
        getModifyViewsScripts(provider, _, dbVersion)
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
    const dbVersion = data.modelData[0].dbVersion;
    const isUnityCatalogSupports = isSupportUnityCatalog(dbVersion);
    const containersScriptDtos = getAlterContainersScriptDtos({ schema, isUnityCatalogSupports, provider, _, data });
    const collectionsScriptDtos = getAlterCollectionsScriptDtos({ schema, definitions, provider, data, _, app });
    const viewsScriptDtos = getAlterViewsScriptDtos(schema, provider, _, dbVersion);
    let relationshipsScriptDtos = [];
    if (isUnityCatalogSupports) {
        relationshipsScriptDtos = getAlterRelationshipsScriptDtos({ schema, ddlProvider: provider, _ });
    }

    return [...containersScriptDtos, ...collectionsScriptDtos, ...viewsScriptDtos, ...relationshipsScriptDtos];
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
