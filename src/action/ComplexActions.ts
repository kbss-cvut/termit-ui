import SecurityUtils from "../util/SecurityUtils";
import Routes from "../util/Routes";
import Routing from "../util/Routing";
import { logout as asyncLogout } from "./AsyncUserActions";
import { ThunkDispatch } from "../util/Types";
import { getEnv } from "../util/Constants";

/*
 * Complex actions are basically just nice names for actions which involve both synchronous and asynchronous actions.
 * This way, the implementation details (e.g. that loginRequest means sending credentials to the server) do not leak into
 * the rest of the application.
 */

export function logout() {
  return (dispatch: ThunkDispatch) => {
    if (getEnv("AUTHENTICATION", "") === "oidc") {
      // TODO OIDC logout?
    } else {
      dispatch(asyncLogout());
    }
    SecurityUtils.clearToken();
    Routing.transitionTo(Routes.login);
  };
}
