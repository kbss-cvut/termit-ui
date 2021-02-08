import Keycloak from "keycloak-js";
import {Routing as RoutingCls} from "./Routing";
import Routes from "./Routes";

// Setup Keycloak instance
const keycloak = Keycloak({
    url: process.env.REACT_APP_KEYCLOAK_URL,
    realm: process.env.REACT_APP_KEYCLOAK_REALM!,
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENTID!,
});

/**
 * Refresh token minimum validity in seconds.
 *
 * Should be less than Access Token Lifespan in Keycloak.
 */
const KEYCLOAK_REFRESH_VALIDITY_TIME = 100;

keycloak.onTokenExpired = () => {
    keycloak.updateToken(KEYCLOAK_REFRESH_VALIDITY_TIME).then((refreshed) => {
        if (!refreshed) {
            keycloak.login({redirectUri: RoutingCls.buildFullUrl(Routes.dashboard)});
        }
    }).catch(() => {
        keycloak.login({redirectUri: RoutingCls.buildFullUrl(Routes.dashboard)});
    });
};

keycloak.onAuthRefreshError = () => {
    keycloak.login({redirectUri: RoutingCls.buildFullUrl(Routes.dashboard)});
};

export default keycloak;
