const createHttpConnection = require('./httpConnection').createHttpConnection;

const getSpn = (host, service) => {
	return service + (process.platform === 'win32' ? '/' : '@') + host;
};

const getToken = (kerberos, kerberosOptions) => {
	const mechOID = kerberos.GSS_MECH_OID_SPNEGO;
	const spn = getSpn(kerberosOptions.krb_host, kerberosOptions.krb_service);
	const [ user, domain ] = (kerberosOptions.username || '').split('@');
	const password = kerberosOptions.password;

	return kerberos.initializeClient(spn, {
		mechOID,
		domain,
		user,
		password
	}).then(client => {
		return client.step('');
	});
};

const createKerberosHttpConnection = (kerberos, logger) => (host, port, options) => {
	logger.log('Kerberos HTTP: start getting token...');
	
	return getToken(kerberos, options.krb5)
		.then(token => {
			logger.log('Kerberos HTTP: token retrieved successfully');

			if (!/^YII/.test(token)) {
				logger.log('Kerberos HTTP: token has an incorrect format. Token: ' + token);
			}

			options.headers['Authorization'] = 'Negotiate : ' + token;

			return createHttpConnection(host, port, options);
		}, (error) => {
			logger.log('Kerberos HTTP: retrieving token failed: ' + error.message);

			return Promise.reject(error);
		});
};


exports.createKerberosHttpConnection = createKerberosHttpConnection;
