import Keycloak from "keycloak-js";

// Setup Keycloak instance
const keycloak = Keycloak({
    url: process.env.REACT_APP_KEYCLOAK_URL,
    realm: process.env.REACT_APP_KEYCLOAK_REALM!,
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENTID!,
});

export default keycloak;
