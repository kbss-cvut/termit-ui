import Authentication from "../Authentication";
import Constants from "../Constants";
import {EMPTY_USER} from "../../model/User";
import Generator from "../../__tests__/environment/Generator";

describe("Authentication", () => {
    const jwt = "jwt12345";

    beforeEach(() => {
        localStorage.clear();
    });

    it("saves JWT into local storage on saveJwt", () => {
        Authentication.saveToken(jwt);
        expect(localStorage.setItem).toHaveBeenCalledWith(Constants.STORAGE_JWT_KEY, jwt);
    });

    it("loads JWT from local storage", () => {
        localStorage.__STORE__[Constants.STORAGE_JWT_KEY] = jwt;
        expect(Authentication.loadToken()).toEqual(jwt);
    });

    it("returns empty string when JWT is not present in local storage", () => {
        localStorage.clear();
        expect(Authentication.loadToken()).toEqual("");
    });

    it("clears local storage on clearJwt", () => {
        localStorage.__STORE__[Constants.STORAGE_JWT_KEY] = jwt;
        Authentication.clearToken();
        expect(localStorage.__STORE__[Constants.STORAGE_JWT_KEY]).not.toBeDefined();
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
