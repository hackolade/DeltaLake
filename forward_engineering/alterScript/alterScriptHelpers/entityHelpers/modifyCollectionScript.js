const _ = require('lodash');
const {
	getIsChangeProperties,
	generateFullEntityName,
	getEntityData,
	getEntityName,
	getFullEntityName,
	getContainerName,
	getEntityProperties,
	wrapInSingleQuotes,
	isSupportUnityCatalog,
	isSupportNotNullConstraints,
	checkLiquidClusteringPropertyChanged,
	executeUnlessStreaming,
} = require('../../../utils/general');
const { getTableStatement } = require('../../../helpers/tableHelper');
const { AlterScriptDto } = require('../../types/AlterScriptDto');
const { getModifiedTablePropertiesScriptDtos } = require('./modifyPropertiesHelper');
const { getModifyCheckConstraintsScriptDtos } = require('./checkConstraintsHelper');
const { getModifyUnityEntityTagsScriptDtos } = require('./alterUnityTagsHelper');
const { getPropertiesNamesByGUIDs } = require('./primaryKeyHelper');

const tableProperties = [
	'compositeClusteringKey',
	'compositePartitionKey',
	'isActivated',
	'numBuckets',
	'skewedby',
	'skewedOn',
	'skewStoredAsDir',
	'sortedByKey',
	'storedAsTable',
	'temporaryTable',
	'using',
	'rowFormat',
	'fieldsTerminatedBy',
	'fieldsescapedBy',
	'collectionItemsTerminatedBy',
	'mapKeysTerminatedBy',
	'linesTerminatedBy',
	'nullDefinedAs',
	'inputFormatClassname',
	'outputFormatClassname',
];
const otherTableProperties = [
	'code',
	'collectionName',
	'tableProperties',
	'description',
	'properties',
	'serDeLibrary',
	'serDeProperties',
	'location',
];

const hydrateSerDeProperties = (compMod, name) => {
	const { serDeProperties, serDeLibrary } = compMod;
	return {
		properties: !_.isEqual(serDeProperties?.new, serDeProperties?.old) && serDeProperties?.new,
		serDe: !_.isEqual(serDeLibrary?.new, serDeLibrary?.old) && serDeLibrary?.new,
		name,
	};
};

const hydrateAlterTableName = compMod => {
	const { newName, oldName } = getEntityName(compMod);
	if ((!newName && !oldName) || newName === oldName) {
		return {};
	}
	return {
		oldName: getFullEntityName(getContainerName(compMod), oldName),
		newName: getFullEntityName(getContainerName(compMod), newName),
	};
};

const hydrateCollection = (entity, definitions) => {
	const compMod = _.get(entity, 'role.compMod', {});
	const entityData = _.get(entity, 'role', {});
	const properties = getEntityProperties(entity);
	const containerData = { name: getContainerName(compMod) };
	return [[containerData], [entityData], { ...entityData, properties }, definitions];
};

/**
 * @return {(collection: any, definitions: any, dbVersion: any) => {
 *         type: 'modify' | 'new',
 *         script: Array<AlterScriptDto>
 * }}
 * */
const getDropAndRecreateCollectionScriptDtos = (app, ddlProvider) => (collection, definitions, dbVersion) => {
	const compMod = _.get(collection, 'role.compMod', {});
	const fullCollectionName = generateFullEntityName({ entity: collection, dbVersion });
	const roleData = getEntityData(compMod, tableProperties.concat(otherTableProperties));
	const hydratedCollection = hydrateCollection(
		{
			...collection,
			role: { ...collection.role, ...roleData },
		},
		definitions,
	);
	const arePkFkConstraintsAvailable = isSupportUnityCatalog(dbVersion);
	const areNotNullConstraintsAvailable = isSupportNotNullConstraints(dbVersion);
	const addCollectionScript = getTableStatement(app)(
		...hydratedCollection,
		arePkFkConstraintsAvailable,
		areNotNullConstraintsAvailable,
		null,
		dbVersion,
		true,
	);
	const deleteCollectionScript = ddlProvider.dropTable(fullCollectionName);
	return {
		type: 'new',
		script: [
			AlterScriptDto.getInstance([deleteCollectionScript], true, true),
			AlterScriptDto.getInstance([addCollectionScript], true, false),
		].filter(Boolean),
	};
};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => AlterScriptDto | undefined}
 * */
