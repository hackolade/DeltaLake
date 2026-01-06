const { isV6Format, isV4Format } = require('@webpod/ip');

/**
 * @see https://en.wikipedia.org/wiki/IPv6_address
 * Literal IPv6 addresses in resources (URLs):
------------------------------------------------
 * Colon (:) characters in IPv6 addresses may conflict with the established syntax of resource identifiers,
 * such as URIs and URLs. The colon is conventionally used to terminate the host path before a port number.[10]
 * To alleviate this conflict, literal IPv6 addresses are enclosed in square brackets in such resource identifiers;
 * When the URL doesn't conatoin the port the notation is http://[2001:db8:85a3:8d3:1319:8a2e:370:7348]/
 * When the URL also contains a port number the notation is: https://[2001:db8:85a3:8d3:1319:8a2e:370:7348]:443/
 *
 * @param {{
* 	host: string
* }} param
* @returns {string}
*/
function escapeV6IpForURL({ host }) {
	/**
	 * If the host is already URL compatible then the ip lib will return false > ip.isV6Format('[::1]') false
	 * If the host is a proper ipv6 ip then the `new URL(host)` will fail with Uncaught TypeError: Invalid URL code: 'ERR_INVALID_URL',
	 * !ip.isV4Format(host) check required because isV6Format returns true for ipv4 address because of backward compatibility
	 */
	if (isV6Format(host) && !isV4Format(host)) {
		return escapeHost(host);
	}

	const isUrlValid = isValidURL(host);
	if (isUrlValid) {
		return host;
	}

	const urlWithIpV6HostRegExp = new RegExp(/^http(s)?:\/\/(?<unescapedIpWithPort>([a-z0-9]{0,4}:?)+)/gim);
	const { unescapedIpWithPort } = urlWithIpV6HostRegExp.exec(host)?.groups ?? {};

	if (!unescapedIpWithPort) {
		return host;
	}

	const separatedIpPortionsAndPort = unescapedIpWithPort.split(':');
	const ipPortions = separatedIpPortionsAndPort.slice(0, separatedIpPortionsAndPort.length - 1);
	const port = separatedIpPortionsAndPort.at(-1);
	const escapedIpWithPort = `[${ipPortions.join(':')}]:${port}`;

	const hostWithEscapedAllPortionsButTheLastOne = host.replace(unescapedIpWithPort, escapedIpWithPort);
	if (isValidURL(hostWithEscapedAllPortionsButTheLastOne)) {
		return hostWithEscapedAllPortionsButTheLastOne;
	}

	return host.replace(unescapedIpWithPort, escapeHost(unescapedIpWithPort));
}

/**
 * @param {string} host
 * @returns {string}
 */
function escapeHost(host) {
	return `[${host}]`;
}

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

module.exports = {
	escapeV6IpForURL,
};
