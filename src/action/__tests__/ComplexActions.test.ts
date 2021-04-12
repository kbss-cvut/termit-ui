import Authentication from "../../util/Authentication";
import { logout } from "../ComplexActions";
import configureMockStore from "redux-mock-store";
import thunk, {ThunkDispatch} from "redux-thunk";
import {Action} from "redux";
import {userLogout} from "../SyncActions";
import Routes from "../../util/Routes";
import keycloak from "../../util/Keycloak";

jest.mock("../../util/Authentication");
jest.mock("../../util/Routing");
jest.mock("../../util/Keycloak", () => ({
    logout: jest.fn()
}));

const mockStore = configureMockStore([thunk]);

describe("Complex actions", () => {
    describe("logout", () => {
        it("invokes authentication logout in order to invalidate authentication token", () => {
            Authentication.clearToken = jest.fn();
            logout();
            expect(Authentication.clearToken).toHaveBeenCalled();
        });

        it("dispatches logout action to store", () => {
            const store = mockStore({});
            (store.dispatch as ThunkDispatch<object, undefined, Action>)(
                logout()
            );
            expect(store.getActions()[0]).toEqual(userLogout());
        });

        it("passes public dashboard route as logout redirect URI", () => {
            logout();
            const args = (keycloak.logout as jest.Mock).mock.calls[0][0];
            expect(args.redirectUri).toContain(Routes.publicDashboard.path);
        });

        it("invokes Keycloak logout", () => {
            logout();
            expect(keycloak.logout).toHaveBeenCalled();
        });
    });
});
