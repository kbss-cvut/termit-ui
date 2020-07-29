import Authentication from "../../util/Authentication";
import {logout} from "../ComplexActions";
import configureMockStore from "redux-mock-store";
import thunk, {ThunkDispatch} from "redux-thunk";
import {Action} from "redux";
import {userLogout} from "../SyncActions";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";

jest.mock("../../util/Authentication");
jest.mock("../../util/Routing");

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
            (store.dispatch as ThunkDispatch<object, undefined, Action>)(logout());
            expect(store.getActions()[0]).toEqual(userLogout());
        });

        it("transitions to login page", () => {
            logout();
            expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.login);
        });
    });
});
