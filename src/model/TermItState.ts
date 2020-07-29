import User, {EMPTY_USER} from "./User";
import Message from "./Message";
import en from "../i18n/en";
import IntlData from "./IntlData";
import Vocabulary, {EMPTY_VOCABULARY} from "./Vocabulary";
import {QueryResultIF} from "./QueryResult";
import Term from "./Term";
import Resource, {EMPTY_RESOURCE} from "./Resource";
import RdfsResource from "./RdfsResource";
import AppNotification from "./AppNotification";
import SearchResult from "./SearchResult";
import SearchQuery from "./SearchQuery";
import AsyncActionStatus from "../action/AsyncActionStatus";
import {ErrorLogItem} from "./ErrorInfo";
import Utils from "../util/Utils";

/**
 * This is the basic shape of the application"s state managed by Redux.
 */
export default class TermItState {
    public loading: boolean;
    public user: User;
    public vocabulary: Vocabulary;
    public resources: { [key: string]: Resource };
    public resource: Resource;
    public vocabularies: { [key: string]: Vocabulary };
    public fileContent: string | null;
    public messages: Message[];
    public intl: IntlData;
    public selectedTerm: Term | null;
    public queryResults: { [key: string]: QueryResultIF };
    public createdTermsCounter: number;
    public facetedSearchResult: object;
    public searchListenerCount: number;
    public searchInProgress: boolean;
    public searchQuery: SearchQuery;
    public searchResults: SearchResult[] | null;
    public types: { [key: string]: Term };
    public properties: RdfsResource[];
    // Represents a queue of inter-component notifications
    public notifications: AppNotification[];
    // Pending asynchronous actions. Can be used to prevent repeated requests when some are already pending
    public pendingActions: { [key: string]: AsyncActionStatus };
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

    constructor() {
        this.loading = false;
        this.user = EMPTY_USER;
        this.vocabulary = EMPTY_VOCABULARY;
        this.resource = EMPTY_RESOURCE;
        this.resources = {};
        this.vocabularies = {};
        this.fileContent = null;
        this.messages = [];
        this.intl = en;
        this.selectedTerm = null;
        this.queryResults = {};
        this.createdTermsCounter = 0;
        this.facetedSearchResult = {};
        this.searchListenerCount = 0;
        this.searchInProgress = false;
        this.searchQuery = new SearchQuery();
        this.searchResults = null;
        this.types = {};
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
    }
}
