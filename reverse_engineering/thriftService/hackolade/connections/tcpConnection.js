const net = require('net');

const tcpConnection = (port, host, options) => {
	let stream;

	return {
		connect() {
			stream = net.createConnection(port, host);

			return stream;
		},

		assignStream(connection) {
			const conn = new connection(stream, options);

			conn.host = host;
			conn.port = port;
			stream.emit('connect');
	
			return conn;
		},

		addListener(eventName, callback) {
			stream.addListener(eventName, callback);
		},

		removeListener(eventName, listener) {
			stream.removeListener(eventName, listener);
		},

		write(data) {
			stream.write(data);
		},

		end() {
			return stream.end();
		}
	};
};

module.exports = tcpConnection;
