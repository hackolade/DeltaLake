const _ = require('lodash');
const templates = require('./ddlTemplates');
const {
	getFullEntityName,
	getEntityNameWithTemporaryFlag,
	replaceSpaceWithUnderscore,
	wrapInBrackets,
} = require('../utils/general');
const { getViewTagsStatement } = require('../helpers/unityTagsHelper');
const { getTablePropertiesClause, checkTablePropertiesDefined } = require('../helpers/tableHelper');
const viewHelper = require('../helpers/viewHelper');
const { prepareName } = require('../../shared/general');

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
			const isMaterialized = view.materialized;
			const ifNotExists = view.viewIfNotExist;
			const isTemporary = !isMaterialized && schema.viewTemporary;
			const isGlobal = isTemporary && schema.viewGlobal;
			const orReplace = !ifNotExists && schema.viewOrReplace;
			const name = getEntityNameWithTemporaryFlag({
				containerName: bucketName,
				entityName: viewName,
				isTemporary,
			});
			const tableProperties =
				schema.tableProperties && Array.isArray(schema.tableProperties)
					? viewHelper.filterRedundantProperties(schema.tableProperties, ['transient_lastDdlTime'])
					: [];
			const viewUnityTagsStatements =
				schema.unityViewTags && getViewTagsStatement({ viewSchema: schema, viewName: name });
			const keyClauses = viewHelper.getCompositeKeyClauses({
				viewData: view,
				jsonSchema: schema,
				collectionRefsDefinitionsMap,
			});

			return assignTemplates(templates.createView, {
				orReplace: orReplace ? ' OR REPLACE' : '',
				global: isGlobal ? ' GLOBAL' : '',
				temporary: isTemporary ? ' TEMPORARY' : '',
				ifNotExists: ifNotExists ? ' IF NOT EXISTS' : '',
				materialized: isMaterialized ? ' MATERIALIZED' : '',
				name,
				columnList: view.columnList
					? `${wrapInBrackets(view.columnList)}`
					: viewHelper.getDefaultColumnList(columns),
				schemaBinding: '',
				comment: viewHelper.getCommentStatement(schema.description),
				tablePropertyStatements: checkTablePropertiesDefined(tableProperties)
					? `TBLPROPERTIES (${getTablePropertiesClause(tableProperties)})`
					: '',
				query: schema.selectStatement
					? `AS ${schema.selectStatement}`
					: viewHelper.getTableSelectStatement({
							collectionRefsDefinitionsMap,
							columns,
						}),
				viewUnityTagsStatements: viewUnityTagsStatements ? `${viewUnityTagsStatements};` : '',
				scheduleClause: isMaterialized && view.scheduleClause ? `${view.scheduleClause}\n` : '',
				partitioningKeyClause: keyClauses.partitioningKeyClause,
				clusteringKeyClause: keyClauses.clusteringKeyClause,
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
			if (!check?.trim?.()) {
				return '';
			}

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
			if (!constraintName) {
				return '';
			}

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
		 * @param {string} tableName
		 * @param {string} constraintName
		 * @param {Array<string>} pkColumnNames
		 * @param {string} constraintOptions
		 * @return {string}
		 * */
		addPkConstraint(tableName, constraintName, pkColumnNames, constraintOptions) {
			const pkColumns = pkColumnNames.join(', ');
			const templateConfig = {
				tableName,
				constraintName,
				pkColumns,
				constraintOptions,
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
		 * @param {Object} params
		 * @param {string} params.name
		 * @param {string} params.tags
		 * @param {boolean} [params.isStreaming]
		 * @return {string}
		 * */
		setEntityTags({ name, tags, isStreaming }) {
			return assignTemplates(templates.setTableTags, { name, tags, streaming: isStreaming ? 'STREAMING ' : '' });
		},

		/**
		 * @param {Object} params
		 * @param {string} params.name
		 * @param {string} params.tags
		 * @param {boolean} [params.isStreaming]
		 * @return {string}
		 */
		unsetEntityTags({ name, tags, isStreaming }) {
			return assignTemplates(templates.unsetTableTags, {
				name,
				tags,
				streaming: isStreaming ? 'STREAMING ' : '',
			});
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
		 * @param {Object} params
		 * @param {string} params.tableName
		 * @param {string} params.columnName
		 * @param {string} params.tags
		 * @param {boolean} [params.isStreaming]
		 * @return {string}
		 */
		setColumnTags({ tableName, columnName, tags, isStreaming }) {
			return assignTemplates(templates.setColumnTags, {
				tableName,
				columnName,
				tags,
				streaming: isStreaming ? 'STREAMING ' : '',
			});
		},

		/**
		 * @param tableName {string}
		 * @param columnName {string}
		 * @param tags {string}
		 * @return {string}
		 * */
		unsetColumnTags({ tableName, columnName, tags, isStreaming }) {
			return assignTemplates(templates.unsetColumnTags, {
				tableName,
				columnName,
				tags,
				streaming: isStreaming ? 'STREAMING ' : '',
			});
		},

		/**
		 * @param {string} fullTableName
		 * @param {string} location
		 * @return {string}
		 * */
		setTableClustering({ fullTableName, clustering }) {
			const templatesConfig = {
				name: fullTableName,
				clustering,
			};
			return assignTemplates(templates.setTableClustering, templatesConfig);
		},

		/**
		 * @param {string} schemaName
		 * @return {string}
		 * */
		useSchema({ schemaName }) {
			return assignTemplates(templates.useSchema, { schemaName });
		},
	};
};
