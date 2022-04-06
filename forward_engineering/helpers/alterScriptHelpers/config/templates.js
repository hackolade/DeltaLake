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

	addTableColumns: 'ALTER TABLE ${name} ADD COLUMNS ${columns};',

	setTableProperties: 'ALTER TABLE ${name} SET TBLPROPERTIES (${properties});',

	unsetTableProperties: 'ALTER TABLE ${name} UNSET TBLPROPERTIES IF EXISTS (${properties});',

	alterSerDeProperties: 'ALTER TABLE ${name} SET SERDE ${serDe}${serDeProperties};',

	serDeProperties: ' WITH SERDEPROPERTIES (${properties})',

	dropDatabase: 'DROP DATABASE IF EXISTS ${name};',
}