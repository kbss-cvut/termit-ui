import { Action, combineReducers } from "redux";
import ActionType, {
  AnnotatorLegendFilterAction,
  AsyncAction,
  AsyncActionSuccess,
  BreadcrumbAction,
  ExecuteQueryAction,
  FailureAction,
  MessageAction,
  NotificationAction,
  PendingAsyncAction,
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
import SearchResult from "../model/search/SearchResult";
import SearchQuery from "../model/search/SearchQuery";
import { ErrorLogItem } from "../model/ErrorInfo";
import Utils from "../util/Utils";
import { Configuration, DEFAULT_CONFIGURATION } from "../model/Configuration";
import { ConsolidatedResults } from "../model/ConsolidatedResults";
import File, { EMPTY_FILE } from "../model/File";
import VocabularyUtils, { IRIImpl } from "../util/VocabularyUtils";
import TermOccurrence from "../model/TermOccurrence";
import { Breadcrumb } from "../model/Breadcrumb";
import AnnotatorLegendFilter from "../model/AnnotatorLegendFilter";

function isAsyncSuccess(action: AsyncAction) {
  return action.status === AsyncActionStatus.SUCCESS;
}

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
      return isAsyncSuccess(action) ? action.payload : state;
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
      } else if (isAsyncSuccess(action)) {
        return action.payload as Vocabulary;
      } else {
        return state;
      }
    case ActionType.LOAD_VOCABULARY_IMPORTS:
      return isAsyncSuccess(action)
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
    case ActionType.UPDATE_RESOURCE:
    case ActionType.CREATE_RESOURCE: // intentional fall-through
      // the resource might have been/be related to the vocabulary
      return isAsyncSuccess(action) ? EMPTY_VOCABULARY : state;
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
      return isAsyncSuccess(action)
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
      if (isAsyncSuccess(action)) {
        const map = {};
        action.payload.forEach((v) => (map[v.iri] = v));
        return map;
      } else {
        return state;
      }
    case ActionType.LOGOUT:
      return {};
    case ActionType.IMPORT_SKOS:
      if (isAsyncSuccess(action)) {
        return {};
      }
      return state;
    default:
      return state;
  }
}

function selectedTerm(
  state: Term | null = null,
  action: SelectingTermsAction | AsyncActionSuccess<Term | string>
) {
  switch (action.type) {
    case ActionType.SELECT_VOCABULARY_TERM:
      return (action as SelectingTermsAction).selectedTerms;
    case ActionType.LOAD_TERM:
      const aa = action as AsyncActionSuccess<Term>;
      return aa.status === AsyncActionStatus.SUCCESS ? aa.payload : state;
    case ActionType.SET_TERM_STATE:
      const sts = action as AsyncActionSuccess<string>;
      return sts.status === AsyncActionStatus.SUCCESS
        ? new Term(
            Object.assign({}, state, {
              state: { iri: sts.payload },
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
      return isAsyncSuccess(action) ? state + 1 : state;
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
      if (isAsyncSuccess(action)) {
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

function fileContent(
  state: string | null = null,
  action: AsyncActionSuccess<string>
): string | null {
  switch (action.type) {
    case ActionType.LOAD_FILE_CONTENT:
      if (isAsyncSuccess(action)) {
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
      if (isAsyncSuccess(action)) {
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

function states(
  state: { [key: string]: RdfsResource } = {},
  action: AsyncActionSuccess<RdfsResource[]>
) {
  switch (action.type) {
    case ActionType.LOAD_STATES:
      if (isAsyncSuccess(action)) {
        return Utils.mapArray(action.payload);
      } else {
        return state;
      }
    default:
      return state;
  }
}

function terminalStates(
  state: string[] = [],
  action: AsyncActionSuccess<RdfsResource[]>
) {
  switch (action.type) {
    case ActionType.LOAD_STATES:
      if (isAsyncSuccess(action)) {
        return action.payload
          .filter(
            (r) => r.types.indexOf(VocabularyUtils.TERM_STATE_TERMINAL) !== -1
          )
          .map((r) => r.iri);
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
      return isAsyncSuccess(asyncAction) ? asyncAction.payload : state;
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
  state: { [key: string]: PendingAsyncAction } = {},
  action: AsyncAction
) {
  switch (action.status) {
    case AsyncActionStatus.REQUEST:
      if (state[action.type] !== undefined) {
        return state;
      }
      const toAdd = {};
      const pendingAsyncAction: PendingAsyncAction = {
        status: action.status,
        abortController: action.abortController,
      };
      toAdd[action.type] = pendingAsyncAction;
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
  if (action.type === ActionType.GET_LABEL && isAsyncSuccess(action)) {
    return Object.assign({}, state, action.payload);
  }
  // When changing the language, discard the cache and let them reload.
  if (action.type === ActionType.SWITCH_LANGUAGE) {
    return {};
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
      if (isAsyncSuccess(action)) {
        return Object.assign(
          {},
          state,
          action.payload as { [key: string]: Term }
        );
      }
      return {};
    case ActionType.ANNOTATOR_LOAD_TERM:
      if (isAsyncSuccess(action)) {
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
  if (action.type === ActionType.LOAD_CONFIGURATION && isAsyncSuccess(action)) {
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
      if (isAsyncSuccess(action)) {
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
      if (isAsyncSuccess(action)) {
        return Object.assign({}, state, { targeting: action.payload });
      } else {
        return state;
      }
    case ActionType.LOAD_DEFINITION_RELATED_TERMS_OF:
      if (isAsyncSuccess(action)) {
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

function breadcrumbs(state: Breadcrumb[] = [], action: BreadcrumbAction) {
  switch (action.type) {
    case ActionType.ADD_CRUMB:
      return [...state, action.payload];

    case ActionType.REMOVE_CRUMB:
      return state.filter((crumb) => {
        return crumb.id !== action.payload.id;
      });

    default:
      return state;
  }
}

function annotatorLegendFilter(
  state: AnnotatorLegendFilter | undefined,
  action: AnnotatorLegendFilterAction
) {
  if (state == null) {
    state = new AnnotatorLegendFilter();
  }
  if (action.type === ActionType.TOGGLE_ANNOTATOR_LEGEND_FILTER) {
    const newState = state.clone();
    const oldValue = state.get(action.annotationClass, action.annotationOrigin);

    newState.set(action.annotationClass, action.annotationOrigin, !oldValue);

    return newState;
  }
  return state;
}

function users(state: User[] = [], action: AsyncActionSuccess<User[]>) {
  switch (action.type) {
    case ActionType.LOAD_USERS:
      if (isAsyncSuccess(action)) {
        return action.payload;
      }
      return state;
    case ActionType.LOGOUT:
      return [];
    default:
      return state;
  }
}

function accessLevels(
  state: { [key: string]: RdfsResource } = {},
  action: AsyncActionSuccess<RdfsResource[]>
) {
  if (action.type === ActionType.LOAD_ACCESS_LEVELS && isAsyncSuccess(action)) {
    const newState = {};
    action.payload.forEach((r) => (newState[r.iri] = r));
    return newState;
  }
  return state;
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
  searchQuery,
  searchResults,
  searchListenerCount,
  searchInProgress,
  types,
  states,
  terminalStates,
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
  breadcrumbs,
  annotatorLegendFilter,
  users,
  accessLevels,
});

export default rootReducer;
