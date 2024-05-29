const { getFullEntityName, replaceSpaceWithUnderscore, prepareName } = require('../../utils/general');
const { AlterScriptDto } = require('../types/AlterScriptDto');

/**
 * @param relationship {Object}
 * @return string
 * */
const getRelationshipName = relationship => {
	return relationship.role.name;
};

const getFullParentTableName = relationship => {
	const compMod = relationship.role.compMod;

	const parentDBName = replaceSpaceWithUnderscore(compMod.parent.bucket.name);
	const parentEntityName = replaceSpaceWithUnderscore(compMod.parent.collection.name);
	return getFullEntityName(parentDBName, parentEntityName);
};

const getFullChildTableName = relationship => {
	const compMod = relationship.role.compMod;

	const childDBName = replaceSpaceWithUnderscore(compMod.child.bucket.name);
	const childEntityName = replaceSpaceWithUnderscore(compMod.child.collection.name);
	return getFullEntityName(childDBName, childEntityName);
};

/**
 * @return {(relationship: Object) => string}
 * */
const getAddSingleForeignKeyScript = (ddlProvider, _) => relationship => {
	const compMod = relationship.role.compMod;

	const parentTableName = getFullParentTableName(relationship);
	const childTableName = getFullChildTableName(relationship);

	const relationshipName = compMod.name?.new || getRelationshipName(relationship) || '';

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
		compMod.name?.new || getRelationshipName(relationship),
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
const getAddForeignKeyScripts = (ddlProvider, _) => addedRelationships => {
	return addedRelationships
		.filter(relationship => canRelationshipBeAdded(relationship))
		.map(relationship => {
			const script = getAddSingleForeignKeyScript(ddlProvider, _)(relationship);
			return {
				isActivated: Boolean(relationship.role?.compMod?.isActivated?.new),
				scripts: [
					{
						script,
						isDropScript: false,
					},
				],
			};
		})
		.filter(res => res.scripts.some(scriptDto => Boolean(scriptDto.script)));
};

/**
 * @return {(relationship: Object) => string}
 * */
const getDeleteSingleForeignKeyScript = (ddlProvider, _) => relationship => {
	const compMod = relationship.role.compMod;

	const childTableName = getFullChildTableName(relationship);

	const relationshipName = compMod.name?.old || getRelationshipName(relationship) || '';
	const relationshipNameForDDL = prepareName(relationshipName);
	return ddlProvider.dropFkConstraint(childTableName, relationshipNameForDDL);
};

const canRelationshipBeDeleted = relationship => {
	const compMod = relationship.role.compMod;
	if (!compMod) {
		return false;
	}
	return [
		compMod.name?.old || getRelationshipName(relationship),
		compMod.child?.bucket,
		compMod.child?.collection,
	].every(property => Boolean(property));
};

/**
 * @return {(deletedRelationships: Array<Object>) => Array<AlterScriptDto>}
 * */
const getDeleteForeignKeyScripts = (ddlProvider, _) => deletedRelationships => {
	return deletedRelationships
		.filter(relationship => canRelationshipBeDeleted(relationship))
		.map(relationship => {
			const script = getDeleteSingleForeignKeyScript(ddlProvider, _)(relationship);
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
const getModifyForeignKeyScripts = (ddlProvider, _) => modifiedRelationships => {
	return modifiedRelationships
		.filter(relationship => canRelationshipBeAdded(relationship) && canRelationshipBeDeleted(relationship))
		.map(relationship => {
			const deleteScript = getDeleteSingleForeignKeyScript(ddlProvider, _)(relationship);
			const addScript = getAddSingleForeignKeyScript(ddlProvider, _)(relationship);
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
		})
		.filter(res => res.scripts.some(scriptDto => Boolean(scriptDto.script)));
};

module.exports = {
	getDeleteForeignKeyScripts,
	getModifyForeignKeyScripts,
	getAddForeignKeyScripts,
};
