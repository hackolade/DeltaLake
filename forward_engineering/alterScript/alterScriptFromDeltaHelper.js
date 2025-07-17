const _ = require('lodash');
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
	getModifyColumnsScripts,
	getModifyCollectionCommentsScripts,
	getUseSchemaScriptDto,
} = require('./alterScriptHelpers/alterEntityHelper');
const {
	getAddViewsScripts,
	getDeleteViewsScripts,
	getModifyViewsScripts,
} = require('./alterScriptHelpers/alterViewHelper');
const {
	commentDeactivatedStatements,
	buildScript,
	getDBVersionNumber,
	isSupportUnityCatalog,
	getContainerName,
	replaceSpaceWithUnderscore,
	prepareName,
} = require('../utils/general');
const { getModifyPkConstraintsScripts } = require('./alterScriptHelpers/entityHelpers/primaryKeyHelper');
const { getAlterRelationshipsScriptDtos } = require('./alterScriptHelpers/alterRelationshipsHelper');
const { Runtime } = require('../enums/runtime');
const { AlterScriptDto } = require('./types/AlterScriptDto');
const { getItems } = require('./alterScriptHelpers/columnHelpers/getItems');

/**
 * @param scripts {Array<string>}
 * @return {Array<string>}
 * */
const assertNoEmptyStatements = scripts => {
	return scripts
		.filter(Boolean)
		.map(script => script.trim())
		.filter(Boolean);
};

/**
 * @return {Array<AlterScriptDto>}
 * */
