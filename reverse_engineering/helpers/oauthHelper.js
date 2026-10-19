'use strict';

const OAUTH_SCOPE = 'all-apis offline_access';
const OAUTH_REDIRECT_PORT = 8020;

let accessToken = '';
let cachedConnectionKey = '';

const getWorkspaceOrigin = ({ host = '' } = {}) => (host.endsWith('/') ? host.slice(0, -1) : host);

const getConnectionKey = ({ host, clientId } = {}) => `${getWorkspaceOrigin({ host })}|${clientId}`;

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
	const { accessToken: oauthAccessToken } = await app.require('@hackolade/oauth').getUserToMachineAccessToken({
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
