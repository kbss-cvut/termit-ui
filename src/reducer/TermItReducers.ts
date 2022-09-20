import { Action, combineReducers } from "redux";
import ActionType, {
  AsyncAction,
  AsyncActionSuccess,
  ExecuteQueryAction,
  FacetedSearchAction,
  FailureAction,
  MessageAction,
  NotificationAction,
  PushRoutingPayloadAction,
  SearchAction,
  SearchResultAction,
  SelectingTermsAction,
  SwitchLanguageAction,
  UpdateLastModifiedAction,
} from "../action/ActionType";
import TermItState, { DefinitionallyRelatedTerms } from "../model/TermItState";
import User, { EMPTY_USER } from "../model/User";
import Message from "../model/Message";
import IntlData from "../model/IntlData";
import {
  loadInitialLocalizationData,
  loadLocalizationData,
} from "../util/IntlUtil";
import AsyncActionStatus from "../action/AsyncActionStatus";
import Vocabulary, { EMPTY_VOCABULARY } from "../model/Vocabulary";
import { default as QueryResult, QueryResultIF } from "../model/QueryResult";
import Term from "../model/Term";
import RdfsResource from "../model/RdfsResource";
import AppNotification from "../model/AppNotification";
import SearchResult from "../model/SearchResult";
import SearchQuery from "../model/SearchQuery";
import { ErrorLogItem } from "../model/ErrorInfo";
import Utils from "../util/Utils";
import { Configuration, DEFAULT_CONFIGURATION } from "../model/Configuration";
import { ConsolidatedResults } from "../model/ConsolidatedResults";
import File, { EMPTY_FILE } from "../model/File";
import { IRIImpl } from "../util/VocabularyUtils";
import TermOccurrence from "../model/TermOccurrence";
import TermStatus from "../model/TermStatus";

/**
 * Handles changes to the currently logged in user.
 *
 * The initial state is an empty user, which basically shouldn't be allowed to do anything.
 */
function user(
  state: User = EMPTY_USER,
  action: AsyncActionSuccess<User>
): User {
  switch (action.type) {
    case ActionType.FETCH_USER:
      return action.status === AsyncActionStatus.SUCCESS
        ? action.payload
        : state;
    case ActionType.LOGOUT:
      return EMPTY_USER;
    default:
      return state;
  }
}

/**
 * Handling loading state.
 *
 * Currently, this state is represented by a single boolean switch. The assumption is that there will always be one
 * component aware of the loading status and that one should display the loading mask.
 *
 * NOTE: This strategy is highly likely to change as we might have multiple components loading data independently of
 * each other
 */
function loading(state = false, action: AsyncAction): boolean {
  if (action.ignoreLoading) {
    return state;
  }
  switch (action.status) {
    case AsyncActionStatus.REQUEST:
      return true;
    case AsyncActionStatus.SUCCESS:
    case AsyncActionStatus.FAILURE:
      return false;
    default:
      return state;
  }
}

function messages(state: Message[] = [], action: MessageAction): Message[] {
  switch (action.type) {
    case ActionType.PUBLISH_MESSAGE:
      return [...state, action.message];
    case ActionType.DISMISS_MESSAGE:
      const newArr = state.slice(0);
      newArr.splice(newArr.indexOf(action.message), 1);
      return newArr;
    case ActionType.LOGOUT:
    case ActionType.LOGIN: // Intentional fall-through
    case ActionType.LOGIN_KEYCLOAK: // Intentional fall-through
      return [];
    default:
      return state;
  }
}

function intl(
  state: IntlData = loadInitialLocalizationData(),
  action: SwitchLanguageAction
): IntlData {
  switch (action.type) {
    case ActionType.SWITCH_LANGUAGE:
      return loadLocalizationData(action.language);
    default:
      return state;
  }
}

function vocabulary(
  state: Vocabulary = EMPTY_VOCABULARY,
  action: AsyncActionSuccess<Vocabulary | string[]>
): Vocabulary {
  switch (action.type) {
    case ActionType.LOAD_VOCABULARY:
      if (action.status === AsyncActionStatus.REQUEST) {
        return EMPTY_VOCABULARY;
      } else if (action.status === AsyncActionStatus.SUCCESS) {
        return action.payload as Vocabulary;
      } else {
        return state;
      }
    case ActionType.LOAD_VOCABULARY_IMPORTS:
      return action.status === AsyncActionStatus.SUCCESS
        ? new Vocabulary(
            Object.assign(state, {
              allImportedVocabularies: action.payload as string[],
            })
          )
        : state;
    case ActionType.LOAD_TERM_COUNT:
      return onTermCountLoaded(state, action);
    case ActionType.LOGOUT:
      return EMPTY_VOCABULARY;
    case ActionType.REMOVE_RESOURCE:
    case ActionType.CREATE_RESOURCE: // intentional fall-through
      // the resource might have been/be related to the vocabulary
      return action.status === AsyncActionStatus.SUCCESS
        ? EMPTY_VOCABULARY
        : state;
    default:
      return state;
  }
}

