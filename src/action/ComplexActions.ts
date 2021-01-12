import Authentication from "../util/Authentication";
import {userLogout} from "./SyncActions";
import {ThunkDispatch} from "../util/Types";
import keycloak from "../util/Keycloak";

/*
 * Complex actions are basically just nice names for actions which involve both synchronous and asynchronous actions.
 * This way, the implementation details (e.g. that loginRequest means sending credentials to the server) do not leak into
 * the rest of the application.
 */

export function logout() {
    // TODO The redirect URI must be resolved dynamically
    keycloak.logout({redirectUri: "https://localhost:3000/#/public"});
    Authentication.clearToken();
    return (dispatch: ThunkDispatch) => {
        dispatch(userLogout());
    };
}
