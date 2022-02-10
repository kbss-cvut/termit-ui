import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import Ajax from "../../util/Ajax";
import { ThunkDispatch } from "../../util/Types";
import ActionType, { AsyncAction } from "../ActionType";
import SearchResult from "../../model/SearchResult";
import Vocabulary2 from "../../util/VocabularyUtils";
import { search, updateSearchFilter } from "../SearchActions";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => ({
  default: jest.fn(),
  content: jest.requireActual("../../util/Ajax").content,
  params: jest.requireActual("../../util/Ajax").params,
  param: jest.requireActual("../../util/Ajax").param,
  accept: jest.requireActual("../../util/Ajax").accept,
}));

const mockStore = configureMockStore<TermItState>([thunk]);

describe("SearchActions", () => {
  let store: MockStoreEnhanced<TermItState>;

  beforeEach(() => {
    store = mockStore(new TermItState());
  });

  describe("search", () => {
    it("emits search request action with ignore loading switch", () => {
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(search("test", true))
      ).then(() => {
        const searchRequestAction: AsyncAction = store.getActions()[0];
        expect(searchRequestAction.ignoreLoading).toBeTruthy();
      });
    });

    it("compacts incoming JSON-LD data using SearchResult context", () => {
      const results = require("../../rest-mock/searchResults");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(results));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(search("test", true))
      ).then(() => {
        const action = store.getActions()[1];
        const result = action.searchResults;
        expect(Array.isArray(result)).toBeTruthy();
        result.forEach((r: SearchResult) => {
          expect(r.iri).toBeDefined();
          expect(r.label).toBeDefined();
          if (r.hasType(Vocabulary2.TERM)) {
            expect(r.vocabulary).toBeDefined();
          }
        });
      });
    });
  });

  describe("updateSearchFilter", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(global, "setTimeout");
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("clears search results", () => {
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          updateSearchFilter("test")
        ) as Promise<any>
      ).then(() => {
        const actions = store.getActions();
        const clearAction = actions.find(
          (a) => a.type === ActionType.SEARCH_RESULT
        );
        expect(clearAction).toBeDefined();
        expect(clearAction.searchResults).toBeNull();
      });
    });

    it("delays search by predefined timeout", () => {
      const initialState = new TermItState();
      initialState.searchQuery.searchQuery = "tes";
      store = mockStore(initialState);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          updateSearchFilter("test")
        ) as Promise<any>
      ).then(() => {
        expect(setTimeout).toHaveBeenCalled();
      });
    });

    it("runs search after delay timeout expires", () => {
      const initialState = new TermItState();
      initialState.searchQuery.searchQuery = "tes";
      store = mockStore(initialState);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          updateSearchFilter("test")
        ) as Promise<any>
      ).then(() => {
        expect(setTimeout).toHaveBeenCalled();
        jest.runAllTimers();
        expect(
          store.getActions().find((a) => a.type === ActionType.SEARCH_START)
        ).toBeDefined();
      });
    });

    it("runs search only once when filter is updated multiple times during interval", () => {
      const initialState = new TermItState();
      initialState.searchQuery.searchQuery = "tes";
      store = mockStore(initialState);
      (store.dispatch as ThunkDispatch)(updateSearchFilter("test"));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          updateSearchFilter("tests")
        ) as Promise<any>
      ).then(() => {
        jest.runAllTimers();
        const searchActions = store
          .getActions()
          .filter((a) => a.type === ActionType.SEARCH_START);
        expect(searchActions.length).toEqual(1);
      });
    });

    it("runs search immediately to clear results when search string is empty", () => {
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          updateSearchFilter("test")
        ) as Promise<any>
      ).then(() => {
        const actions = store.getActions();
        expect(
          actions.find((a) => a.type === ActionType.SEARCH_RESULT)
        ).toBeDefined();
        expect(
          actions.find((a) => a.type === ActionType.SEARCH_START)
        ).toBeDefined();
        expect(
          actions.find((a) => a.type === ActionType.SEARCH_FINISH)
        ).toBeDefined();
      });
    });
  });
});
