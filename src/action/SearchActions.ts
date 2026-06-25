/**
 * Search-related actions
 */

import * as SyncActions from "./SyncActions";
import Ajax, { content, params } from "../util/Ajax";
import { PageRequest, ThunkDispatch } from "../util/Types";
import Constants from "../util/Constants";
import { ErrorData } from "../model/ErrorInfo";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import ActionType from "./ActionType";
import SearchResult, {
  CONTEXT as SEARCH_RESULT_CONTEXT,
  SearchResultData,
} from "../model/search/SearchResult";
import TermItState from "../model/TermItState";
import JsonLdUtils from "../util/JsonLdUtils";
import SearchParam from "../model/search/SearchParam";
import SearchQuery from "../model/search/SearchQuery";
import { ResultPage } from "../model/ResultPage";

/**
 * Add a search listener using a simple reference counting.
 * Search listener is anything that shows search results.
 */
export function addSearchListener() {
  return (dispatch: ThunkDispatch, getState: () => TermItState) => {
    dispatch({
      type: ActionType.ADD_SEARCH_LISTENER,
    });

    // Trigger the search when the first search listener appears
    const newState = getState();
    if (newState.searchListenerCount === 1) {
      return dispatch(searchEverything());
    } else {
      return Promise.resolve();
    }
  };
}

/**
 * Remove a search listener.
 */
export function removeSearchListener() {
  return {
    type: ActionType.REMOVE_SEARCH_LISTENER,
  };
}

/**
 * Timer to delay search requests as user is still typing.
 */
let updateSearchTimer: ReturnType<typeof setTimeout> | null = null;

export function updateSearchFilter(change: Partial<SearchQuery>) {
  return {
    type: ActionType.UPDATE_SEARCH_FILTER,
    ...change,
  };
}

export function resetSearchFilter() {
  return {
    type: ActionType.UPDATE_SEARCH_FILTER,
    ...new SearchQuery(),
  };
}

/**
 * Change the search criteria and trigger a new search.
 */
export function updateSearchFilterAndRunSearch(
  searchString: string,
  language: string
) {
  return (dispatch: ThunkDispatch, getState: () => TermItState) => {
    dispatch(updateSearchFilter({ searchString, language }));

    // Clear search results
    dispatch({ type: ActionType.SEARCH_RESULT, searchResults: null });

    // Stop waiting after previous update
    if (updateSearchTimer) {
      clearTimeout(updateSearchTimer);
    }

    const state = getState();
    if (state.searchQuery.isSearchStringBlank()) {
      // Do not delay empty query as it will just reset searches without bothering the server
      return dispatch(searchEverything());
    } else {
      // Delay the search while user types the query
      updateSearchTimer = setTimeout(() => {
        updateSearchTimer = null;
        dispatch(searchEverything());
      }, Constants.SEARCH_DEBOUNCE_DELAY);
      return Promise.resolve();
    }
  };
}

/**
 * Tracks an in-flight search dispatched via {@link searchEverything}. When a search is requested while
 * another one is already running, the new one is deferred and re-dispatched
 * once the running one finishes, using the latest query in the state.
 */
let searchInFlight: Promise<any> | null = null;
let pendingRerun = false;

/**
 * Start searching according the search criteria.
 * No search is triggered if nobody listens for the results.
 *
 * If a search is already in progress, the call is deferred: the most recent
 * query in the state will be re-dispatched once the running search finishes.
 * Any intermediate calls in between are coalesced into that single re-run.
 */
