const tls = require('tls');
const constants = require('constants');

const sslTcpConnection = (port, host, options) => {
	let stream;

	if (!('secureProtocol' in options) && !('secureOptions' in options)) {
		options.secureProtocol = "SSLv23_method";
		options.secureOptions = constants.SSL_OP_NO_SSLv2 | constants.SSL_OP_NO_SSLv3;
	}

	options.rejectUnauthorized = false;

	return {
		connect() {
			stream = tls.connect(port, host, options);
			stream.setMaxSendFragment(65536);
			stream.setNoDelay(true);
			return stream;
		},

		assignStream(connection) {
			const conn = new connection(stream, Object.assign({}, options, {
				ssl: true
			}));
	
			conn.host = host;
			conn.port = port;
			stream.emit('secureConnect');
	
			return conn;
		},

		addListener(eventName, callback) {
			if (eventName === 'connect') {
				stream.addListener('secureConnect', callback);
			} else {
				stream.addListener(eventName, callback);
			}
		},

		removeListener(eventName, listener) {
			if (eventName === 'connect') {
				stream.removeListener('secureConnect', listener);
			} else {
				stream.removeListener(eventName, listener);
			}
		},

		write(data) {
			stream.write(data);
		},

		end() {
			return stream.end();
		}
	};
};

module.exports = sslTcpConnection;
