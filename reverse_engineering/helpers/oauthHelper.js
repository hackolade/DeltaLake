'use strict';

const OAUTH_SCOPE = 'all-apis offline_access';
const OAUTH_REDIRECT_PORT = 30424;
const OAUTH_MODULE = '@hackolade/oauth';
const OAUTH_UNAVAILABLE_MESSAGE = `The module ${OAUTH_MODULE} is not exposed by the application to the plugins!`;
const NEWER_STUDIO_MESSAGE =
	'This OAuth login needs a newer version of Hackolade Studio. Personal access token authentication is still available.';
const WORKSPACE_OAUTH_AUTH_METHOD = 'OAuth';
const AZURE_OAUTH_AUTH_METHOD = 'OAuth (Azure Databricks)';
const AZURE_DATABRICKS_PROVIDER = 'Azure Databricks';
const AZURE_DATABRICKS_SCOPE = '2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/user_impersonation';
const CONSENT_REQUIRED_ERROR_ID = 'AADSTS65001';
const AZURE_PROVIDER_REQUIRED_MESSAGE =
	'Microsoft Entra ID via authorization code flow (PCKE) is only available when the cloud provider is Azure Databricks.';

let accessToken = '';
let cachedConnectionKey = '';

const getWorkspaceOrigin = ({ host = '' } = {}) => (host.endsWith('/') ? host.slice(0, -1) : host);

const isWorkspaceOauth = ({ authMethod } = {}) => authMethod === WORKSPACE_OAUTH_AUTH_METHOD;

const isAzureOauth = ({ authMethod } = {}) => authMethod === AZURE_OAUTH_AUTH_METHOD;

const isOauthAuthMethod = ({ authMethod } = {}) => isWorkspaceOauth({ authMethod }) || isAzureOauth({ authMethod });

const getConnectionKey = ({ host, clientId, authMethod } = {}) =>
	`${authMethod}|${getWorkspaceOrigin({ host })}|${clientId}`;

const getConsentRequiredErrorMessage = ({ adminConsentBase, clientId } = {}) => {
	const consentLink = `${adminConsentBase}?client_id=${clientId}`;

	return `Your Azure administrator needs to grant tenant-wide consent to the Hackolade application using the link below: ${consentLink}`;
};

const isConsentRequiredError = ({ message = '' } = {}) =>
	message.includes(CONSENT_REQUIRED_ERROR_ID) || message.includes('consent_required');

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

const getWorkspaceOauthTokenOptions = ({ connectionInfo } = {}) => {
	const workspaceOrigin = getWorkspaceOrigin({ host: connectionInfo.host });

	return {
		authorizationEndpoint: `${workspaceOrigin}/oidc/v1/authorize`,
		tokenEndpoint: `${workspaceOrigin}/oidc/v1/token`,
		clientId: connectionInfo.clientId,
		scope: OAUTH_SCOPE,
		port: OAUTH_REDIRECT_PORT,
		failOnPortConflict: true,
	};
};

const getAzureOauthTokenOptions = ({ entra } = {}) => ({
	authorizationEndpoint: entra.authorizationEndpoint,
	tokenEndpoint: entra.tokenEndpoint,
	clientId: entra.productionClientId,
	scope: AZURE_DATABRICKS_SCOPE,
	port: OAUTH_REDIRECT_PORT,
	failOnPortConflict: true,
});

const assertAzureOauthProvider = ({ connectionInfo } = {}) => {
	if (connectionInfo?.provider === AZURE_DATABRICKS_PROVIDER) {
		return;
	}

	throw new Error(AZURE_PROVIDER_REQUIRED_MESSAGE);
};

const requestAccessToken = async ({ app, tokenOptions, entra } = {}) => {
	try {
		const { accessToken: oauthAccessToken } = await getOauthClient({ app }).browserLoginFlow(tokenOptions);

		return oauthAccessToken;
	} catch (error) {
		if (entra && tokenOptions?.clientId === entra.productionClientId && isConsentRequiredError(error)) {
			throw new Error(
				getConsentRequiredErrorMessage({
					adminConsentBase: entra.adminConsentBase,
					clientId: entra.productionClientId,
				}),
				{ cause: error },
			);
		}

		throw error;
	}
};

const resolveAccessToken = async ({ connectionInfo, app } = {}) => {
	if (!isOauthAuthMethod(connectionInfo)) {
		accessToken = '';
		cachedConnectionKey = '';

		return connectionInfo?.accessToken;
	}

	if (isAzureOauth(connectionInfo)) {
		assertAzureOauthProvider({ connectionInfo });
	}

	const entra = isAzureOauth(connectionInfo) ? getOauthClient({ app }).getEntraIdOAuthConfig() : null;
	const clientId = entra ? entra.productionClientId : connectionInfo.clientId;
	const connectionKey = getConnectionKey({
		host: connectionInfo.host,
		clientId,
		authMethod: connectionInfo.authMethod,
	});

	if (accessToken && cachedConnectionKey === connectionKey) {
		return accessToken;
	}

	const tokenOptions = entra
		? getAzureOauthTokenOptions({ entra })
		: getWorkspaceOauthTokenOptions({ connectionInfo });

	const oauthAccessToken = await requestAccessToken({ app, tokenOptions, entra });

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
