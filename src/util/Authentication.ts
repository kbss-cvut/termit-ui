import Constants from "./Constants";
import User, { EMPTY_USER } from "../model/User";
import BrowserStorage from "./BrowserStorage";

export default class Authentication {
  public static saveToken(jwt: string): void {
    BrowserStorage.set(Constants.STORAGE_JWT_KEY, jwt);
  }

  public static loadToken(): string {
    return BrowserStorage.get(Constants.STORAGE_JWT_KEY, "")!;
  }

  public static clearToken(): void {
    BrowserStorage.remove(Constants.STORAGE_JWT_KEY);
  }

  public static isLoggedIn(currentUser?: User | null) {
    return currentUser && currentUser !== EMPTY_USER;
  }
}
