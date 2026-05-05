/**
 * Search-related actions
 */

import * as SyncActions from "./SyncActions";
import { asyncActionRequest, asyncActionSuccess } from "./SyncActions";
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
 * Start searching according the search criteria.
 * No search is triggered if nobody listens for the results.
 */
export function searchEverything() {
  return (dispatch: ThunkDispatch, getState: () => TermItState) => {
    dispatch({ type: ActionType.SEARCH_START });
    const state: TermItState = getState();
    if (
      state.searchListenerCount > 0 &&
      !state.searchQuery.isSearchStringBlank()
    ) {
      return dispatch(
        search(state.searchQuery.searchString, state.searchQuery.language, true)
      );
    } else {
      dispatch({ type: ActionType.SEARCH_FINISH });
      return Promise.resolve();
    }
  };
}

/**
 * The latest search promise. Results of any earlier ones that finish after it will be discarded.
 *
 * Inspired by https://github.com/domenic/last
 */
let latestSearch: Promise<any>;

export function search(
  searchString: string,
  language: string,
  disableLoading: boolean = true
) {
  const action = {
    type: ActionType.SEARCH,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(SyncActions.asyncActionRequest(action, disableLoading));
    const promiseToReturn = Ajax.get(
      Constants.API_PREFIX + "/search/fts",
      params({ searchString, language })
    )
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<SearchResultData>(
          data,
          SEARCH_RESULT_CONTEXT
        )
      )
      .then((data: SearchResultData[]) => {
        // If not the latest, do not dispatch results (Bug #380)
        if (latestSearch === promiseToReturn) {
          dispatch(searchResult(data.map((d) => new SearchResult(d))));
        }
        return dispatch(SyncActions.asyncActionSuccess(action));
      })
      .catch((error: ErrorData) => {
        dispatch(SyncActions.asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
    latestSearch = promiseToReturn;
    return promiseToReturn;
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
  const action = { type: ActionType.SEARCH };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
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
    return Ajax.post(
      Constants.API_PREFIX + "/search/advanced",
      content(searchParams)
        .params(queryParams)
        .contentType(Constants.JSON_MIME_TYPE)
        .accept(Constants.JSON_LD_MIME_TYPE)
        .preserveAcceptHeaderInPost()
    )
      .then(async (resp) => {
        const totalCount = Number(
          resp.headers[Constants.Headers.X_TOTAL_COUNT]
        );
        return JsonLdUtils.compactAndResolveReferencesAsArray<SearchResultData>(
          resp.data,
          SEARCH_RESULT_CONTEXT
        ).then((pageContent) => ({ totalCount, pageContent }));
      })
      .then((data: ResultPage<SearchResultData>) => {
        dispatch(asyncActionSuccess(action));
        return {
          totalCount: data.totalCount,
          pageContent: data.pageContent.map((d) => new SearchResult(d)),
        };
      })
      .catch((error: ErrorData) => {
        dispatch(SyncActions.asyncActionFailure(action, error));
        dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
        return Promise.resolve({
          totalCount: 0,
          pageContent: [] as SearchResult[],
        });
      });
  };
}
