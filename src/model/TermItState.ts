import User, { EMPTY_USER } from "./User";
import Message from "./Message";
import en from "../i18n/en";
import IntlData from "./IntlData";
import Vocabulary, { EMPTY_VOCABULARY } from "./Vocabulary";
import { QueryResultIF } from "./QueryResult";
import Term from "./Term";
import RdfsResource from "./RdfsResource";
import AppNotification from "./AppNotification";
import SearchResult from "./search/SearchResult";
import SearchQuery from "./search/SearchQuery";
import { ErrorLogItem } from "./ErrorInfo";
import Utils from "../util/Utils";
import { Configuration, DEFAULT_CONFIGURATION } from "./Configuration";
import { ConsolidatedResults } from "./ConsolidatedResults";
import File, { EMPTY_FILE } from "./File";
import TermOccurrence from "./TermOccurrence";
import { Breadcrumb } from "./Breadcrumb";
import AnnotatorLegendFilter from "./AnnotatorLegendFilter";
import ActionType, { PendingAsyncAction } from "../action/ActionType";

/**
 * This is the basic shape of the application"s state managed by Redux.
 */
export default class TermItState {
  public loading: boolean;
  public user: User;
  public vocabulary: Vocabulary;
  public selectedFile: File;
  public vocabularies: { [key: string]: Vocabulary };
  public fileContent: string | null;
  public messages: Message[];
  public intl: IntlData;
  public selectedTerm: Term | null;
  public queryResults: { [key: string]: QueryResultIF };
  public createdTermsCounter: number;
  public searchListenerCount: number;
  public searchInProgress: boolean;
  public searchQuery: SearchQuery;
  public searchResults: SearchResult[] | null;
  public types: { [key: string]: Term };
  public states: { [key: string]: RdfsResource };
  // Identifiers of terminal states (a subset of all states)
  public terminalStates: string[];
  public properties: RdfsResource[];
  // Represents a queue of inter-component notifications
  public notifications: AppNotification[];
  // Pending asynchronous actions. Can be used to prevent repeated requests when some are already pending
  public pendingActions: { [key in ActionType]?: PendingAsyncAction };
  public errors: ErrorLogItem[];
  public lastModified: { [key: string]: string };
  public sidebarExpanded: boolean;
  public desktopView: boolean;
  // This more or less simulates routing location state which is not supported by hashHistory. It allows us to
  // pass data (other than params and query params) between components when routing
  public routeTransitionPayload: { [key: string]: any };
  // Caches labels retrieved from the backend, so that they can be reused and thus server traffic reduced
  public labelCache: { [key: string]: string };
  public annotatorTerms: { [key: string]: Term };
  public configuration: Configuration;
  public validationResults: { [vocabularyIri: string]: ConsolidatedResults };
  public definitionallyRelatedTerms: DefinitionallyRelatedTerms;
  public accessLevels: { [key: string]: RdfsResource };
  public breadcrumbs: Breadcrumb[];

  public annotatorLegendFilter: AnnotatorLegendFilter;

  // Administration
  public users: User[];

  constructor() {
    this.loading = false;
    this.user = EMPTY_USER;
    this.vocabulary = EMPTY_VOCABULARY;
    this.selectedFile = EMPTY_FILE;
    this.vocabularies = {};
    this.fileContent = null;
    this.messages = [];
    this.intl = en;
    this.selectedTerm = null;
    this.queryResults = {};
    this.createdTermsCounter = 0;
    this.searchListenerCount = 0;
    this.searchInProgress = false;
    this.searchQuery = new SearchQuery();
    this.searchResults = null;
    this.types = {};
    this.states = {};
    this.terminalStates = [];
    this.properties = [];
    this.notifications = [];
    this.pendingActions = {};
    this.errors = [];
    this.lastModified = {};
    this.routeTransitionPayload = {};
    this.labelCache = {};
    this.sidebarExpanded = true;
    this.desktopView = Utils.isDesktopView();
    this.annotatorTerms = {};
    this.configuration = DEFAULT_CONFIGURATION;
    this.validationResults = {};
    this.definitionallyRelatedTerms = { targeting: [], of: [] };
    this.breadcrumbs = [];
    this.users = [];
    this.accessLevels = {};
    this.annotatorLegendFilter = new AnnotatorLegendFilter();
  }

  /**
   * Transforms the specified state to a loggable object (mainly breaking possible circular references).
   * @param state State to log
   */
  public static toLoggable(state: TermItState): any {
    const result: any = Object.assign({}, state);
    result.vocabulary = state.vocabulary.toJsonLd();
    result.selectedFile = state.selectedFile.toJsonLd();
    result.selectedTerm = state.selectedTerm?.toJsonLd();
    return result;
  }

  /**
   * Checks if the specified state attribute value is empty.
   * @param arg State attribute value
   */
  public static isEmpty(arg: any[] | { [key: string]: any }) {
    return Array.isArray(arg)
      ? arg.length === 0
      : Object.getOwnPropertyNames(arg).length === 0;
  }
}

export interface DefinitionallyRelatedTerms {
  targeting: TermOccurrence[];
  of: TermOccurrence[];
}
