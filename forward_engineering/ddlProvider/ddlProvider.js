const _ = require('lodash');
const templates = require('./ddlTemplates');
const {
	getFullEntityName,
	getName,
	replaceSpaceWithUnderscore,
	prepareName,
	getContainerName,
	getEntityData,
	getEntityProperties,
	wrapInBrackets,
} = require('../utils/general');
const { getViewTagsStatement } = require('../helpers/unityTagsHelper');
const { getTablePropertiesClause } = require('../helpers/tableHelper');
const viewHelper = require('../helpers/viewHelper');

module.exports = app => {
	const { assignTemplates } = app.require('@hackolade/ddl-fe-utils');

	return {
		dropView(name) {
			return assignTemplates(templates.dropView, { name });
		},

		createView(data) {
			const { schema, viewData, containerData, collectionRefsDefinitionsMap } = data;

			const columns = schema.properties || {};
			const view = _.first(viewData) || {};

			if (!view.isActivated) {
				return;
			}

			const bucketName = replaceSpaceWithUnderscore(prepareName(viewHelper.retrieveContainerName(containerData)));
			const viewName = replaceSpaceWithUnderscore(prepareName(view.code || view.name));
			const isGlobal = schema.viewGlobal && schema.viewTemporary;
			const isTemporary = schema.viewTemporary;
			const orReplace = schema.viewOrReplace;
			const ifNotExists = view.viewIfNotExist;
			const name = bucketName ? `${bucketName}.${viewName}` : `${viewName}`;
			const tableProperties =
				schema.tableProperties && Array.isArray(schema.tableProperties)
					? viewHelper.filterRedundantProperties(schema.tableProperties, ['transient_lastDdlTime'])
					: [];
			const viewUnityTagsStatements =
				schema.unityViewTags && getViewTagsStatement({ viewSchema: schema, viewName: name });

			return assignTemplates(templates.createView, {
				orReplace: orReplace && !ifNotExists ? ' OR REPLACE' : '',
				global: isGlobal ? ' GLOBAL' : '',
				temporary: isTemporary ? ' TEMPORARY' : '',
				ifNotExists: ifNotExists ? ' IF NOT EXISTS' : '',
				name,
				columnList: view.columnList
					? `${wrapInBrackets(view.columnList)}`
					: viewHelper.getDefaultColumnList(columns),
				schemaBinding: '',
				comment: viewHelper.getCommentStatement(schema.description),
				tablePropertyStatements: tableProperties.length
					? `TBLPROPERTIES (${getTablePropertiesClause(_)(tableProperties)})`
					: '',
				query: schema.selectStatement
					? `AS ${schema.selectStatement}`
					: viewHelper.getTableSelectStatement({
							collectionRefsDefinitionsMap,
							columns,
						}),
				viewUnityTagsStatements: viewUnityTagsStatements ? `${viewUnityTagsStatements};` : '',
			});
		},

		dropTableIndex(name) {
			return name ? assignTemplates(templates.dropTableIndex, { name }) : '';
		},

		dropTable(name) {
			return assignTemplates(templates.dropTable, { name });
		},

		alterTableName({ oldName, newName }) {
			return !oldName || !newName ? '' : assignTemplates(templates.alterTableName, { oldName, newName });
		},

		alterTableColumnName({ collectionName, columns } = {}) {
			if (!collectionName) {
				return '';
			}
			const columnsScripts = columns.map(({ oldName, newName }) =>
				oldName && newName
					? assignTemplates(templates.alterTableColumnName, { collectionName, oldName, newName })
					: '',
			);
			return columnsScripts.filter(Boolean);
		},

		updateCommentOnColumn({ fullTableName, columnName, comment }) {
			const templatesConfig = {
				tableName: fullTableName,
				columnName,
				comment,
			};
			return assignTemplates(templates.updateColumnComment, templatesConfig);
		},

		dropCommentOnColumn({ fullTableName, columnName }) {
			const templatesConfig = {
				tableName: fullTableName,
				columnName,
				comment: "''",
			};
			return assignTemplates(templates.updateColumnComment, templatesConfig);
		},

		updateComment({ entityType, entityName, comment }) {
			const templatesConfig = {
				entityType,
				entityName,
				comment,
			};
			return assignTemplates(templates.updateComment, templatesConfig);
		},

		dropComment({ entityType, entityName }) {
			const templatesConfig = {
				entityType,
				entityName,
				comment: 'NULL',
			};
			return assignTemplates(templates.updateComment, templatesConfig);
		},

		/**
		 * @param tableName {string}
		 * @param columnName {string}
		 * @return string
		 * */
		setNotNullConstraint(tableName, columnName) {
			return assignTemplates(templates.addNotNullConstraint, {
				tableName,
				columnName,
			});
		},

		/**
		 * @param tableName {string}
		 * @param columnName {string}
		 * @return string
		 * */
		dropNotNullConstraint(tableName, columnName) {
			return assignTemplates(templates.dropNotNullConstraint, {
				tableName,
				columnName,
			});
		},

		/**
		 * @param tableName {string}
		 * @param constraintName {string}
		 * @param check {string}
		 * @return string
		 * */
		setCheckConstraint(tableName, constraintName, check) {
			return assignTemplates(templates.addCheckConstraint, {
				tableName,
				constraintName,
				check,
			});
		},

		/**
		 * @param tableName {string}
		 * @param constraintName {string}
		 * @return string
		 * */
		dropCheckConstraint(tableName, constraintName) {
			return assignTemplates(templates.dropCheckConstraint, {
				tableName,
				constraintName,
			});
		},

		/**
		 * @param name {string} full table name
		 * @param properties {string} joined properties with values
		 * @return string
		 * */
		setTableProperties({ name, properties } = {}) {
			return !name || !properties ? '' : assignTemplates(templates.setTableProperties, { name, properties });
		},

		/**
		 * @param name {string} full table name
		 * @param properties {string} joined properties
		 * @return string
		 * */
		unsetTableProperties({ name, properties } = {}) {
			return !name || !properties ? '' : assignTemplates(templates.unsetTableProperties, { name, properties });
		},

		addTableColumns({ name, columns }) {
			return !name || !columns ? '' : assignTemplates(templates.addTableColumns, { name, columns });
		},

		addTableColumn({ name, column }) {
			return !name || !column ? '' : assignTemplates(templates.addTableColumn, { name, column });
		},

		dropTableColumns({ name, columns }) {
			return !name || !columns ? '' : assignTemplates(templates.dropTableColumns, { name, columns });
		},

		dropTableColumn({ name, column }) {
			return !name || !column ? '' : assignTemplates(templates.dropTableColumn, { name, column });
		},

		dropDatabase(name, bucketKeyword) {
			return !name ? '' : assignTemplates(templates.dropDatabase, { name, bucketKeyword });
		},

		alterSerDeProperties({ properties, serDe, name }) {
			if (!name || !serDe) {
				return '';
			}
			const serDeProperties = properties ? assignTemplates(templates.serDeProperties, { properties }) : '';

			return assignTemplates(templates.alterSerDeProperties, { name, serDeProperties, serDe });
		},

		/**
		 * @return Array<string>
		 * */
		alterView({ dataProperties, dbName, fullName, rename: { newName, oldName }, selectStatement }) {
			const { add: addProperties = '', drop: dropProperties = '' } = dataProperties || {};
			let script = [];
			if (newName !== oldName && !!newName && !!oldName) {
				const fullNewName = getFullEntityName(dbName, newName);
				const fullOldName = getFullEntityName(dbName, oldName);
				script = script.concat(
					assignTemplates(templates.alterViewName, {
						oldName: fullOldName,
						newName: fullNewName,
					}),
				);
			}
			if (!fullName) {
				return script;
			}

			if (addProperties.length) {
				script = script.concat(
					assignTemplates(templates.setViewProperties, {
						name: fullName,
						properties: addProperties,
					}),
				);
			}
			if (dropProperties.length) {
				script = script.concat(
					assignTemplates(templates.unsetViewProperties, {
						name: fullName,
						properties: dropProperties,
					}),
				);
			}
			if (selectStatement) {
				script = script.concat(
					assignTemplates(templates.alterViewStatement, {
						name: fullName,
						query: selectStatement,
					}),
				);
			}

			return script;
		},

		/**
		 * @param tableName {string}
		 * @param constraintName {string}
		 * @param pkColumnNames {Array<string>}
		 * @return string
		 * */
		addPkConstraint(tableName, constraintName, pkColumnNames) {
			const pkColumns = pkColumnNames.join(', ');
			const templateConfig = {
				tableName,
				constraintName,
				pkColumns,
			};
			return assignTemplates(templates.addPkConstraint, templateConfig);
		},

		/**
		 * @param tableName {string}
		 * @param dropPkOption {undefined | 'RESTRICT' | 'CASCADE'}
		 * @return string
		 * */
		dropPkConstraint(tableName, dropPkOption) {
			const templateConfig = {
				tableName,
				dropPkOption: dropPkOption || '',
			};
			return assignTemplates(templates.dropPkConstraint, templateConfig).trim();
		},

		/**
		 * @param addFkConstraintDto {{
		 *      childTableName: string,
		 *      fkConstraintName: string,
		 *      childColumns: Array<string>,
		 *      parentTableName: string,
		 * 	    parentColumns: Array<string>
		 * }}
		 * @return string
		 * */
		addFkConstraint(addFkConstraintDto) {
			const { childTableName, fkConstraintName, childColumns, parentTableName, parentColumns } =
				addFkConstraintDto;
			const templateConfig = {
				childTableName,
				fkConstraintName,
				childColumns: childColumns.join(', ') || '',
				parentTableName,
				parentColumns: parentColumns.join(', ') || '',
			};
			return assignTemplates(templates.addFkConstraint, templateConfig);
		},

		/**
		 * @param childTableName {string}
		 * @param fkConstraintName {string}
		 * @return string
		 * */
		dropFkConstraint(childTableName, fkConstraintName) {
			const templateConfig = {
				childTableName,
				fkConstraintName,
			};
			return assignTemplates(templates.dropFkConstraint, templateConfig);
		},

		/**
		 * @param fullTableName {string}
		 * @param columnName {string}
		 * @param defaultValue {string}
		 * @return string
		 * */
		updateColumnDefaultValue({ fullTableName, columnName, defaultValue }) {
			const templatesConfig = {
				tableName: fullTableName,
				columnName,
				defaultValue,
			};
			return assignTemplates(templates.updateColumnDefaultValue, templatesConfig);
		},

		/**
		 * @param fullTableName {string}
		 * @param columnName {string}
		 * @return string
		 * */
		dropColumnDefaultValue({ fullTableName, columnName }) {
			const templatesConfig = {
				tableName: fullTableName,
				columnName,
			};
			return assignTemplates(templates.dropColumnDefaultValue, templatesConfig);
		},

		/**
		 * @param fullTableName {string}
		 * @param location {string}
		 * @return {string}
		 * */
		setTableLocation({ fullTableName, location }) {
			const templatesConfig = {
				name: fullTableName,
				location,
			};
			return assignTemplates(templates.setTableLocation, templatesConfig);
		},

		/**
		 * @param name {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		setCatalogTags({ name, tags }) {
			return assignTemplates(templates.setCatalogTags, { name, tags });
		},

		/**
		 * @param name {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		unsetCatalogTags({ name, tags }) {
			return assignTemplates(templates.unsetCatalogTags, { name, tags });
		},

		/**
		 * @param name {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		setSchemaTags({ name, tags }) {
			return assignTemplates(templates.setSchemaTags, { name, tags });
		},

		/**
		 * @param name {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		unsetSchemaTags({ name, tags }) {
			return assignTemplates(templates.unsetSchemaTags, { name, tags });
		},

		/**
		 * @param name {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		setEntityTags({ name, tags }) {
			return assignTemplates(templates.setTableTags, { name, tags });
		},

		/**
		 * @param name {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		unsetEntityTags({ name, tags }) {
			return assignTemplates(templates.unsetTableTags, { name, tags });
		},

		/**
		 * @param name {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		setViewTags({ name, tags }) {
			return assignTemplates(templates.setViewTags, { name, tags });
		},

		/**
		 * @param name {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		unsetViewTags({ name, tags }) {
			return assignTemplates(templates.unsetViewTags, { name, tags });
		},

		/**
		 * @param tableName {string}
		 * @param columnName {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		setColumnTags({ tableName, columnName, tags }) {
			return assignTemplates(templates.setColumnTags, { tableName, columnName, tags });
		},

		/**
		 * @param tableName {string}
		 * @param columnName {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		unsetColumnTags({ tableName, columnName, tags }) {
			return assignTemplates(templates.unsetColumnTags, { tableName, columnName, tags });
		},
	};
};
