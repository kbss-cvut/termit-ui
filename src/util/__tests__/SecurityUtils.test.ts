import SecurityUtils from "../SecurityUtils";
import Constants from "../Constants";
import { EMPTY_USER } from "../../model/User";
import Generator from "../../__tests__/environment/Generator";
import BrowserStorage from "../BrowserStorage";
import VocabularyUtils from "../VocabularyUtils";

jest.mock("../BrowserStorage");

describe("SecurityUtils", () => {
  const jwt = "jwt12345";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("saves JWT into browser storage on saveJwt", () => {
    SecurityUtils.saveToken(jwt);
    expect(BrowserStorage.set).toHaveBeenCalledWith(
      Constants.STORAGE_JWT_KEY,
      jwt
    );
  });

  it("loads JWT from local storage", () => {
    (BrowserStorage.get as jest.Mock).mockReturnValue(jwt);
    expect(SecurityUtils.loadToken()).toEqual(jwt);
  });

  it("returns empty string when JWT is not present in local storage", () => {
    (BrowserStorage.get as jest.Mock).mockReturnValue("");
    expect(SecurityUtils.loadToken()).toEqual("");
  });

  it("clears local storage on clearJwt", () => {
    SecurityUtils.clearToken();
    expect(BrowserStorage.remove).toHaveBeenCalledWith(
      Constants.STORAGE_JWT_KEY
    );
  });

  describe("isLoggedIn", () => {
    it("returns false for empty user", () => {
      expect(SecurityUtils.isLoggedIn(null)).toBeFalsy();
      expect(SecurityUtils.isLoggedIn(undefined)).toBeFalsy();
      expect(SecurityUtils.isLoggedIn(EMPTY_USER)).toBeFalsy();
    });

    it("returns true for non-empty user", () => {
      expect(SecurityUtils.isLoggedIn(Generator.generateUser())).toBeTruthy();
    });
  });

  describe("isEditor", () => {
    it("returns false when user has restricted user type", () => {
      const user = Generator.generateUser();
      user.types.push(VocabularyUtils.USER_RESTRICTED);
      expect(SecurityUtils.isEditor(user)).toBeFalsy();
    });

    it("returns true for regular user and admin", () => {
      const user = Generator.generateUser();
      expect(SecurityUtils.isEditor(user)).toBeTruthy();
      user.types.push(VocabularyUtils.USER_ADMIN);
      expect(SecurityUtils.isEditor(user)).toBeTruthy();
    });

    it("returns false when user is not logged in at all", () => {
      expect(SecurityUtils.isEditor(null)).toBeFalsy();
      expect(SecurityUtils.isEditor(undefined)).toBeFalsy();
    });
  });
});
