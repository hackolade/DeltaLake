const templates = require('./ddlTemplates');
const { getFullEntityName } = require('../utils/generalUtils');

module.exports = app => {
	const { assignTemplates } = app.require('@hackolade/ddl-fe-utils');
	return {
		dropView(name) {
			return assignTemplates(templates.dropView, { name });
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
			const columnsScripts = columns.map(({ oldName, newName }) => oldName && newName
				? assignTemplates(templates.alterTableColumnName, { collectionName, oldName, newName }) : ''
			);
			return columnsScripts.filter(Boolean);
		},

		updateCommentOnColumn({ fullTableName, columnName, comment }) {
			const templatesConfig = {
				tableName: fullTableName,
				columnName,
				comment
			}
			return assignTemplates(templates.updateColumnComment, templatesConfig);
		},

		dropCommentOnColumn({ fullTableName, columnName }) {
			const templatesConfig = {
				tableName: fullTableName,
				columnName,
				comment: "''",
			}
			return assignTemplates(templates.updateColumnComment, templatesConfig);
		},

		updateComment({ entityType, entityName, comment }) {
			const templatesConfig = {
				entityType,
				entityName,
				comment,
			}
			return assignTemplates(templates.updateComment, templatesConfig);
		},

		dropComment({ entityType, entityName }) {
			const templatesConfig = {
				entityType,
				entityName,
				comment: 'NULL',
			}
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
				columnName
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
				columnName
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
				check
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
				constraintName
			});
		},

		alterTableProperties({ dataProperties, name }) {
			if (!name) {
				return [];
			}
			const { add: addProperties = '', drop: dropProperties = '' } = dataProperties;
			let script = [];
			if (addProperties.length) {
				script = script.concat(assignTemplates(templates.setTableProperties, { name, properties: addProperties }));
			}
			if (dropProperties.length) {
				script = script.concat(assignTemplates(templates.unsetTableProperties, { name, properties: dropProperties }));
			}
			return script;
		},

		setTableProperties({ name, properties } = {}) {
			return !name || !properties ? '' : assignTemplates(templates.setTableProperties, { name, properties });
		},

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

		dropDatabase(name) {
			return !name ? '' : assignTemplates(templates.dropDatabase, { name });
		},

		alterSerDeProperties({ properties, serDe, name }) {
			if (!name || !serDe) {
				return '';
			}
			const serDeProperties = properties ? assignTemplates(templates.serDeProperties, { properties }) : '';

			return assignTemplates(templates.alterSerDeProperties, { name, serDeProperties, serDe });
		},

		alterView({ dataProperties, dbName, fullName, rename: { newName, oldName }, selectStatement }) {
			const { add: addProperties = '', drop: dropProperties = '' } = dataProperties || {};
			let script = [];
			if (newName !== oldName && !!newName && !!oldName) {
				const fullNewName = getFullEntityName(dbName, newName);
				const fullOldName = getFullEntityName(dbName, oldName);
				script = script.concat(assignTemplates(templates.alterViewName, { oldName: fullOldName, newName: fullNewName }));
			}
			if (!fullName) {
				return script;
			}

			if (addProperties.length) {
				script = script.concat(assignTemplates(templates.setViewProperties, { name: fullName, properties: addProperties }));
			}
			if (dropProperties.length) {
				script = script.concat(assignTemplates(templates.unsetViewProperties, { name: fullName, properties: dropProperties }));
			}
			if (selectStatement) {
				script = script.concat(assignTemplates(templates.alterViewStatement, { name: fullName, query: selectStatement }));
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
			}
			return assignTemplates(
				templates.addPkConstraint,
				templateConfig,
			);
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
			}
			return assignTemplates(
				templates.dropPkConstraint,
				templateConfig,
			).trim();
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
			const {childTableName, fkConstraintName, childColumns, parentTableName, parentColumns} = addFkConstraintDto;
            const templateConfig = {
				childTableName,
                fkConstraintName,
				childColumns: childColumns.join(', ') || '',
                parentTableName,
                parentColumns: parentColumns.join(', ') || '',
			}
			return assignTemplates(
				templates.addFkConstraint,
				templateConfig,
			);
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
			}
			return assignTemplates(
				templates.dropFkConstraint,
				templateConfig,
			);
		},

	}
};