function onTermCountLoaded(state: Vocabulary, action: AsyncActionSuccess<any>) {
  if (action.status !== AsyncActionStatus.SUCCESS) {
    return state;
  }
  const vocIri = (action as any).vocabularyIri
    ? IRIImpl.toString((action as any).vocabularyIri)
    : "";
  if (state.iri !== vocIri) {
    return state;
  }
  return new Vocabulary(
    Object.assign({}, state, { termCount: action.payload })
  );
}

function selectedFile(
  state: File = EMPTY_FILE,
  action: AsyncActionSuccess<any>
): File {
  switch (action.type) {
    case ActionType.LOAD_RESOURCE:
      return action.status === AsyncActionStatus.SUCCESS
        ? action.payload.owner
          ? new File(action.payload)
          : action.payload
        : state;
    case ActionType.CLEAR_RESOURCE:
    case ActionType.LOGOUT:
      return EMPTY_FILE;
    default:
      return state;
  }
}

function vocabularies(
  state: { [key: string]: Vocabulary } | any = {},
  action: AsyncActionSuccess<Vocabulary[]>
): { [key: string]: Vocabulary } {
  switch (action.type) {
    case ActionType.LOAD_VOCABULARIES:
      if (action.status === AsyncActionStatus.SUCCESS) {
        const map = {};
        action.payload.forEach((v) => (map[v.iri] = v));
        return map;
      } else {
        return state;
      }
    case ActionType.LOGOUT:
      return {};
    default:
      return state;
  }
}

function selectedTerm(
  state: Term | null = null,
  action: SelectingTermsAction | AsyncActionSuccess<Term | TermStatus>
) {
  switch (action.type) {
    case ActionType.SELECT_VOCABULARY_TERM:
      return (action as SelectingTermsAction).selectedTerms;
    case ActionType.LOAD_TERM:
      const aa = action as AsyncActionSuccess<Term>;
      return aa.status === AsyncActionStatus.SUCCESS ? aa.payload : state;
    case ActionType.SET_TERM_STATUS:
      const sts = action as AsyncActionSuccess<TermStatus>;
      return sts.status === AsyncActionStatus.SUCCESS
        ? new Term(
            Object.assign({}, state, {
              draft: sts.payload === TermStatus.DRAFT,
            })
          )
        : state;
    case ActionType.LOGOUT:
      return null;
    default:
      return state;
  }
}

function createdTermsCounter(state: number = 0, action: AsyncAction) {
  switch (action.type) {
    case ActionType.CREATE_VOCABULARY_TERM:
      return action.status === AsyncActionStatus.SUCCESS ? state + 1 : state;
    case ActionType.LOGOUT:
      return 0;
    default:
      return state;
  }
}

function queryResults(
  state: { [key: string]: QueryResultIF } = {},
  action: ExecuteQueryAction
) {
  switch (action.type) {
    case ActionType.EXECUTE_QUERY:
      if (action.status === AsyncActionStatus.SUCCESS) {
        return {
          ...state,
          [action.queryString]: new QueryResult(
            action.queryString,
            action.queryResult
          ),
        };
      } else {
        return state;
      }
    case ActionType.LOGOUT:
      return {};
    default:
      return state;
  }
}

function facetedSearchResult(state: object = {}, action: FacetedSearchAction) {
  switch (action.type) {
    case ActionType.FACETED_SEARCH:
      return action.status === AsyncActionStatus.SUCCESS
        ? action.payload
        : state;
    case ActionType.LOGOUT:
      return {};
    default:
      return state;
  }
}

