import Constants from "./Constants";
import BrowserStorage from "./BrowserStorage";
import VocabularyUtils from "./VocabularyUtils";
import Utils from "./Utils";
import User, { EMPTY_USER } from "../model/User";
import { getOidcIdentityStorageKey, isUsingOidcAuth } from "./OidcUtils";

export default class SecurityUtils {
  public static saveToken(jwt: string): void {
    BrowserStorage.set(Constants.STORAGE_JWT_KEY, jwt);
    BrowserStorage.dispatchTokenChangeEvent();
  }

  public static loadToken(): string {
    if (isUsingOidcAuth()) {
      return SecurityUtils.getOidcToken();
    }
    return BrowserStorage.get(Constants.STORAGE_JWT_KEY, "")!;
  }

  /**
   * Return access token of the currently logged-in user.
   * To be used as an Authorization header content for API fetch calls.
   * @return Authorization header contents if the token is available, empty string otherwise
   */
  private static getOidcToken(): string {
    const identityData = sessionStorage.getItem(getOidcIdentityStorageKey());
    const identity = identityData
      ? JSON.parse(identityData)
      : (null as User | null);
    if (identity) {
      return `${identity.token_type} ${identity.access_token}`;
    }
    return "";
  }

  public static clearToken(): void {
    if (isUsingOidcAuth()) {
      sessionStorage.removeItem(getOidcIdentityStorageKey());
    } else {
      BrowserStorage.remove(Constants.STORAGE_JWT_KEY);
    }
    BrowserStorage.dispatchTokenChangeEvent();
  }

  public static isLoggedIn(currentUser?: User | null): boolean {
    return !!currentUser && currentUser !== EMPTY_USER;
  }

  public static isEditor(currentUser?: User | null): boolean {
    return (
      SecurityUtils.isLoggedIn(currentUser) &&
      Utils.sanitizeArray(currentUser!.types).indexOf(
        VocabularyUtils.USER_RESTRICTED
      ) === -1
    );
  }
}