const getModifyLocationScriptDto =
	(app, ddlProvider) =>
	({ collection, dbVersion }) => {
		const compMod = _.get(collection, 'role.compMod', {});
		const location = _.get(compMod, 'location', {});
		const oldLocation = location.old;
		const newLocation = location.new;

		if (oldLocation !== newLocation) {
			const fullCollectionName = generateFullEntityName({ entity: collection, dbVersion });
			const ddlLocation = wrapInSingleQuotes(newLocation || '');
			const script = ddlProvider.setTableLocation({
				location: ddlLocation,
				fullTableName: fullCollectionName,
			});
			return AlterScriptDto.getInstance([script], true, false);
		}
		return undefined;
	};

const getModifyClusteringScriptDto =
	({ ddlProvider }) =>
	({ collection, dbVersion }) => {
		const compMod = _.get(collection, 'role.compMod', {});
		const compositeClusteringKeys = _.get(compMod, 'compositeClusteringKey', {});
		const oldCompositeClusteringKeys = compositeClusteringKeys.old ?? [];
		const newCompositeClusteringKeys = compositeClusteringKeys.new ?? [];

		if (_.isEqual(oldCompositeClusteringKeys, newCompositeClusteringKeys)) {
			return;
		}

		const keyIds = newCompositeClusteringKeys.map(({ keyId }) => keyId);
		const keyNames = getPropertiesNamesByGUIDs(collection, keyIds);
		const clustering = keyNames.length ? `(${keyNames.join(', ')})` : 'NONE';
		const fullTableName = generateFullEntityName({ entity: collection, dbVersion });
		const script = ddlProvider.setTableClustering({ clustering, fullTableName });

		return AlterScriptDto.getInstance([script], true, false);
	};

/**
 * @return {({collection, dbVersion }: {collection: Object, dbVersion: string }) => {
 *         type: 'modify' | 'new',
 *         script: Array<AlterScriptDto>
 * }}
 * */
const getModifyCollectionScriptDtos =
	(app, ddlProvider) =>
	({ collection, dbVersion }) => {
		const compMod = _.get(collection, 'role.compMod', {});
		const fullCollectionName = generateFullEntityName({ entity: collection, dbVersion });

		const isStreaming = collection?.role?.streamingTable;

		const alterTableNameScript = executeUnlessStreaming(
			isStreaming,
			() => ddlProvider.alterTableName(hydrateAlterTableName(compMod)),
			'',
		);

		const hydratedSerDeProperties = hydrateSerDeProperties(compMod, fullCollectionName);

		const checkConstraintsDtos = executeUnlessStreaming(
			isStreaming,
			() => getModifyCheckConstraintsScriptDtos(ddlProvider)(fullCollectionName, collection),
			[],
		);

		const tablePropertiesScriptDtos = executeUnlessStreaming(
			isStreaming,
			() => getModifiedTablePropertiesScriptDtos(ddlProvider)({ collection, dbVersion }),
			[],
		);

		const serDeProperties = executeUnlessStreaming(
			isStreaming,
			() => ddlProvider.alterSerDeProperties(hydratedSerDeProperties),
			'',
		);

		const modifyLocationScriptDto = executeUnlessStreaming(
			isStreaming,
			() => getModifyLocationScriptDto(app, ddlProvider)({ collection, dbVersion }),
			undefined,
		);

		const unityEntityTagsDtos = getModifyUnityEntityTagsScriptDtos({ ddlProvider })({
			entityData: collection,
			name: fullCollectionName,
		});

		const checkLiquidClusteringScriptDtos = executeUnlessStreaming(
			isStreaming,
			() =>
				getModifyClusteringScriptDto({ ddlProvider })({
					collection,
					dbVersion,
				}),
			undefined,
		);

		return {
			type: 'modify',
			script: [
				AlterScriptDto.getInstance([alterTableNameScript], true, false),
				...tablePropertiesScriptDtos,
				...checkConstraintsDtos,
				AlterScriptDto.getInstance([serDeProperties], true, false),
				modifyLocationScriptDto,
				...unityEntityTagsDtos,
				checkLiquidClusteringScriptDtos,
			].filter(Boolean),
		};
	};

/**
 * @return {(collection: any, definitions: any, ddlProvider: any) => {
 *         type: 'modify' | 'new',
 *         script: Array<AlterScriptDto>
 * }}
 * */
const generateModifyCollectionScript = app => (collection, definitions, ddlProvider, dbVersion) => {
	const compMod = _.get(collection, 'role.compMod', {});
	const shouldDropAndRecreate =
		!checkLiquidClusteringPropertyChanged(compMod) && getIsChangeProperties(compMod, tableProperties);

	if (shouldDropAndRecreate) {
		return getDropAndRecreateCollectionScriptDtos(app, ddlProvider)(collection, definitions, dbVersion);
	}
	return getModifyCollectionScriptDtos(app, ddlProvider)({ collection, dbVersion });
};

module.exports = {
	generateModifyCollectionScript,
};
