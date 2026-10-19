'use strict';

const OAUTH_SCOPE = 'all-apis offline_access';
const OAUTH_REDIRECT_PORT = 8020;
const OAUTH_MODULE = '@hackolade/oauth';
const OAUTH_UNAVAILABLE_MESSAGE = `The module ${OAUTH_MODULE} is not exposed by the application to the plugins!`;
const NEWER_STUDIO_MESSAGE =
	'This OAuth login needs a newer version of Hackolade Studio. Personal access token authentication is still available.';

let accessToken = '';
let cachedConnectionKey = '';

const getWorkspaceOrigin = ({ host = '' } = {}) => (host.endsWith('/') ? host.slice(0, -1) : host);

const getConnectionKey = ({ host, clientId } = {}) => `${getWorkspaceOrigin({ host })}|${clientId}`;

const getOauthClient = ({ app } = {}) => {
	try {
		return app.require(OAUTH_MODULE);
	} catch (error) {
		if (error?.message === OAUTH_UNAVAILABLE_MESSAGE) {
			throw new Error(NEWER_STUDIO_MESSAGE, { cause: error });
		}

		throw error;
	}
};

const resolveAccessToken = async ({ connectionInfo, app } = {}) => {
	if (connectionInfo?.authMethod !== 'OAuth') {
		accessToken = '';
		cachedConnectionKey = '';

		return connectionInfo?.accessToken;
	}

	const connectionKey = getConnectionKey(connectionInfo);

	if (accessToken && cachedConnectionKey === connectionKey) {
		return accessToken;
	}

	const workspaceOrigin = getWorkspaceOrigin({ host: connectionInfo.host });
	const { accessToken: oauthAccessToken } = await getOauthClient({ app }).getUserToMachineAccessToken({
		authorizationEndpoint: `${workspaceOrigin}/oidc/v1/authorize`,
		tokenEndpoint: `${workspaceOrigin}/oidc/v1/token`,
		clientId: connectionInfo.clientId,
		scope: OAUTH_SCOPE,
		port: OAUTH_REDIRECT_PORT,
		failOnPortConflict: true,
	});

	if (!oauthAccessToken) {
		throw new Error('Databricks token response did not include an access token.');
	}

	accessToken = oauthAccessToken;
	cachedConnectionKey = connectionKey;

	return accessToken;
};

const clearAccessToken = () => {
	accessToken = '';
	cachedConnectionKey = '';
};

module.exports = {
	resolveAccessToken,
	clearAccessToken,
};
