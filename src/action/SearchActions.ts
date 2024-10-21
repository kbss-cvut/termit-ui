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
import {
  CONTEXT as FACETED_SEARCH_RESULT_CONTEXT,
  FacetedSearchResult,
} from "../model/search/FacetedSearchResult";

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

/**
 * Change the search criteria and trigger a new search.
 */
export function updateSearchFilter(searchString: string) {
  return (dispatch: ThunkDispatch, getState: () => TermItState) => {
    dispatch({
      type: ActionType.UPDATE_SEARCH_FILTER,
      searchString,
    });

    // Clear search results
    dispatch({ type: ActionType.SEARCH_RESULT, searchResults: null });

    // Stop waiting after previous update
    if (updateSearchTimer) {
      clearTimeout(updateSearchTimer);
    }

    const state = getState();
    if (state.searchQuery.isEmpty()) {
      // Don"t delay empty query as it will just reset searches without bothering the server
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
    if (state.searchListenerCount > 0 && !state.searchQuery.isEmpty()) {
      return dispatch(search(state.searchQuery.searchQuery, true));
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

export function search(searchString: string, disableLoading: boolean = true) {
  const action = {
    type: ActionType.SEARCH,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(SyncActions.asyncActionRequest(action, disableLoading));
    const promiseToReturn = Ajax.get(
      Constants.API_PREFIX + "/search/fts",
      params({ searchString })
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

export function executeFacetedTermSearch(
  params: SearchParam[],
  pageSpec: PageRequest = {
    page: 0,
    size: Constants.DEFAULT_PAGE_SIZE,
  }
) {
  const action = { type: ActionType.FACETED_SEARCH };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.post(
      Constants.API_PREFIX + "/search/faceted/terms",
      content(params)
        .params(pageSpec)
        .contentType(Constants.JSON_MIME_TYPE)
        .accept(Constants.JSON_LD_MIME_TYPE)
        .preserveAcceptHeaderInPost()
    )
      .then((resp) => {
        dispatch(asyncActionSuccess(action));
        return JsonLdUtils.compactAndResolveReferencesAsArray<FacetedSearchResult>(
          resp.data,
          FACETED_SEARCH_RESULT_CONTEXT
        );
      })
      .catch((error: ErrorData) => {
        dispatch(SyncActions.asyncActionFailure(action, error));
        dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
        return Promise.resolve([]);
      });
  };
}
