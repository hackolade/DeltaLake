const createKrb5 = (app, options, logger) => {
	const krb5 = app.require('krb5');

	return {
		initializeClient(spn, config) {
			return Promise.resolve({
				step() {
					return new Promise((resolve, reject) => {
						const authData = {
							principal: config.user,
							realm: config.domain,
							keytab: options.keytab,
						};
						logger.log('info', { message: 'Kinit', authData }, 'Auth');
						
						krb5.kinit(authData, (err, ccname) => {
							if (err) {
								return reject(err);
							}
	
							const spnegoData = {
								service_fqdn: options.krb_host,
								service_principal: options.krb_service + '/' + options.krb_host,
							};
							logger.log('info', { message: 'Credentials saved in: ' + ccname }, 'Auth');
							logger.log('info', { message: 'Getting token', spnegoData }, 'Auth');

							krb5.spnego(spnegoData, (err, token) => {
								if (err) {
									return reject(err);
								} else {
									return resolve(token);
								}
							});
						});
					});
				}
			});
		}
	};
};

const createKerberos = (app, options, logger) => {
	const shouldUseKrb5 = options.keytab && options.mode === 'http';

	if (!shouldUseKrb5) {
		logger.log('info', { message: 'Use kerberos lib' }, 'Initialize')

		return app.require('kerberos');
	}

	logger.log('info', { message: 'Use krb5 lib' }, 'Initialize')

	return createKrb5(app, options, logger);
};

module.exports = createKerberos;
