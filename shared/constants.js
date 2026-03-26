// https://docs.databricks.com/api/azure/workspace/commandexecution/commandstatus#status
const COMMAND_EXECUTION_STATUS = {
	QUEUED: 'Queued',
	RUNNING: 'Running',
	CANCELLED: 'Cancelled',
	CANCELLING: 'Cancelling',
	ERROR: 'Error',
	FINISHED: 'Finished',
};

const REQUEST_TIMEOUT_MESSAGE =
	'Request timeout exceeded, please try again or increase query request timeout in Tools > Options > Reverse-Engineering';

/** How many columns to pull nullable/index metadata per Python command (avoids “Results too large”). */
const FIELD_METADATA_COLUMN_BATCH_SIZE = 12;

/** Truncate long strings in Spark field metadata when serializing indexes (per batch). */
const FIELD_METADATA_STRING_MAX = 4000;

const SPARK_LANGUAGE = {
	python: 'python',
	sql: 'sql',
};

module.exports = {
	COMMAND_EXECUTION_STATUS,
	REQUEST_TIMEOUT_MESSAGE,
	FIELD_METADATA_COLUMN_BATCH_SIZE,
	FIELD_METADATA_STRING_MAX,
	SPARK_LANGUAGE,
};
