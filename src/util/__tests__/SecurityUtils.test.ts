import SecurityUtils from "../SecurityUtils";
import Constants from "../Constants";
import BrowserStorage from "../BrowserStorage";

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
});
