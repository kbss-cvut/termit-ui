import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import Ajax from "../../util/Ajax";
import { ThunkDispatch } from "../../util/Types";
import { AsyncActionSuccess, MessageAction } from "../ActionType";
import { verifyExpectedAssets } from "../../__tests__/environment/TestUtil";
import { loadPublicTerm } from "../AsyncPublicViewActions";
import Constants from "../../util/Constants";
import Term from "../../model/Term";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => ({
  default: jest.fn(),
  content: jest.requireActual("../../util/Ajax").content,
  params: jest.requireActual("../../util/Ajax").params,
  param: jest.requireActual("../../util/Ajax").param,
  accept: jest.requireActual("../../util/Ajax").accept,
  contentType: jest.requireActual("../../util/Ajax").contentType,
  formData: jest.requireActual("../../util/Ajax").formData,
}));

const mockStore = configureMockStore<TermItState>([thunk]);

describe("AsyncPublicViewActions", () => {
  let store: MockStoreEnhanced<TermItState>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore(new TermItState());
  });

  describe("loadPublicTerm", () => {
    it("uses public API endpoint to fetch single vocabulary term", () => {
      const term = require("../../rest-mock/terms")[0];
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(term));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadPublicTerm("test-term", { fragment: "test-vocabulary" })
        )
      ).then((data: AsyncActionSuccess<Term> | MessageAction) => {
        const url = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(url).toContain(Constants.PUBLIC_API_PREFIX);
        verifyExpectedAssets(
          [term],
          [(data as AsyncActionSuccess<Term>).payload]
        );
      });
    });
  });
});