export function searchEverything() {
  return (dispatch: ThunkDispatch, getState: () => TermItState) => {
    if (searchInFlight) {
      // A search is already running; remember that we want to re-run once it
      // finishes. The re-run will use whatever query is in the state at that
      // point, so intermediate calls naturally coalesce.
      pendingRerun = true;
      return searchInFlight;
    }

    dispatch({ type: ActionType.SEARCH_START });
    const state: TermItState = getState();
    if (
      state.searchListenerCount > 0 &&
      !state.searchQuery.isSearchStringBlank()
    ) {
      const p = (
        dispatch(
          search(state.searchQuery.searchString, state.searchQuery.language)
        ) as unknown as Promise<any>
      ).then(
        (result) => {
          searchInFlight = null;
          if (pendingRerun) {
            pendingRerun = false;
            dispatch(searchEverything());
          }
          return result;
        },
        (error) => {
          searchInFlight = null;
          if (pendingRerun) {
            pendingRerun = false;
            dispatch(searchEverything());
          }
          throw error;
        }
      );
      searchInFlight = p;
      return p;
    } else {
      dispatch({ type: ActionType.SEARCH_FINISH });
      return Promise.resolve();
    }
  };
}

function performSearch<T>(
  dispatch: ThunkDispatch,
  doRequest: () => Promise<{ data: any; headers: Record<string, any> }>,
  onSuccess: (results: SearchResult[], headers: Record<string, any>) => T,
  errorFallback: T
): Promise<T> {
  const action = { type: ActionType.SEARCH };
  dispatch(SyncActions.asyncActionRequest(action, true));
  return doRequest()
    .then(async (resp) => {
      const data =
        await JsonLdUtils.compactAndResolveReferencesAsArray<SearchResultData>(
          resp.data,
          SEARCH_RESULT_CONTEXT
        );
      const results = data.map((d) => new SearchResult(d));
      const out = onSuccess(results, resp.headers ?? {});
      dispatch(SyncActions.asyncActionSuccess(action));
      return out;
    })
    .catch((error: ErrorData) => {
      dispatch(SyncActions.asyncActionFailure(action, error));
      dispatch(
        SyncActions.publishMessage(new Message(error, MessageType.ERROR))
      );
      return errorFallback;
    });
}

/**
 * The latest search promise. Results of any earlier ones that finish after it will be discarded.
 *
 * Inspired by https://github.com/domenic/last
 */
let latestSearch: Promise<any> | null = null;

export function search(searchString: string, language: string) {
  return (dispatch: ThunkDispatch) => {
    let promise: Promise<SearchResult[] | null> = null!;
    promise = performSearch<SearchResult[] | null>(
      dispatch,
      () =>
        Ajax.getResponse(
          Constants.API_PREFIX + "/search/fts",
          params({ searchString, language })
        ),
      (results) => {
        // If not the latest, do not dispatch results (Bug #380)
        if (latestSearch === promise) {
          dispatch(searchResult(results));
        }
        return results;
      },
      null
    );
    latestSearch = promise;
    return promise;
  };
}

export function searchResult(searchResults: SearchResult[]) {
  return (dispatch: ThunkDispatch) => {
    dispatch({ type: ActionType.SEARCH_RESULT, searchResults });
    dispatch({ type: ActionType.SEARCH_FINISH });
  };
}

/**
 * Runs advanced search combining full-text search with faceted filtering.
 * Uses the /search/advanced endpoint.
 */
export function executeAdvancedSearch(
  searchString: string,
  language: string,
  searchParams: SearchParam[],
  pageSpec: PageRequest = {
    page: 0,
    size: Constants.DEFAULT_PAGE_SIZE,
  }
) {
  return (dispatch: ThunkDispatch) => {
    const queryParams: Record<string, string | number> = {
      size: pageSpec.size,
      page: pageSpec.page,
    };
    if (searchString) {
      queryParams.searchString = searchString;
    }
    if (language) {
      queryParams.language = language;
    }
    return performSearch<ResultPage<SearchResult>>(
      dispatch,
      () =>
        Ajax.post(
          Constants.API_PREFIX + "/search/advanced",
          content(searchParams)
            .params(queryParams)
            .contentType(Constants.JSON_MIME_TYPE)
            .accept(Constants.JSON_LD_MIME_TYPE)
            .preserveAcceptHeaderInPost()
        ),
      (results, headers) => ({
        totalCount: Number(headers[Constants.Headers.X_TOTAL_COUNT]),
        pageContent: results,
      }),
      { totalCount: 0, pageContent: [] as SearchResult[] }
    );
  };
}
