import Authentication from "../util/Authentication";
import {userLogout} from "./SyncActions";
import Routes from "../util/Routes";
import Routing from "../util/Routing";
import {ThunkDispatch} from "../util/Types";

/*
 * Complex actions are basically just nice names for actions which involve both synchronous and asynchronous actions.
 * This way, the implementation details (e.g. that loginRequest means sending credentials to the server) do not leak into
 * the rest of the application.
 */

export function logout() {
    Authentication.clearToken();
    Routing.transitionTo(Routes.login);
    return (dispatch: ThunkDispatch) => {
        dispatch(userLogout());
    };
}
