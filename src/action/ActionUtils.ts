import TermItState from "../model/TermItState";
import SecurityUtils from "../util/SecurityUtils";
import Constants from "../util/Constants";

/**
 * Gets the REST API prefix depending on whether a user is currently logged in or not.
 * @param state Current application state
 */
export function getApiPrefix(state: TermItState): string {
  return SecurityUtils.isLoggedIn(state.user)
    ? Constants.API_PREFIX
    : Constants.PUBLIC_API_PREFIX;
}
