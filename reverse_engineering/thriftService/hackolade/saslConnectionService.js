const ThriftConnection = require('thrift').Connection;
const sslTcpConnection = require('./connections/sslTcpConnection');
const tcpConnection = require('./connections/tcpConnection');
const getQopConnection = require('./createQualityOfProtectionCodec');

const QOP_AUTH = 1;
const QOP_AUTH_INTEGRITY = 2;
const QOP_AUTH_CONFIDENTIALITY = 4;

const getConnection = (port, host, options) => {
	if (options.ssl) {
		return sslTcpConnection(port, host, options);
	} else {
		return tcpConnection(port, host, options);
	}
};

const createKerberosConnection = (kerberosAuthProcess, logger) => (host, port, options) => {
	const connection = getConnection(port, host, options);

	return kerberosAuthentication(kerberosAuthProcess, connection, logger)({
		authMech: 'GSSAPI',
		krb_host: options.krb5.krb_host,
		krb_service: options.krb5.krb_service,
		username: options.krb5.username,
		password: options.krb5.password,
		host,
		port,
	}).then((data) => {
		if (data.qop === QOP_AUTH) {
			return connection.assignStream(ThriftConnection);
		} else {
			return connection.assignStream(getQopConnection(ThriftConnection, data.client));
		}
	});
};

const createLdapConnection = () => (host, port, options) => {
	const connection = getConnection(port, host, options);

	return ldapAuthentication(connection)({
		authMech: 'PLAIN',
		username: options.username,
		password: options.password,
		host,
		port,
	}).then(() => {
		return connection.assignStream(ThriftConnection);
	});
};

const START = 1;
const OK = 2;
const BAD = 3;
const ERROR = 4;
const COMPLETE = 5;

const createPackage = (status, body) => {
	const bodyLength = Buffer.alloc(4);

	bodyLength.writeUInt32BE(body.length);

	return Buffer.concat([ Buffer.from([ status ]), bodyLength, body ]);
};

const getQopName = (qop) => {
	if (qop === QOP_AUTH) {
		return 'auth';
	} else if (qop === QOP_AUTH_INTEGRITY) {
		return 'auth-int';
	} else {
		return 'auth-conf';
	}
};

const kerberosAuthentication = (kerberosAuthProcess, connection, logger) => (options) => new Promise((resolve, reject) => {
	const inst = new kerberosAuthProcess(
		options.krb_host,
		options.port,
		options.krb_service
	);
	let transition = 0;
	let qualityOfProtection = QOP_AUTH;

	logger.log('Start Kerberos authentication');

	inst.init(options.username, options.password, (err, client) => {
		if (err) {
			logger.log('kerberos authentication. Step 1. Initialization: failed');

			return reject(err);
		} else {
			logger.log('kerberos authentication. Step 1. Initialization: succeed');
		}

		connection.connect();
		const onError = (err) => {
			logger.log('kerberos authentication. Connection error');
			
			connection.end();

			reject(err);
		};
		const onSuccess = () => {
			logger.log('kerberos authentication. Successfully authenticated');
			
			connection.removeListener('connect', onConnect);
			connection.removeListener('data', onData);

			resolve({
				client: client,
				qop: qualityOfProtection
			});
		};
		const onConnect = () => {
			logger.log('kerberos authentication. Successfully connected to server');
			
			connection.write(createPackage(START, Buffer.from(options.authMech)));

			inst.transition('', (err, token) => {
				logger.log('kerberos authentication. Step 2. Start authentication.');
				if (err) {
					return onError(err);
				}

				connection.write(createPackage(OK, Buffer.from(token || '', 'base64')));
			});
		};

		const onData = (data) => {
			transition++;
			logger.log('kerberos authentication. Step 3. Transition #' + transition + '.');

			const result = data[0];

			if (result === OK) {
				logger.log('kerberos authentication. Step 3. Transition #' + transition + ': succeed');
				
				const payload = data.slice(5).toString('base64');
				const isLastTransition = (transition === 2);
				const nextTransition = isLastTransition
					? thirdTransition.bind(null, client, inst.username)
					: inst.transition.bind(inst);
				
				nextTransition(payload, (err, response, qop) => {
					if (err) {
						return onError(err);
					}

					qualityOfProtection = qop;
					connection.write(createPackage(OK, Buffer.from(response || '', 'base64')));
				});
			} else if (result === COMPLETE) {
				logger.log('kerberos authentication. Step 3. Transition #' + transition + ': completed. Chosen QOP: ' + getQopName(qualityOfProtection));
				
				onSuccess();
			} else {
				logger.log('kerberos authentication. Step 3. Transition #' + transition + ': failed. Code: ' + result);

				const message = data.slice(5).toString();

				onError(new Error('Authenticated error: ' + message));
			}
		};

		const thirdTransition = (client, user, payload, callback) => {
			client.unwrap(payload, (err, response) => {
				if (err) {
					return callback(err);
				}
				const qop = Buffer.from(response, 'base64')[0];
				logger.log('kerberos authentication. Step 3. Transition #' + transition + '. Chosen QOP: ' + getQopName(qop));

				client.wrap(response, { user }, (err, wrapped) => {
					if (err) {
						return callback(err);
					}

					callback(null, wrapped, qop);
				});
			});
		};

		connection.addListener('connect', onConnect);
		connection.addListener('data', onData);
	});
});

const ldapAuthentication = (connection) => (options) => new Promise((resolve, reject) => {
	connection.connect();

	const onError = (err) => {
		connection.end();

		reject(err);
	};
	const onSuccess = () => {
		connection.removeListener('connect', onConnect);
		connection.removeListener('data', onData);

		resolve();
	};
	const onConnect = () => {
		connection.write(createPackage(START, Buffer.from(options.authMech)));
		connection.write(createPackage(OK, Buffer.concat([
			Buffer.from(options.username || ""),
			Buffer.from([0]),
			Buffer.from(options.username || ""),
			Buffer.from([0]),
			Buffer.from(options.password || ""),
		])));
	};
	const onData = (data) => {
		const result = data[0];

		if (result === COMPLETE) {
			onSuccess();
		} else {
			const message = data.slice(5).toString();

			onError(new Error('Authenticated error: ' + message));
		}
	};

	connection.addListener('connect', onConnect);
	connection.addListener('data', onData);
	connection.addListener('error', onError);
});

exports.createKerberosConnection = createKerberosConnection;
exports.createLdapConnection = createLdapConnection;