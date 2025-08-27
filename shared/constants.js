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

module.exports = {
	COMMAND_EXECUTION_STATUS,
	REQUEST_TIMEOUT_MESSAGE,
};
