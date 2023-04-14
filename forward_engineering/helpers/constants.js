module.exports = {
	DROP_STATEMENTS: [
		'DROP BLOOMFILTER',
		'DROP VIEW',
		'DROP TABLE',
		'DROP DATABASE',
		'DROP COLUMN',
		'DROP COLUMNS',
		// This statement is used when a column's comment is dropped
		"COMMENT '';",
		// This statement is used when table/schema 's comment is dropped
		'IS NULL;',
		// This statement is used when not-null constraint is dropped
		'DROP NOT NULL;',
		// This statement is used when check constraint is dropped
		'DROP CONSTRAINT IF EXISTS',
	]
}
