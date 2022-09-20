import Constants from "./Constants";
import BrowserStorage from "./BrowserStorage";
import VocabularyUtils from "./VocabularyUtils";
import Utils from "./Utils";
import { AuthClientTokens } from "@react-keycloak/core";
import User, { EMPTY_USER } from "../model/User";

export default class SecurityUtils {
  public static saveToken(jwt: string): void {
    BrowserStorage.set(Constants.STORAGE_JWT_KEY, jwt);
  }

  public static loadToken(): string {
    return BrowserStorage.get(Constants.STORAGE_JWT_KEY, "")!;
  }

  public static clearToken(): void {
    BrowserStorage.remove(Constants.STORAGE_JWT_KEY);
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

  public static tokenSaver = (tokens: AuthClientTokens) => {
    if (tokens.token) {
      SecurityUtils.saveToken("Bearer " + tokens.token);
    }
  };
}
