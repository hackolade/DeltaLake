/**
 * @param {string} url
 * @returns {boolean}
 */
function isValidURL(url) {
	try {
		new URL(url);

		return true;
	} catch {
		return false;
	}
}

/**
 * In case URL includes ip version 6 we need to escape the ip portion with square brackets before adding a port
 *
 * @param {{
 * 	url: string
 * }} param
 * @returns {string}
 */
function escapeUrlIpV6WithBraces({ url }) {
	const isUrlValid = isValidURL(url);

	if (isUrlValid) {
		return url;
	}

	const urlWithIpV6HostRegExp = new RegExp(/^http(s)?:\/\/(?<unescapedIpWithPort>([a-z0-9]{0,4}:?)+)/gim);
	const { unescapedIpWithPort } = urlWithIpV6HostRegExp.exec(url)?.groups ?? {};

	if (!unescapedIpWithPort) {
		return url;
	}

	const separatedIpPortionsAndPort = unescapedIpWithPort.split(':');
	const ipPortions = separatedIpPortionsAndPort.slice(0, separatedIpPortionsAndPort.length - 1);
	const port = separatedIpPortionsAndPort.at(-1);
	const escapedIpWithPort = `[${ipPortions.join(':')}]:${port}`;

	return url.replace(unescapedIpWithPort, escapedIpWithPort);
}

module.exports = {
	escapeUrlIpV6WithBraces,
};
