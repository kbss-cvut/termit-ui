import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import Ajax from "../../util/Ajax";
import { ThunkDispatch } from "../../util/Types";
import ActionType, { AsyncAction } from "../ActionType";
import SearchResult from "../../model/search/SearchResult";
import Vocabulary2 from "../../util/VocabularyUtils";
import {
  search,
  searchEverything,
  updateSearchFilterAndRunSearch,
} from "../SearchActions";
import { vi } from "vitest";

vi.mock("../../util/Routing");
vi.mock(import("../../util/Ajax"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      get: vi.fn(),
      getResponse: vi.fn(),
      post: vi.fn(),
    } as any,
  };
});

const mockStore = configureMockStore<TermItState>([thunk]);

describe("SearchActions", () => {
  let store: MockStoreEnhanced<TermItState>;

  beforeEach(() => {
    store = mockStore(new TermItState());
  });

  describe("search", () => {
    it("emits search request action with ignore loading switch", () => {
      Ajax.getResponse = vi
        .fn()
        .mockImplementation(() => Promise.resolve({ data: [], headers: {} }));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(search("test", ""))
      ).then(() => {
        const searchRequestAction: AsyncAction = store.getActions()[0];
        expect(searchRequestAction.ignoreLoading).toBeTruthy();
      });
    });

    it("compacts incoming JSON-LD data using SearchResult context", () => {
      const results = require("../../rest-mock/searchResults");
      Ajax.getResponse = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ data: results, headers: {} })
        );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(search("test", ""))
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

    it("discards results of earlier search when they arrive after the most recent search", async () => {
      const results = require("../../rest-mock/searchResults");
      Ajax.getResponse = vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve: (val: any) => void) =>
              setTimeout(() => resolve({ data: [], headers: {} }), 1000)
            )
        )
        .mockImplementationOnce(() =>
          Promise.resolve({ data: results, headers: {} })
        );
      await Promise.all([
        (store.dispatch as ThunkDispatch)(search("t", "en")),
        (store.dispatch as ThunkDispatch)(search("test", "en")),
      ]);
      const actions = store
        .getActions()
        .filter((a) => a.type === ActionType.SEARCH_RESULT);
      expect(actions.length).toEqual(1);
    });
  });

  describe("searchEverything", () => {
    function stateWithListener(searchString: string = "test"): TermItState {
      const s = new TermItState();
      s.searchListenerCount = 1;
      s.searchQuery.searchString = searchString;
      return s;
    }

    it("defers concurrent search invocations and re-runs once after the in-flight one finishes", async () => {
      const results = require("../../rest-mock/searchResults");
      // Resolve the first request only after we trigger a second one
      let resolveFirst: (val: any) => void = () => undefined;
      Ajax.getResponse = vi
        .fn()
        .mockImplementationOnce(
          () => new Promise((resolve) => (resolveFirst = resolve))
        )
        .mockImplementationOnce(() =>
          Promise.resolve({ data: results, headers: {} })
        );

      store = mockStore(stateWithListener("first"));

      const firstPromise = (store.dispatch as ThunkDispatch)(
        searchEverything()
      );
      // Second call while the first is in-flight — should be deferred, not sent
      (store.dispatch as ThunkDispatch)(searchEverything());
      (store.dispatch as ThunkDispatch)(searchEverything());

      expect((Ajax.getResponse as any).mock.calls.length).toEqual(1);

      // Now let the first one finish — this should trigger exactly one re-run
      resolveFirst({ data: [], headers: {} });
      await firstPromise;
      // Allow the deferred re-run's promise chain to resolve
      await new Promise((r) => setTimeout(r, 0));

      expect((Ajax.getResponse as any).mock.calls.length).toEqual(2);
    });

    it("does not re-run when no concurrent invocation happened", async () => {
      Ajax.getResponse = vi
        .fn()
        .mockImplementation(() => Promise.resolve({ data: [], headers: {} }));
      store = mockStore(stateWithListener());
      await (store.dispatch as ThunkDispatch)(searchEverything());
      await new Promise((r) => setTimeout(r, 0));
      expect((Ajax.getResponse as any).mock.calls.length).toEqual(1);
    });
  });

  describe("updateSearchFilterAndRunSearch", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.spyOn(global, "setTimeout");
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("clears search results", () => {
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          updateSearchFilterAndRunSearch("test", "")
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
      initialState.searchQuery.searchString = "tes";
      store = mockStore(initialState);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          updateSearchFilterAndRunSearch("test", "")
        ) as Promise<any>
      ).then(() => {
        expect(setTimeout).toHaveBeenCalled();
      });
    });

    it("runs search after delay timeout expires", () => {
      const initialState = new TermItState();
      initialState.searchQuery.searchString = "tes";
      store = mockStore(initialState);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          updateSearchFilterAndRunSearch("test", "")
        ) as Promise<any>
      ).then(() => {
        expect(setTimeout).toHaveBeenCalled();
        vi.runAllTimers();
        expect(
          store.getActions().find((a) => a.type === ActionType.SEARCH_START)
        ).toBeDefined();
      });
    });

    it("runs search only once when filter is updated multiple times during interval", () => {
      const initialState = new TermItState();
      initialState.searchQuery.searchString = "tes";
      store = mockStore(initialState);
      (store.dispatch as ThunkDispatch)(
        updateSearchFilterAndRunSearch("test", "")
      );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          updateSearchFilterAndRunSearch("tests", "")
        ) as Promise<any>
      ).then(() => {
        vi.runAllTimers();
        const searchActions = store
          .getActions()
          .filter((a) => a.type === ActionType.SEARCH_START);
        expect(searchActions.length).toEqual(1);
      });
    });

    it("runs search immediately to clear results when search string is empty", () => {
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          updateSearchFilterAndRunSearch("test", "")
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
