import ErrorInfo from "../model/ErrorInfo";
import Message from "../model/Message";
import AsyncActionStatus from "./AsyncActionStatus";
import Term from "../model/Term";
import { Action } from "redux";
import SearchResult from "../model/SearchResult";
import AppNotification from "../model/AppNotification";
import { Breadcrumb } from "../model/Breadcrumb";

export interface AsyncAction extends Action {
  status: AsyncActionStatus;
  ignoreLoading?: boolean; // Allows to prevent loading spinner display on async action
}

export interface FailureAction extends Action {
  error: ErrorInfo;
}

export interface AsyncFailureAction extends AsyncAction, FailureAction {}

export interface AsyncActionSuccess<T> extends AsyncAction {
  payload: T;
}

export interface MessageAction extends Action {
  message: Message;
}

export interface SwitchLanguageAction extends Action {
  language: string;
}

export interface SelectingTermsAction extends Action {
  selectedTerms: Term | null;
}

export interface ExecuteQueryAction extends AsyncAction {
  queryString: string;
  queryResult: object;
}

export interface FacetedSearchAction extends AsyncAction {
  payload: object;
}

export interface SearchAction extends Action {
  searchString: string;
}

export interface SearchResultAction extends Action {
  searchResults: SearchResult[];
}

export interface NotificationAction extends Action {
  notification: AppNotification;
}

export interface UpdateLastModifiedAction extends Action {
  key: string;
  value: string;
}

export interface PushRoutingPayloadAction extends Action {
  routeName: string;
  payload: any;
}

export interface BreadcrumbAction extends Action {
  payload: Breadcrumb;
}

