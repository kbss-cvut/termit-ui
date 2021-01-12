import Keycloak from "keycloak-js";

// Setup Keycloak instance as needed
// TODO This should be loaded from the server/configured in build
const keycloak = Keycloak({
    url: "http://localhost:8080/auth",
    realm: "kodi",
    clientId: "termit-ui",
});

export default keycloak;
