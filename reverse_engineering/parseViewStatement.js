const { getErrorMessage } = require('./helpers/utils');

module.exports = {
	parseViewStatement(data, logger, callback, app) {
		try {
			const statement = data.statement;
			const viewDdl = 'CREATE VIEW `db`.`name` AS ' + statement + ';\n';

			callback(null, {
				jsonSchema: {},
				ddl: {
					type: 'databricks',
					script: viewDdl,
					takeAllDdlProperties: true,
				},
			});
		} catch (error) {
			const message = getErrorMessage(error);
			logger.log('error', { error }, 'Reverse Engineering error');
			callback(message);
		}
	},
};
