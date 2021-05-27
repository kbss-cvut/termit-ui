import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import Constants from "../../util/Constants";
import Ajax from "../../util/Ajax";
import { ThunkDispatch } from "../../util/Types";
import { loadUser } from "../AsyncUserActions";
import Generator from "../../__tests__/environment/Generator";
import ActionType from "../ActionType";
import { ErrorData } from "../../model/ErrorInfo";
import { Action } from "redux";
import { DEFAULT_CONFIGURATION } from "../../model/Configuration";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => {
  const originalModule = jest.requireActual("../../util/Ajax");
  return {
    ...originalModule,
    default: jest.fn(),
  };
});
jest.mock("../../util/Keycloak");

const mockStore = configureMockStore<TermItState>([thunk]);

describe("AsyncUserActions", () => {
  let store: MockStoreEnhanced<TermItState>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore(new TermItState());
  });

  describe("fetch user", () => {
    it("does not publish error message when status is 401", () => {
      const error: ErrorData = {
        message: "Unauthorized",
        status: Constants.STATUS_UNAUTHORIZED,
      };
      Ajax.get = jest.fn().mockRejectedValue(error);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadUser())
      ).then(() => {
        const actions: Action[] = store.getActions();
        const found = actions.find(
          (a) => a.type === ActionType.PUBLISH_MESSAGE
        );
        return expect(found).not.toBeDefined();
      });
    });

    it("loads configuration after successful user fetch", () => {
      const user = Generator.generateUser();
      Ajax.get = jest
        .fn()
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(DEFAULT_CONFIGURATION);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadUser())
      ).then(() => {
        const actions: Action[] = store.getActions();
        expect(
          actions.find((a) => a.type === ActionType.LOAD_CONFIGURATION)
        ).toBeDefined();
      });
    });
  });
});
