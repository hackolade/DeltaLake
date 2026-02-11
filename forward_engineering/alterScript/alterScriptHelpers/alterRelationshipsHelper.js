const _ = require('lodash');
const {
	getFullEntityName,
	replaceSpaceWithUnderscore,
	prepareName,
	getContainerName,
	replaceDotWithUnderscore,
	executeUnlessStreaming,
} = require('../../utils/general');
const { AlterScriptDto } = require('../types/AlterScriptDto');
const { getUseSchemaScriptDto } = require('./alterEntityHelper');
const { getItems } = require('./columnHelpers/getItems');

/**
 * @param relationship {Object}
 * @return string
 * */
const getRelationshipName = relationship => {
	return relationship.role.code || relationship.role.name;
};

const getFullParentTableName = relationship => {
	const compMod = relationship.role.compMod;

	const parentDBName = replaceSpaceWithUnderscore(prepareName(compMod.parent.bucket.name));
	const parentEntityName = replaceSpaceWithUnderscore(compMod.parent.collection.name);

	return getFullEntityName(parentDBName, parentEntityName);
};

const getFullChildTableName = relationship => {
	const compMod = relationship.role.compMod;

	const childDBName = replaceSpaceWithUnderscore(prepareName(compMod.child.bucket.name));
	const childEntityName = replaceSpaceWithUnderscore(compMod.child.collection.name);
	return getFullEntityName(childDBName, childEntityName);
};

/**
 * @return {(relationship: Object) => string}
 * */
const getAddSingleForeignKeyScript = ddlProvider => relationship => {
	const compMod = relationship.role.compMod;
	const parentTableName = getFullParentTableName(relationship);
	const childTableName = getFullChildTableName(relationship);

	const relationshipName = compMod.code?.new || compMod.name?.new || getRelationshipName(relationship) || '';

	const addFkConstraintDto = {
		childTableName,
		fkConstraintName: prepareName(relationshipName),
		childColumns: compMod.child.collection.fkFields.map(field => prepareName(field.name)),
		parentTableName,
		parentColumns: compMod.parent.collection.fkFields.map(field => prepareName(field.name)),
	};
	return ddlProvider.addFkConstraint(addFkConstraintDto);
};

/**
 * @param relationship {Object}
 * @return boolean
 * */
const canRelationshipBeAdded = relationship => {
	const compMod = relationship.role.compMod;
	if (!compMod) {
		return false;
	}
	return [
		compMod.code?.new || compMod.name?.new || getRelationshipName(relationship),
		compMod.parent?.bucket,
		compMod.parent?.collection,
		compMod.parent?.collection?.fkFields?.length,
		compMod.child?.bucket,
		compMod.child?.collection,
		compMod.child?.collection?.fkFields?.length,
	].every(property => Boolean(property));
};

/**
 * @return {(addedRelationships: Array<Object>) => Array<AlterScriptDto>}
 * */
const getAddForeignKeyScript = ddlProvider => relationship => {
	const script = getAddSingleForeignKeyScript(ddlProvider)(relationship);

	return {
		isActivated: Boolean(relationship.role?.compMod?.isActivated?.new),
		scripts: [
			{
				script,
				isDropScript: false,
			},
		],
	};
};

/**
 * @return {(relationship: Object) => string}
 * */
const getDeleteSingleForeignKeyScript = ddlProvider => relationship => {
	const compMod = relationship.role.compMod;

	const childTableName = getFullChildTableName(relationship);

	const relationshipName = compMod.code?.old || compMod.name?.old || getRelationshipName(relationship) || '';
	const relationshipNameForDDL = prepareName(relationshipName);
	return ddlProvider.dropFkConstraint(childTableName, relationshipNameForDDL);
};

const canRelationshipBeDeleted = relationship => {
	const compMod = relationship.role.compMod;
	if (!compMod) {
		return false;
	}
	return [
		compMod.code?.old || compMod.name?.old || getRelationshipName(relationship),
		compMod.child?.bucket,
		compMod.child?.collection,
	].every(property => Boolean(property));
};

/**
 * @param {Object} ddlProvider - The DDL provider instance.
 * @return {(deletedRelationships: Array<Object>, entities: Object.<string, Object>) => Array<{isActivated: boolean, scripts: Array<{script: string, isDropScript: boolean}>}>}
 * */