const ActionType = {
  FETCH_USER: "FETCH_USER",
  LOGIN: "LOGIN",
  LOGIN_KEYCLOAK: "LOGIN_KEYCLOAK",
  REGISTER: "REGISTER",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  CHANGE_PASSWORD: "CHANGE_PASSWORD",
  LOGOUT: "LOGOUT",
  CREATE_USER: "CREATE_USER",

  PUBLISH_MESSAGE: "PUBLISH_MESSAGE",
  DISMISS_MESSAGE: "DISMISS_MESSAGE",
  SWITCH_LANGUAGE: "SWITCH_LANGUAGE",
  CLEAR_ERRORS: "CLEAR_ERRORS",

  PUBLISH_NOTIFICATION: "PUBLISH_NOTIFICATION",
  CONSUME_NOTIFICATION: "CONSUME_NOTIFICATION",
  UPDATE_LAST_MODIFIED: "UPDATE_LAST_MODIFIED",

  PUSH_ROUTING_PAYLOAD: "PUSH_ROUTING_PAYLOAD",
  POP_ROUTING_PAYLOAD: "POP_ROUTING_PAYLOAD",

  CREATE_VOCABULARY: "CREATE_VOCABULARY",
  LOAD_VOCABULARY: "LOAD_VOCABULARY",
  SELECT_VOCABULARY_TERM: "SELECT_VOCABULARY_TERM",
  LOAD_VOCABULARIES: "LOAD_VOCABULARIES",
  UPDATE_VOCABULARY: "UPDATE_VOCABULARY",
  LOAD_VOCABULARY_IMPORTS: "LOAD_VOCABULARY_IMPORTS",
  LOAD_RELATED_VOCABULARIES: "LOAD_RELATED_VOCABULARIES",
  FETCH_UNUSED_TERMS_FOR_VOCABULARY: "FETCH_UNUSED_TERMS_FOR_VOCABULARY",
  REMOVE_VOCABULARY: "REMOVE_VOCABULARY",
  CREATE_VOCABULARY_SNAPSHOT: "CREATE_VOCABULARY_SNAPSHOT",

  LOAD_VOCABULARY_HISTORY: "LOAD_VOCABULARY_HISTORY",
  LOAD_VOCABULARY_CONTENT_HISTORY: "LOAD_VOCABULARY_CONTENT_HISTORY",
  LOAD_TERM_COUNT: "LOAD_TERM_COUNT",

  FETCH_VALIDATION_RESULTS: "FETCH_VALIDATION_RESULTS",

  CREATE_VOCABULARY_TERM: "CREATE_VOCABULARY_TERM",
  FETCH_VOCABULARY_TERMS: "FETCH_VOCABULARY_TERMS", // Loads initially only root terms
  FETCH_ALL_TERMS: "FETCH_ALL_TERMS",
  LOAD_DEFAULT_TERMS: "LOAD_DEFAULT_TERMS",
  FETCH_TERM: "FETCH_TERM",
  LOAD_TERM: "LOAD_TERM",
  LOAD_TERM_BY_IRI: "LOAD_TERM_BY_IRI",
  UPDATE_TERM: "UPDATE_TERM",
  LOAD_RELATED_TERMS: "LOAD_RELATED_TERMS",
  LOAD_DEFINITION_RELATED_TERMS_TARGETING:
    "LOAD_DEFINITION_RELATED_TERMS_TARGETING",
  LOAD_DEFINITION_RELATED_TERMS_OF: "LOAD_DEFINITION_RELATED_TERMS_OF",
  REMOVE_VOCABULARY_TERM: "REMOVE_VOCABULARY_TERM",
  SET_TERM_STATUS: "SET_TERM_STATUS",

  CREATE_TERM_OCCURRENCE: "CREATE_TERM_OCCURRENCE",
  UPDATE_TERM_OCCURRENCE: "UPDATE_TERM_OCCURRENCE",
  REMOVE_TERM_OCCURRENCE: "REMOVE_TERM_OCCURRENCE",
  APPROVE_TERM_OCCURRENCE: "APPROVE_TERM_OCCURRENCE",
  SET_TERM_DEFINITION_SOURCE: "SET_TERM_DEFINITION_SOURCE",
  REMOVE_TERM_DEFINITION_SOURCE: "REMOVE_TERM_DEFINITION_SOURCE",

  LOAD_TERM_HISTORY: "LOAD_TERM_HISTORY",

  LOAD_TYPES: "LOAD_TYPES",
  LOAD_SNAPSHOTS: "LOAD_SNAPSHOTS",
  REMOVE_SNAPSHOT: "REMOVE_SNAPSHOT",

  EXECUTE_QUERY: "EXECUTE_QUERY",
  FACETED_SEARCH: "FACETED_SEARCH",
  SEARCH: "SEARCH",
  SEARCH_RESULT: "SEARCH_RESULT",
  UPDATE_SEARCH_FILTER: "UPDATE_SEARCH_FILTER",
  SEARCH_START: "SEARCH_START",
  SEARCH_FINISH: "SEARCH_FINISH",

  ADD_SEARCH_LISTENER: "ADD_SEARCH_LISTENER",
  REMOVE_SEARCH_LISTENER: "REMOVE_SEARCH_LISTENER",

  GET_FILE_CONTENT_TYPE: "GET_FILE_CONTENT_TYPE",
  LOAD_FILE_CONTENT: "LOAD_FILE_CONTENT",
  SAVE_FILE_CONTENT: "SAVE_FILE_CONTENT",
  HAS_FILE_CONTENT: "HAS_FILE_CONTENT",
  EXPORT_FILE_CONTENT: "EXPORT_FILE_CONTENT",
  CLEAR_FILE_CONTENT: "CLEAR_FILE_CONTENT",

  CREATE_RESOURCE: "CREATE_RESOURCE",
  LOAD_RESOURCE: "LOAD_RESOURCE",
  LOAD_RESOURCES: "LOAD_RESOURCES",
  UPDATE_RESOURCE: "UPDATE_RESOURCE",
  CLEAR_RESOURCE: "CLEAR_RESOURCE",
  REMOVE_RESOURCE: "REMOVE_RESOURCE",
  LOAD_FILE_METADATA: "LOAD_FILE_METADATA",

  EXECUTE_FILE_TEXT_ANALYSIS: "EXECUTE_FILE_TEXT_ANALYSIS",
  LOAD_LATEST_TEXT_ANALYSIS_RECORD: "LOAD_LATEST_TEXT_ANALYSIS_RECORD",
  EXECUTE_TEXT_ANALYSIS_ON_DEFINITION: "EXECUTE_TEXT_ANALYSIS_ON_DEFINITION",
  EXECUTE_TEXT_ANALYSIS_ON_ALL_DEFINITIONS:
    "EXECUTE_TEXT_ANALYSIS_ON_ALL_DEFINITIONS",
  EXECUTE_TEXT_ANALYSIS_ON_ALL_VOCABULARIES:
    "EXECUTE_TEXT_ANALYSIS_ON_ALL_VOCABULARIES",

  GET_LABEL: "GET_LABEL",
  GET_RESOURCE: "GET_RESOURCE",
  GET_PROPERTIES: "GET_PROPERTIES",
  CREATE_PROPERTY: "CREATE_PROPERTY",
  CLEAR_PROPERTIES: "CLEAR_PROPERTIES",

  EXPORT_GLOSSARY: "EXPORT_GLOSSARY",

  LOAD_MY: "LOAD_MY",
  LOAD_LAST_EDITED: "LOAD_LAST_EDITED",
  LOAD_LAST_COMMENTED: "LOAD_LAST_COMMENTED",
  LOAD_LAST_COMMENTED_IN_REACTION_TO_MINE:
    "LOAD_LAST_COMMENTED_IN_REACTION_TO_MINE",
  LOAD_LAST_COMMENTED_BY_ME: "LOAD_LAST_COMMENTED_BY_ME",
  LOAD_MY_LAST_COMMENTED: "LOAD_MY_LAST_COMMENTED",

  LOAD_USERS: "LOAD_USERS",
  DISABLE_USER: "DISABLE_USER",
  ENABLE_USER: "ENABLE_USER",
  UNLOCK_USER: "UNLOCK_USER",
  CHANGE_ROLE: "CHANGE_ROLE",

  LOAD_USER_GROUPS: "LOAD_USER_GROUPS",
  LOAD_USER_GROUP: "LOAD_USER_GROUP",
  CREATE_USER_GROUP: "CREATE_USER_GROUP",
  REMOVE_USER_GROUP: "REMOVE_USER_GROUP",
  UPDATE_USER_GROUP_LABEL: "UPDATE_USER_GROUP_LABEL",
  ADD_USER_GROUP_MEMBERS: "ADD_USER_GROUP_MEMBERS",
  REMOVE_USER_GROUP_MEMBERS: "REMOVE_USER_GROUP_MEMBERS",

  TOGGLE_SIDEBAR: "TOGGLE_SIDEBAR",
  DESKTOP_VIEW: "DESKTOP_VIEW",

  ANNOTATOR_LOAD_TERMS: "ANNOTATOR_LOAD_TERMS",
  ANNOTATOR_LOAD_TERM: "ANNOTATOR_LOAD_TERM",

  INVALIDATE_CACHES: "INVALIDATE_CACHES",
  LOAD_CONFIGURATION: "LOAD_CONFIGURATION",
  LOAD_NEWS: "LOAD_NEWS",

  LOAD_COMMENTS: "LOAD_COMMENTS",
  CREATE_COMMENT: "CREATE_COMMENT",
  UPDATE_COMMENT: "UPDATE_COMMENT",
  REMOVE_COMMENT: "REMOVE_COMMENT",
  REACT_TO_COMMENT: "REACT_TO_COMMENT",
  REMOVE_COMMENT_REACTION: "REMOVE_COMMENT_REACTION",

  IMPORT_SKOS: "IMPORT_SKOS",

  OPEN_CONTEXTS_FOR_EDITING: "OPEN_CONTEXTS_FOR_EDITING",

  ADD_CRUMB: "ADD_CRUMB",
  REMOVE_CRUMB: "REMOVE_CRUMB",
};

export default ActionType;