const getAlterContainersScriptDtos = ({ schema, isUnityCatalogSupports, provider, data }) => {
	const dbVersion = data.modelData[0].dbVersion;
	const addedScriptDtos = getItems(schema, 'containers', 'added')
		.map(getAddContainerScriptDto(isUnityCatalogSupports, dbVersion))
		.filter(Boolean);
	const deletedScriptDtos = getItems(schema, 'containers', 'deleted')
		.map(getDeleteContainerScriptDto(provider, dbVersion))
		.filter(Boolean);
	const modifiedScriptDtos = getItems(schema, 'containers', 'modified')
		.flatMap(getModifyContainerScriptDtos(provider, isUnityCatalogSupports, dbVersion))
		.filter(Boolean);

	return [...deletedScriptDtos, ...addedScriptDtos, ...modifiedScriptDtos];
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
const getAlterCollectionsScriptDtos = ({ schema, definitions, provider, data, app }) => {
	let currentSchemaName = '';

	const existingAlterStatements = new Set();
	const getCollectionScripts = (items, compMode, getScript) =>
		items.filter(item => item.compMod?.[compMode]).flatMap(getScript);

	const getColumnScripts = (items, getScript) => items.filter(item => item.properties).flatMap(getScript);

	const wrapWithUseSchema = (schemaName, scripts) => {
		if (!scripts.length) {
			return [];
		}

		if (currentSchemaName === schemaName) {
			return scripts;
		}

		currentSchemaName = schemaName;
		const useSchemaDto = getUseSchemaScriptDto({ schemaName, ddlProvider: provider });
		return [useSchemaDto, ...scripts];
	};

	const getModifiedScripts = ({ item, schemaName, getScript }) => {
		const scriptDtos = getScript(item);

		return wrapWithUseSchema(schemaName, scriptDtos);
	};

	const getSchemaName = collection =>
		replaceSpaceWithUnderscore(prepareName(getContainerName(collection.role?.compMod)));

	const getModifiedCollectionScriptsWithUseSchema = (items, compMode, getScript) => {
		return getCollectionScripts(items, compMode, collection => {
			const schemaName = getSchemaName(collection);

			return getModifiedScripts({ item: collection, schemaName, getScript });
		});
	};

	const getModifiedColumnScriptsWithUseSchema = (items, getScript) => {
		return getColumnScripts(items, item => {
			const schemaName = getSchemaName(item);

			return getModifiedScripts({ item, schemaName, getScript });
		});
	};
	const dbVersion = data.modelData[0].dbVersion;

	const getDeletedColumnsScriptsMethod = (app, definitions, provider) => {
		if (
			getDBVersionNumber(dbVersion) < Runtime.RUNTIME_SUPPORTING_MODIFYING_COLUMNS_WITHOUT_NEED_TO_RECREATE_TABLE
		) {
			return getDeleteColumnScripsForOlderRuntime(app, definitions, provider, dbVersion);
		}
		return getDeleteColumnsScripts(app, definitions, provider, dbVersion);
	};

	const getModifyColumnsScriptsMethod = (app, definitions, provider) => {
		if (
			getDBVersionNumber(dbVersion) < Runtime.RUNTIME_SUPPORTING_MODIFYING_COLUMNS_WITHOUT_NEED_TO_RECREATE_TABLE
		) {
			return getModifyColumnsScriptsForOlderRuntime(app, definitions, provider, dbVersion);
		}
		return getModifyColumnsScripts(app, definitions, provider, dbVersion);
	};

	const getModifiedCollectionPrimaryKeysScriptDtos = () => {
		let modifiedCollectionPrimaryKeysScriptDtos = [];

		if (getDBVersionNumber(dbVersion) >= Runtime.RUNTIME_SUPPORTING_PK_FK_CONSTRAINTS) {
			modifiedCollectionPrimaryKeysScriptDtos = getItems(schema, 'entities', 'modified').flatMap(collection => {
				const scripts = getModifyPkConstraintsScripts(provider)({ collection, dbVersion });

				return wrapWithUseSchema(getSchemaName(collection), scripts);
			});
		}

		return modifiedCollectionPrimaryKeysScriptDtos;
	};

	const addedCollectionsScriptDtos = getCollectionScripts(
		getItems(schema, 'entities', 'added'),
		'created',
		getAddCollectionsScripts(app, definitions, dbVersion),
	);
	const deletedCollectionsScriptDtos = getCollectionScripts(
		getItems(schema, 'entities', 'deleted'),
		'deleted',
		getDeleteCollectionsScripts(app, provider, dbVersion),
	);
	const modifiedCollectionsScriptDtos = getModifiedCollectionScriptsWithUseSchema(
		getItems(schema, 'entities', 'modified'),
		'modified',
		getModifyCollectionsScripts(app, definitions, provider, dbVersion),
	);
	const modifiedCollectionCommentsScriptDtos = getItems(schema, 'entities', 'modified').flatMap(item =>
		getModifyCollectionCommentsScripts(provider)({ collection: item, dbVersion }),
	);

	const addedColumnsItems = getItems(schema, 'entities', 'added').filter(item => !item?.compMod?.created);
	const addedColumnsScriptDtos = getColumnScripts(
		addedColumnsItems,
		getAddColumnsScripts(app, definitions, provider, dbVersion),
	);
	const {
		alterScriptDtos: addedColumnsScriptDtosWithNoDuplicates,
		existingAlterStatements: existingAlterStatementsWithAddedColumns,
	} = filterOutExistingStatements({
		alterScriptDtos: addedColumnsScriptDtos,
		existingAlterStatements,
	});

	const deletedColumnsItems = getItems(schema, 'entities', 'deleted').filter(item => !item?.compMod?.deleted);
	const deletedColumnsScriptDtos = getColumnScripts(
		deletedColumnsItems,
		getDeletedColumnsScriptsMethod(app, definitions, provider),
	);
	const {
		alterScriptDtos: deletedColumnsScriptDtosWithNoDuplicates,
		existingAlterStatements: existingAlterStatementsWithDeletedColumns,
	} = filterOutExistingStatements({
		alterScriptDtos: deletedColumnsScriptDtos,
		existingAlterStatements: existingAlterStatementsWithAddedColumns,
	});

	const modifiedColumnsScriptDtos = getModifiedColumnScriptsWithUseSchema(
		getItems(schema, 'entities', 'modified'),
		getModifyColumnsScriptsMethod(app, definitions, provider),
	);
	const { alterScriptDtos: modifiedColumnsScriptDtosWithNoDuplicates } = filterOutExistingStatements({
		alterScriptDtos: modifiedColumnsScriptDtos,
		existingAlterStatements: existingAlterStatementsWithDeletedColumns,
	});
	const modifiedCollectionPrimaryKeysScriptDtos = getModifiedCollectionPrimaryKeysScriptDtos();

	const script = [
		...deletedCollectionsScriptDtos,
		...addedCollectionsScriptDtos,
		...modifiedCollectionsScriptDtos,
		...modifiedCollectionCommentsScriptDtos,
		...deletedColumnsScriptDtosWithNoDuplicates,
		...addedColumnsScriptDtosWithNoDuplicates,
		...modifiedColumnsScriptDtosWithNoDuplicates,
		...modifiedCollectionPrimaryKeysScriptDtos,
	].filter(Boolean);

	return {
		currentSchemaName,
		script,
	};
};

/**
 * @return Array<AlterScriptDto>
 * */
const getAlterViewsScriptDtos = (schema, provider, dbVersion) => {
	/**
	 * @return Array<AlterScriptDto>
	 * */
	const getViewScripts = (views, compMode, getScript) =>
		views
			.map(view => ({ ...view, ...(view.role || {}) }))
			.filter(view => view.compMod?.[compMode])
			.map(getScript);

	/**
	 * @return Array<AlterScriptDto>
	 * */
	const getColumnScripts = (items, getScript) =>
		items
			.map(view => ({ ...view, ...(view.role || {}) }))
			.filter(view => !view.compMod?.created && !view.compMod?.deleted)
			.flatMap(getScript);
	const addedViewScriptDtos = getViewScripts(
		getItems(schema, 'views', 'added'),
		'created',
		getAddViewsScripts(provider),
	);
	const deletedViewScriptDtos = getViewScripts(
		getItems(schema, 'views', 'deleted'),
		'deleted',
		getDeleteViewsScripts(provider, dbVersion),
	);
	const modifiedViewScriptDtos = getColumnScripts(
		getItems(schema, 'views', 'modified'),
		getModifyViewsScripts(provider, dbVersion),
	);

	return [...deletedViewScriptDtos, ...addedViewScriptDtos, ...modifiedViewScriptDtos];
};

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
	const { additionalOptions = [] } = data.options || {};
	const applyDropStatements = (additionalOptions.find(option => option.id === 'applyDropStatements') || {}).value;

	const scripts = scriptDtos
		.map(dto => {
			if (dto.isActivated === false) {
				return dto.scripts.map(scriptDto => commentDeactivatedStatements(scriptDto.script, false));
			}
			if (!applyDropStatements) {
				return dto.scripts.map(scriptDto =>
					commentDeactivatedStatements(scriptDto.script, !scriptDto.isDropScript),
				);
			}
			return dto.scripts.map(scriptDto => scriptDto.script);
		})
		.flat();
	return assertNoEmptyStatements(scripts);
};

/**
 * @return {Array<AlterScriptDto>}
 * */
const getAlterScriptDtos = (schema, definitions, data, app) => {
	const provider = require('../ddlProvider/ddlProvider')(app);
	const dbVersion = data.modelData[0].dbVersion;
	const isUnityCatalogSupports = isSupportUnityCatalog(dbVersion);
	const containersScriptDtos = getAlterContainersScriptDtos({ schema, isUnityCatalogSupports, provider, data });
	const { script: collectionsScriptDtos, currentSchemaName } = getAlterCollectionsScriptDtos({
		schema,
		definitions,
		provider,
		data,
		app,
	});
	const viewsScriptDtos = getAlterViewsScriptDtos(schema, provider, dbVersion);
	let relationshipsScriptDtos = [];
	if (isUnityCatalogSupports) {
		relationshipsScriptDtos = getAlterRelationshipsScriptDtos({
			schema,
			ddlProvider: provider,
			initialSchemaName: currentSchemaName,
			options: data.options,
		});
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
};

module.exports = {
	joinAlterScriptDtosIntoAlterScript,
	getAlterScriptDtos,
};