const getDeleteForeignKeyScripts = ddlProvider => (deletedRelationships, entities) => {
	return deletedRelationships
		.filter(relationship => canRelationshipBeDeleted(relationship))
		.map(relationship => {
			const childId = relationship?.role?.childCollection;
			const childTable = entities[childId];

			const isStreaming = childTable?.role?.streamingTable;

			const script = executeUnlessStreaming(
				isStreaming,
				() => getDeleteSingleForeignKeyScript(ddlProvider)(relationship),
				'',
			);

			return {
				isActivated: Boolean(relationship.role?.compMod?.isActivated?.new),
				scripts: [
					{
						script,
						isDropScript: true,
					},
				],
			};
		})
		.filter(res => res.scripts.some(scriptDto => Boolean(scriptDto.script)));
};

/**
 * @return {(modifiedRelationships: Array<Object>) => Array<AlterScriptDto>}
 * */
const getModifyForeignKeyScript = ddlProvider => relationship => {
	const deleteScript = getDeleteSingleForeignKeyScript(ddlProvider)(relationship);
	const addScript = getAddSingleForeignKeyScript(ddlProvider)(relationship);

	return {
		isActivated: Boolean(relationship.role?.compMod?.isActivated?.new),
		scripts: [
			{
				script: deleteScript,
				isDropScript: true,
			},
			{
				script: addScript,
				isDropScript: false,
			},
		],
	};
};

const getAlterRelationshipsScriptDtos = ({ schema, ddlProvider, initialSchemaName }) => {
	let currentSchemaName = initialSchemaName;

	const allEntitiesArray = [
		...getItems(schema, 'entities', 'added'),
		...getItems(schema, 'entities', 'modified'),
		...getItems(schema, 'entities', 'deleted'),
	];

	const allEntities = _.keyBy(allEntitiesArray, item => item?.role?.id);

	const generateAddFkScriptDtos = (addedRelationships, getScript) => {
		return addedRelationships.filter(relationship => canRelationshipBeAdded(relationship)).flatMap(getScript);
	};

	const generateModifyFkScriptDtos = (modifiedRelationships, getScript) => {
		return modifiedRelationships
			.filter(relationship => canRelationshipBeAdded(relationship) && canRelationshipBeDeleted(relationship))
			.flatMap(getScript);
	};

	const getRelationshipsScriptsWithUseSchema = (relationships, processRelationships, getScript) => {
		return processRelationships(relationships, relationship => {
			const scriptDto = getScript(ddlProvider)(relationship);
			const scriptIsNotEmpty = scriptDto.scripts.some(scriptDto => Boolean(scriptDto.script));

			if (!scriptIsNotEmpty) {
				return [];
			}

			const schemaName = replaceSpaceWithUnderscore(
				prepareName(relationship.role.compMod.child.bucket?.name || ''),
			);

			if (currentSchemaName === schemaName) {
				return [scriptDto];
			}

			currentSchemaName = schemaName;
			const useSchemaDto = getUseSchemaScriptDto({ schemaName, ddlProvider });

			return [useSchemaDto, scriptDto];
		});
	};

	const deletedRelationships = getItems(schema, 'relationships', 'deleted').filter(
		relationship => relationship.role?.compMod?.deleted,
	);
	const addedRelationships = getItems(schema, 'relationships', 'added').filter(
		relationship => relationship.role?.compMod?.created,
	);
	const modifiedRelationships = getItems(schema, 'relationships', 'modified');

	const deleteFkScripts = getDeleteForeignKeyScripts(ddlProvider)(deletedRelationships, allEntities);
	const addFkScripts = getRelationshipsScriptsWithUseSchema(
		addedRelationships,
		generateAddFkScriptDtos,
		getAddForeignKeyScript,
	);
	const modifiedFkScripts = getRelationshipsScriptsWithUseSchema(
		modifiedRelationships,
		generateModifyFkScriptDtos,
		getModifyForeignKeyScript,
	);

	return [...deleteFkScripts, ...addFkScripts, ...modifiedFkScripts];
};

module.exports = {
	getAlterRelationshipsScriptDtos,
};
