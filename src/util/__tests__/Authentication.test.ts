import Authentication from "../Authentication";
import Constants from "../Constants";
import { EMPTY_USER } from "../../model/User";
import Generator from "../../__tests__/environment/Generator";
import BrowserStorage from "../BrowserStorage";

jest.mock("../BrowserStorage");

describe("Authentication", () => {
  const jwt = "jwt12345";

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("saves JWT into browser storage on saveJwt", () => {
    Authentication.saveToken(jwt);
    expect(BrowserStorage.set).toHaveBeenCalledWith(
      Constants.STORAGE_JWT_KEY,
      jwt
    );
  });

  it("loads JWT from local storage", () => {
    (BrowserStorage.get as jest.Mock).mockReturnValue(jwt);
    expect(Authentication.loadToken()).toEqual(jwt);
  });

  it("returns empty string when JWT is not present in local storage", () => {
    (BrowserStorage.get as jest.Mock).mockReturnValue("");
    expect(Authentication.loadToken()).toEqual("");
  });

  it("clears local storage on clearJwt", () => {
    Authentication.clearToken();
    expect(BrowserStorage.remove).toHaveBeenCalledWith(
      Constants.STORAGE_JWT_KEY
    );
  });

  describe("isLoggedIn", () => {
    it("returns false for empty user", () => {
      expect(Authentication.isLoggedIn(null)).toBeFalsy();
      expect(Authentication.isLoggedIn(undefined)).toBeFalsy();
      expect(Authentication.isLoggedIn(EMPTY_USER)).toBeFalsy();
    });

    it("returns true for non-empty user", () => {
      expect(Authentication.isLoggedIn(Generator.generateUser())).toBeTruthy();
    });
  });
});
