import Keycloak from "keycloak-js";
import { Routing as RoutingCls } from "./Routing";
import Routes from "./Routes";
import Constants from "../util/Constants";

// Extract Keycloak URL and realm from generic OIDC auth URL
const OIDC_URL = Constants.COMPONENTS["al-auth-server"].url;
const match = /^(.+)\/realms\/(.+)$/.exec(OIDC_URL);
if (!match) {
    throw new Error("Invalid Keycloak configuration provided");
}
const [, url, realm] = match;

// Setup Keycloak instance
const keycloak = Keycloak({
    url,
    realm,
    clientId: Constants.ID,
});

/**
 * Refresh token minimum validity in seconds.
 *
 * Should be less than Access Token Lifespan in Keycloak.
 */
const KEYCLOAK_REFRESH_VALIDITY_TIME = 100;

keycloak.onTokenExpired = () => {
    keycloak
        .updateToken(KEYCLOAK_REFRESH_VALIDITY_TIME)
        .then((refreshed) => {
            if (!refreshed) {
                keycloak.login({
                    redirectUri: RoutingCls.buildFullUrl(Routes.dashboard),
                });
            }
        })
        .catch(() => {
            keycloak.login({
                redirectUri: RoutingCls.buildFullUrl(Routes.dashboard),
            });
        });
};

keycloak.onAuthRefreshError = () => {
    keycloak.login({ redirectUri: RoutingCls.buildFullUrl(Routes.dashboard) });
};

export default keycloak;
