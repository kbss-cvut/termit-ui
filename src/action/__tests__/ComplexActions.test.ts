import SecurityUtils from "../../util/SecurityUtils";
import { logout } from "../ComplexActions";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { userLogout } from "../SyncActions";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import { ThunkDispatch } from "../../util/Types";

jest.mock("../../util/SecurityUtils");
jest.mock("../../util/Routing");

const mockStore = configureMockStore([thunk]);

describe("Complex actions", () => {
  describe("logout", () => {
    it("invokes authentication logout in order to invalidate authentication token", () => {
      SecurityUtils.clearToken = jest.fn();
      logout();
      expect(SecurityUtils.clearToken).toHaveBeenCalled();
    });

    it("dispatches logout action to store", () => {
      const store = mockStore({});
      (store.dispatch as ThunkDispatch)(logout());
      expect(store.getActions()[0]).toEqual(userLogout());
    });

    it("transitions to login page", () => {
      logout();
      expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.login);
    });
  });
});
