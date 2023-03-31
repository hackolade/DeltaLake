module.exports = {
	dropView: 'DROP VIEW IF EXISTS ${name};',

	alterViewName: 'ALTER VIEW ${oldName} RENAME TO ${newName};',

	setViewProperties: 'ALTER VIEW ${name} SET TBLPROPERTIES (${properties});',

	unsetViewProperties: 'ALTER VIEW ${name} UNSET TBLPROPERTIES IF EXISTS (${properties});',

	alterViewStatement: 'ALTER VIEW ${name} AS ${query};',

	dropTableIndex: 'DROP BLOOMFILTER INDEX ON TABLE ${name};',

	dropTable: 'DROP TABLE IF EXISTS ${name};',

	alterTableName: 'ALTER TABLE ${oldName} RENAME TO ${newName};',

	alterTableColumnName: 'ALTER TABLE ${collectionName} RENAME COLUMN ${oldName} TO ${newName};',

	updateColumnComment: 'ALTER TABLE ${tableName} ALTER COLUMN ${columnName} COMMENT ${comment};',

	updateComment: 'COMMENT ON ${entityType} ${entityName} IS ${comment}',

	addTableColumns: 'ALTER TABLE ${name} ADD COLUMNS (${columns});',

	addTableColumn: 'ALTER TABLE ${name} ADD COLUMN (${column});',

	dropTableColumns: 'ALTER TABLE ${name} DROP COLUMNS (${columns});',

	dropTableColumn: 'ALTER TABLE ${name} DROP COLUMN (${column});',

	setTableProperties: 'ALTER TABLE ${name} SET TBLPROPERTIES (${properties});',

	unsetTableProperties: 'ALTER TABLE ${name} UNSET TBLPROPERTIES IF EXISTS (${properties});',

	alterSerDeProperties: 'ALTER TABLE ${name} SET SERDE ${serDe}${serDeProperties};',

	serDeProperties: ' WITH SERDEPROPERTIES (${properties})',

	dropDatabase: 'DROP DATABASE IF EXISTS ${name};',
}
