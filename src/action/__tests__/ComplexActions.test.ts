import SecurityUtils from "../../util/SecurityUtils";
import { logout } from "../ComplexActions";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import { ThunkDispatch } from "../../util/Types";
import ActionType from "../ActionType";
import Ajax from "../../util/Ajax";

jest.mock("../../util/SecurityUtils");
jest.mock("../../util/Routing");
jest.mock("../../util/Ajax");

const mockStore = configureMockStore([thunk]);

describe("Complex actions", () => {
  describe("logout", () => {
    beforeEach(() => {
      (Ajax.get as jest.Mock).mockResolvedValue({});
    });

    it("invokes authentication logout in order to invalidate authentication token", () => {
      const store = mockStore({});
      SecurityUtils.clearToken = jest.fn();
      (store.dispatch as ThunkDispatch)(logout());
      expect(SecurityUtils.clearToken).toHaveBeenCalled();
    });

    it("dispatches logout action to store", () => {
      const store = mockStore({});
      (store.dispatch as ThunkDispatch)(logout());
      expect(store.getActions()[0].type).toEqual(ActionType.LOGOUT);
    });

    it("transitions to login page", () => {
      const store = mockStore({});
      (store.dispatch as ThunkDispatch)(logout());
      expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.login);
    });
  });
});
