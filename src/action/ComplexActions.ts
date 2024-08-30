import SecurityUtils from "../util/SecurityUtils";
import Routes from "../util/Routes";
import Routing from "../util/Routing";
import { logout as asyncLogout } from "./AsyncUserActions";
import { ThunkDispatch } from "../util/Types";
import { isUsingOidcAuth } from "../util/OidcUtils";
import { Client } from "react-stomp-hooks";

/*
 * Complex actions are basically just nice names for actions which involve both synchronous and asynchronous actions.
 * This way, the implementation details (e.g. that loginRequest means sending credentials to the server) do not leak into
 * the rest of the application.
 */

export function logout(stomClient?: Client) {
  return (dispatch: ThunkDispatch) => {
    const externalAuth = isUsingOidcAuth();
    if (!externalAuth) {
      dispatch(asyncLogout());
    }
    SecurityUtils.clearToken();
    if (stomClient) {
      stomClient.deactivate({ force: true });
    }
    Routing.transitionTo(externalAuth ? Routes.publicDashboard : Routes.login);
  };
}
