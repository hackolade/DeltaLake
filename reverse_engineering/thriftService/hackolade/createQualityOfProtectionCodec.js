
const createTransport = (transport, client) => {
	return class extends transport {
		static receiver(handle, seqid) {
			return super.receiver((frame) => {
				client.unwrap(frame.inBuf.toString('base64'), (err, decodedData) => {
					if (err) {
						throw err;
					} else {
						const payload = Buffer.from(decodedData, 'base64');

						handle(new transport(payload, seqid));
					}
				});
			});
		}
	};
};

const createQopCodec = (connection, client) => {
	return class extends connection {

		constructor(stream, options) {
			super(stream, Object.assign({}, options, {
				transport: createTransport(options.transport, client)
			}));

			this.saslClient = client;
		}

		write(data) {
			const payload = data.slice(4);
	
			this.saslClient.wrap(payload.toString('base64'), { encode: 1 }, (err, encodedData) => {
				if (err) {
					throw err;
				}

				const payload = Buffer.from(encodedData, 'base64');

				super.write(this.createPackage(payload));
			});
		}

		createPackage(body) {
			const bodyLength = Buffer.alloc(4);

			bodyLength.writeUInt32BE(body.length);

			return Buffer.concat([ bodyLength, body ]);
		}
	};
};

module.exports = createQopCodec;
