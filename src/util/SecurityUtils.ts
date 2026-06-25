import Constants from "./Constants";
import BrowserStorage from "./BrowserStorage";
import User, { EMPTY_USER } from "../model/User";
import { getOidcIdentityStorageKey, isUsingOidcAuth } from "./OidcUtils";

export default class SecurityUtils {
  public static readonly PASSWORD_MIN_LENGTH = 8;
  public static readonly PASSWORD_MAX_LENGTH = 64;

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

  public static isPasswordValid(password: string) {
    return (
      password.length >= SecurityUtils.PASSWORD_MIN_LENGTH &&
      password.length < SecurityUtils.PASSWORD_MAX_LENGTH &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password) &&
      /\d/.test(password)
    );
  }
}