function fileContent(
  state: string | null = null,
  action: AsyncActionSuccess<string>
): string | null {
  switch (action.type) {
    case ActionType.LOAD_FILE_CONTENT:
      if (action.status === AsyncActionStatus.SUCCESS) {
        return action.payload;
      } else if (action.status === AsyncActionStatus.REQUEST) {
        return null;
      }
      return state;
    case ActionType.SAVE_FILE_CONTENT:
      return state; // TODO MB not updating file content for now
    case ActionType.CLEAR_FILE_CONTENT: // Intentional fall-through
    case ActionType.LOGOUT:
      return null;
    default:
      return state;
  }
}

function searchQuery(
  state: SearchQuery | undefined,
  action: SearchAction
): SearchQuery {
  switch (action.type) {
    case ActionType.UPDATE_SEARCH_FILTER:
      const newState = new SearchQuery(state);
      newState.searchQuery = action.searchString;
      return newState;
    case ActionType.LOGOUT:
      return new SearchQuery();
    default:
      return state || new SearchQuery();
  }
}

function searchResults(
  state: SearchResult[] | null = null,
  action: SearchResultAction
): SearchResult[] | null {
  switch (action.type) {
    case ActionType.SEARCH_RESULT:
      return action.searchResults;
    case ActionType.LOGOUT:
      return null;
    default:
      return state;
  }
}

function searchListenerCount(state: number = 0, action: Action): number {
  switch (action.type) {
    case ActionType.ADD_SEARCH_LISTENER:
      return state + 1;
    case ActionType.REMOVE_SEARCH_LISTENER:
      // Don't let it go below 0 (could happen on logout), we would not recover
      return Math.max(state - 1, 0);
    case ActionType.LOGOUT:
      return 0;
    default:
      return state;
  }
}

function searchInProgress(state: boolean = false, action: Action): boolean {
  switch (action.type) {
    case ActionType.SEARCH_START:
      return true;
    case ActionType.SEARCH_FINISH:
      return false;
    case ActionType.LOGOUT:
      return false;
    default:
      return state;
  }
}

function types(
  state: { [key: string]: Term } | any = {},
  action: AsyncActionSuccess<Term[]>
): { [key: string]: Term } {
  switch (action.type) {
    case ActionType.LOAD_TYPES:
      if (action.status === AsyncActionStatus.SUCCESS) {
        const map = {};
        action.payload.forEach((v) => (map[v.iri] = v));
        return map;
      } else {
        return state;
      }
    default:
      return state;
  }
}

function properties(
  state: RdfsResource[] = [],
  action: AsyncActionSuccess<RdfsResource[]> | Action
): RdfsResource[] {
  switch (action.type) {
    case ActionType.GET_PROPERTIES:
      const asyncAction = action as AsyncActionSuccess<RdfsResource[]>;
      return asyncAction.status === AsyncActionStatus.SUCCESS
        ? asyncAction.payload
        : state;
    case ActionType.CLEAR_PROPERTIES:
      return [];
    default:
      return state;
  }
}

function notifications(
  state: AppNotification[] = [],
  action: NotificationAction
) {
  switch (action.type) {
    case ActionType.PUBLISH_NOTIFICATION:
      return [...state, action.notification];
    case ActionType.CONSUME_NOTIFICATION:
      const index = state.indexOf(action.notification);
      if (index >= 0) {
        const newState = state.slice();
        newState.splice(index, 1);
        return newState;
      }
      return state;
    default:
      return state;
  }
}

function pendingActions(
  state: { [key: string]: AsyncActionStatus } = {},
  action: AsyncAction
) {
  switch (action.status) {
    case AsyncActionStatus.REQUEST:
      if (state[action.type] !== undefined) {
        return state;
      }
      const toAdd = {};
      toAdd[action.type] = action.status;
      return Object.assign({}, state, toAdd);
    case AsyncActionStatus.SUCCESS:
    case AsyncActionStatus.FAILURE:
      const copy = Object.assign({}, state);
      delete copy[action.type];
      return copy;
    default:
      return state;
  }
}

function errors(state: ErrorLogItem[] = [], action: FailureAction) {
  if (action.error) {
    const logItem = {
      timestamp: Date.now(),
      error: action.error,
    };
    return [logItem, ...state];
  } else if (action.type === ActionType.CLEAR_ERRORS) {
    return [];
  }
  return state;
}

/**
 * Stores last modified values for asset lists, as returned by the server in the Last-Modified HTTP header.
 */
function lastModified(
  state: { [key: string]: string } = {},
  action: UpdateLastModifiedAction
) {
  if (action.type === ActionType.UPDATE_LAST_MODIFIED) {
    const change = {};
    change[action.key] = action.value;
    return Object.assign({}, state, change);
  }
  return state;
}

