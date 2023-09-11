import { getEnv } from "./Constants";
import ConfigParam from "./ConfigParam";

// Taken from https://github.com/datagov-cz/assembly-line-shared but using a different config processing mechanism

/**
 * Base64 encoding helper
 */
const encodeBase64 = (uri: string) => {
  return window.btoa(uri);
};

/**
 * Forward URI encoding helper
 */
const encodeForwardUri = (uri: string) => {
  // Since base64 produces equal signs on the end, it needs to be further encoded
  return encodeURI(encodeBase64(uri));
};

export const getOidcConfig = () => {
  const clientId = getEnv("AUTH_CLIENT_ID");
  const baseUrl = resolveUrl();
  return {
    authority: getEnv("AUTH_SERVER_URL"),
    client_id: clientId,
    redirect_uri: `${baseUrl}/oidc-signin-callback.html?forward_uri=${encodeForwardUri(
      baseUrl
    )}`,
    silent_redirect_uri: `${baseUrl}/oidc-silent-callback.html`,
    post_logout_redirect_uri: baseUrl,
    response_type: "code",
    loadUserInfo: true,
    automaticSilentRenew: true,
    revokeAccessTokenOnSignout: true,
  };
};

function resolveUrl() {
  const loc = window.location;
  return loc.protocol + "//" + loc.host + loc.pathname;
}

/**
 * Helper to generate redirect Uri
 */
export const generateRedirectUri = (forwardUri: string) => {
  return `${resolveUrl()}/oidc-signin-callback.html?forward_uri=${encodeForwardUri(
    forwardUri
  )}`;
};

/**
 * OIDC Session storage key name
 */
export const getOidcIdentityStorageKey = () => {
  const oidcConfig = getOidcConfig();
  return `oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`;
};

export function useOidcAuth() {
  return getEnv(ConfigParam.AUTH_TYPE, "") === "oidc";
}
