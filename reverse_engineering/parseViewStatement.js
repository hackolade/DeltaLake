const { getErrorMessage } = require('./helpers/utils');
const { parseDDLStatements } = require('./parseDDLStatements');

module.exports = {
	parseViewStatement(data, logger, callback, app) {
		try {
			const statement = data.statement;
			const { result } = parseDDLStatements('CREATE VIEW `db`.`name` AS ' + statement + ';\n');

			callback(null, {
				jsonSchema: {},
				ddl: result?.[0]?.doc?.views?.[0]?.ddl,
			});
		} catch (error) {
			const message = getErrorMessage(error);
			logger.log('error', { error }, 'Reverse Engineering error');
			callback(message);
		}
	},
};