function labelCache(
  state: { [key: string]: string } = {},
  action: AsyncActionSuccess<{ [key: string]: string }>
) {
  if (
    action.type === ActionType.GET_LABEL &&
    action.status === AsyncActionStatus.SUCCESS
  ) {
    return Object.assign({}, state, action.payload);
  }
  return state;
}

function sidebarExpanded(state: boolean = true, action: Action) {
  switch (action.type) {
    case ActionType.TOGGLE_SIDEBAR:
      return !state;
    default:
      return state;
  }
}

function desktopView(state: boolean = Utils.isDesktopView(), action: Action) {
  switch (action.type) {
    case ActionType.DESKTOP_VIEW:
      return !state;
    default:
      return state;
  }
}

function routeTransitionPayload(
  state: { [key: string]: any } = {},
  action: PushRoutingPayloadAction
) {
  switch (action.type) {
    case ActionType.PUSH_ROUTING_PAYLOAD:
      const push = {};
      push[action.routeName] = action.payload;
      return Object.assign({}, state, push);
    case ActionType.POP_ROUTING_PAYLOAD:
      const remove = {};
      remove[action.routeName] = undefined;
      return Object.assign({}, state, remove);
    default:
      return state;
  }
}

function annotatorTerms(
  state: { [key: string]: Term } = {},
  action: AsyncActionSuccess<{ [key: string]: Term } | Term>
): { [key: string]: Term } {
  switch (action.type) {
    case ActionType.ANNOTATOR_LOAD_TERMS:
      if (action.status === AsyncActionStatus.SUCCESS) {
        return action.payload as { [key: string]: Term };
      }
      return {};
    case ActionType.ANNOTATOR_LOAD_TERM:
      if (action.status === AsyncActionStatus.SUCCESS) {
        const change = {};
        const payload = action.payload as Term;
        change[payload.iri] = payload;
        return Object.assign({}, state, change);
      }
      return state;
    default:
      return state;
  }
}

function configuration(
  state: Configuration = DEFAULT_CONFIGURATION,
  action: AsyncActionSuccess<Configuration>
) {
  if (
    action.type === ActionType.LOAD_CONFIGURATION &&
    action.status === AsyncActionStatus.SUCCESS
  ) {
    return action.payload;
  }
  return state;
}

function validationResults(
  state: { [vocabularyIri: string]: ConsolidatedResults } = {},
  action: AsyncActionSuccess<{ [vocabularyIri: string]: ConsolidatedResults }>
) {
  switch (action.type) {
    case ActionType.FETCH_VALIDATION_RESULTS:
      if (action.status === AsyncActionStatus.SUCCESS) {
        return {
          ...state,
          ...action.payload,
        };
      } else {
        return state;
      }
    case ActionType.LOGOUT:
      return {};
    default:
      return state;
  }
}

function definitionallyRelatedTerms(
  state: DefinitionallyRelatedTerms = { targeting: [], of: [] },
  action: AsyncActionSuccess<TermOccurrence[]>
) {
  switch (action.type) {
    case ActionType.LOAD_DEFINITION_RELATED_TERMS_TARGETING:
      if (action.status === AsyncActionStatus.SUCCESS) {
        return Object.assign({}, state, { targeting: action.payload });
      } else {
        return state;
      }
    case ActionType.LOAD_DEFINITION_RELATED_TERMS_OF:
      if (action.status === AsyncActionStatus.SUCCESS) {
        return Object.assign({}, state, { of: action.payload });
      } else {
        return state;
      }
    case ActionType.LOAD_TERM:
      return action.status === AsyncActionStatus.REQUEST
        ? { targeting: [], of: [] }
        : state;
    default:
      return state;
  }
}

const rootReducer = combineReducers<TermItState>({
  user,
  loading,
  vocabulary,
  vocabularies,
  selectedFile,
  messages,
  intl,
  selectedTerm,
  queryResults,
  createdTermsCounter,
  fileContent,
  facetedSearchResult,
  searchQuery,
  searchResults,
  searchListenerCount,
  searchInProgress,
  types,
  properties,
  notifications,
  pendingActions,
  errors,
  lastModified,
  routeTransitionPayload,
  labelCache,
  sidebarExpanded,
  desktopView,
  annotatorTerms,
  configuration,
  validationResults,
  definitionallyRelatedTerms,
});

export default rootReducer;
