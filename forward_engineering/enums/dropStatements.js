const DropStatements = Object.freeze({
	DROP_BLOOMFILTER: 'DROP BLOOMFILTER',
	DROP_VIEW: 'DROP VIEW',
	DROP_TABLE: 'DROP TABLE',
	DROP_DATABASE: 'DROP DATABASE',
	DROP_COLUMN: 'DROP COLUMN',
	DROP_COLUMNS: 'DROP COLUMNS',
	// This statement is used when a column's comment is dropped
	COMMENT: "COMMENT '';",
	// This statement is used when not-null constraint is dropped
	DROP_NOT_NULL: 'DROP NOT NULL;',
	// This statement is used when check constraint is dropped
	DROP_CONSTRAINT: 'DROP CONSTRAINT IF EXISTS',
});

module.exports = {
	DropStatements
}
