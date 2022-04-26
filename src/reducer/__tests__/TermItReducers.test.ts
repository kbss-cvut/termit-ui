import reducers from "../TermItReducers";
import ActionType, {
  AsyncActionSuccess,
  FailureAction,
} from "../../action/ActionType";
import TermItState from "../../model/TermItState";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
  changeView,
  clearErrors,
  clearFileContent,
  clearProperties,
  consumeNotification,
  dismissMessage,
  popRoutingPayload,
  publishMessage,
  publishNotification,
  pushRoutingPayload,
  selectVocabularyTerm,
  switchLanguage,
  toggleSidebar,
  updateLastModified,
  userLogout,
} from "../../action/SyncActions";
import ErrorInfo, { ErrorData } from "../../model/ErrorInfo";
import User, { EMPTY_USER } from "../../model/User";
import Message from "../../model/Message";
import Constants from "../../util/Constants";
import Vocabulary, {
  EMPTY_VOCABULARY,
  VocabularyData,
} from "../../model/Vocabulary";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import Term, { TermData } from "../../model/Term";
import RdfsResource from "../../model/RdfsResource";
import AppNotification from "../../model/AppNotification";
import Generator from "../../__tests__/environment/Generator";
import SearchQuery from "../../model/SearchQuery";
import QueryResult from "../../model/QueryResult";
import VocabularyUtils from "../../util/VocabularyUtils";
import Routes from "../../util/Routes";
import { langString } from "../../model/MultilingualString";
import { Configuration } from "../../model/Configuration";
import { removeSearchListener } from "../../action/SearchActions";
import TermStatus from "../../model/TermStatus";

function stateToPlainObject(state: TermItState): TermItState {
  return {
    loading: state.loading,
    user: state.user,
    vocabulary: state.vocabulary,
    vocabularies: state.vocabularies,
    queryResults: state.queryResults,
    messages: state.messages,
    intl: state.intl,
    selectedTerm: state.selectedTerm,
    createdTermsCounter: state.createdTermsCounter,
    fileContent: state.fileContent,
    facetedSearchResult: state.facetedSearchResult,
    searchListenerCount: state.searchListenerCount,
    searchInProgress: state.searchInProgress,
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    selectedFile: state.selectedFile,
    types: state.types,
    properties: state.properties,
    notifications: state.notifications,
    pendingActions: state.pendingActions,
    errors: state.errors,
    lastModified: state.lastModified,
    routeTransitionPayload: state.routeTransitionPayload,
    labelCache: state.labelCache,
    sidebarExpanded: state.sidebarExpanded,
    desktopView: state.desktopView,
    annotatorTerms: state.annotatorTerms,
    configuration: state.configuration,
    validationResults: state.validationResults,
    definitionallyRelatedTerms: state.definitionallyRelatedTerms,
  };
}

describe("Reducers", () => {
  let initialState = new TermItState();

  beforeEach(() => {
    initialState = new TermItState();
  });

  describe("loading user", () => {
    const action = { type: ActionType.FETCH_USER };
    it("sets user in state on user load success", () => {
      const user = new User({
        iri: "http://test",
        firstName: "test",
        lastName: "test",
        username: "test@kbss.felk.cvut.cz",
      });
      const a: AsyncActionSuccess<User> = asyncActionSuccessWithPayload(
        action,
        user
      );
      expect(reducers(undefined, a)).toEqual(
        Object.assign({}, initialState, { user })
      );
    });

    it("sets loading status when user fetch is initiated", () => {
      const a = asyncActionRequest(action);
      expect(reducers(undefined, a).loading).toBeTruthy();
    });

    it("sets loading status to false on user load success", () => {
      const user = new User({
        iri: "http://test",
        firstName: "test",
        lastName: "test",
        username: "test@kbss.felk.cvut.cz",
      });
      const a: AsyncActionSuccess<User> = asyncActionSuccessWithPayload(
        action,
        user
      );
      initialState.loading = true;
      expect(reducers(stateToPlainObject(initialState), a)).toEqual(
        Object.assign({}, initialState, {
          user,
          loading: false,
        })
      );
    });

    it("sets loading status to false on user load failure", () => {
      const error = new ErrorInfo(ActionType.FETCH_USER, {
        message: "Failed to connect to server",
        requestUrl: "/users/current",
      });
      const a: FailureAction = asyncActionFailure(action, error);
      initialState.loading = true;
      expect(reducers(stateToPlainObject(initialState), a).loading).toBeFalsy();
    });
  });

  describe("login", () => {
    const action = { type: ActionType.LOGIN };
    it("sets loading status on login request", () => {
      const a = asyncActionRequest(action);
      expect(
        reducers(stateToPlainObject(initialState), a).loading
      ).toBeTruthy();
    });

    it("sets loading status to false on login success", () => {
      const a = asyncActionSuccess(action);
      initialState.loading = true;
      expect(reducers(stateToPlainObject(initialState), a).loading).toBeFalsy();
    });

    it("sets loading status to false on login failure", () => {
      const error = new ErrorInfo(ActionType.LOGIN, {
        message: "Incorrect password",
        requestUrl: "/j_spring_security_check",
      });
      const a = asyncActionFailure(action, error);
      initialState.loading = true;
      expect(reducers(stateToPlainObject(initialState), a).loading).toBeFalsy();
    });
  });

  describe("messages", () => {
    it("adds message into message array on publish message action", () => {
      const mOne = new Message({
        message: "test",
      });
      const action = publishMessage(mOne);
      expect(reducers(stateToPlainObject(initialState), action)).toEqual(
        Object.assign({}, initialState, { messages: [mOne] })
      );
      const mTwo = new Message({
        messageId: "connection.error",
      });
      const actionTwo = publishMessage(mTwo);
      initialState.messages = [mOne];
      expect(reducers(stateToPlainObject(initialState), actionTwo)).toEqual(
        Object.assign({}, initialState, { messages: [mOne, mTwo] })
      );
    });

    it("removes message from array on dismiss message action", () => {
      const mOne = new Message({
        message: "test",
      });
      const mTwo = new Message({
        messageId: "connection.error",
      });
      initialState.messages = [mOne, mTwo];
      const action = dismissMessage(mOne);
      expect(reducers(stateToPlainObject(initialState), action)).toEqual(
        Object.assign({}, initialState, { messages: [mTwo] })
      );
    });

    it("clears messages on logout", () => {
      const mOne = new Message({
        message: "test",
      });
      const mTwo = new Message({
        messageId: "connection.error",
      });
      initialState.messages = [mOne, mTwo];
      const action = userLogout();
      expect(reducers(stateToPlainObject(initialState), action)).toEqual(
        Object.assign({}, initialState, { messages: [] })
      );
    });

    it("clears messages on login", () => {
      const mOne = new Message({
        message: "test",
      });
      const mTwo = new Message({
        messageId: "connection.error",
      });
      initialState.messages = [mOne, mTwo];
      const action = { type: ActionType.LOGIN };
      expect(reducers(stateToPlainObject(initialState), action)).toEqual(
        Object.assign({}, initialState, { messages: [] })
      );
    });
  });

  describe("intl", () => {
    it("loads localization data on action", () => {
      const action = switchLanguage(Constants.LANG.CS.locale);
      expect(reducers(stateToPlainObject(initialState), action)).toEqual(
        Object.assign({}, initialState, {
          intl: require("../../i18n/cs").default,
        })
      );
    });
  });

  describe("logout", () => {
    it("resets current user to empty user", () => {
      initialState.user = new User({
        iri: "http://test",
        firstName: "test",
        lastName: "test",
        username: "test@kbss.felk.cvut.cz",
      });
      expect(reducers(stateToPlainObject(initialState), userLogout())).toEqual(
        Object.assign({}, initialState, { user: EMPTY_USER })
      );
    });

    it("resets vocabularies and current vocabulary", () => {
      initialState.vocabularies = require("../../rest-mock/vocabularies.json");
      initialState.vocabulary = initialState.vocabularies[0];
      expect(reducers(stateToPlainObject(initialState), userLogout())).toEqual(
        Object.assign({}, initialState, {
          vocabulary: EMPTY_VOCABULARY,
          vocabularies: {},
        })
      );
    });

    it("resets file content", () => {
      initialState.fileContent = "test";
      expect(reducers(stateToPlainObject(initialState), userLogout())).toEqual(
        Object.assign({}, initialState, {
          fileContent: null,
        })
      );
    });

    it("resets selected term and terms counter", () => {
      initialState.selectedTerm = Generator.generateTerm();
      initialState.createdTermsCounter = 2;
      expect(reducers(stateToPlainObject(initialState), userLogout())).toEqual(
        Object.assign({}, initialState, {
          selectedTerm: null,
          createdTermsCounter: 0,
        })
      );
    });

    it("resets search-related state", () => {
      initialState.searchResults = require("../../rest-mock/searchResults.json");
      initialState.searchQuery = new SearchQuery();
      initialState.searchQuery.searchQuery = "hello";
      initialState.searchInProgress = true;
      initialState.facetedSearchResult = {
        search: "test",
        anotherAtt: "yas",
      };
      initialState.queryResults = { test: new QueryResult("test", {}) };
      initialState.searchListenerCount = 2;
      expect(reducers(stateToPlainObject(initialState), userLogout())).toEqual(
        Object.assign({}, initialState, {
          searchResults: null,
          searchQuery: new SearchQuery(),
          searchInProgress: false,
          facetedSearchResult: {},
          searchListenerCount: 0,
          queryResults: {},
        })
      );
    });
  });

  describe("vocabulary", () => {
    it("sets vocabulary when it was successfully loaded", () => {
      const action = { type: ActionType.LOAD_VOCABULARY };
      const vocabularyData: VocabularyData = {
        label: "Test vocabulary",
        iri: Generator.generateUri(),
      };
      expect(
        reducers(
          stateToPlainObject(initialState),
          asyncActionSuccessWithPayload(action, new Vocabulary(vocabularyData))
        )
      ).toEqual(
        Object.assign({}, initialState, {
          vocabulary: new Vocabulary(vocabularyData),
        })
      );
    });

    it("sets transitive imports on vocabulary when they are loaded", () => {
      const imports = [Generator.generateUri(), Generator.generateUri()];
      initialState.vocabulary = new Vocabulary({
        label: "Test vocabulary",
        iri: Generator.generateUri(),
      });
      const vocabulary = reducers(
        stateToPlainObject(initialState),
        asyncActionSuccessWithPayload(
          { type: ActionType.LOAD_VOCABULARY_IMPORTS },
          imports
        )
      ).vocabulary;
      expect(vocabulary.allImportedVocabularies).toEqual(imports);
    });

    it("resets vocabulary to empty when resource is removed", () => {
      // The removed resource could have been a file from a document related to that vocabulary, in which case
      // the vocabulary needs to be reloaded
      const action = { type: ActionType.REMOVE_RESOURCE };
      initialState.vocabulary = new Vocabulary({
        label: "Test vocabulary",
        iri: Generator.generateUri(),
        types: [VocabularyUtils.VOCABULARY],
      });
      expect(
        reducers(stateToPlainObject(initialState), asyncActionSuccess(action))
          .vocabulary
      ).toEqual(EMPTY_VOCABULARY);
    });

    it("resets vocabulary to empty when resource is created", () => {
      // The created resource could be a file added to a document related to that vocabulary, in which case
      // the vocabulary needs to be reloaded
      const action = { type: ActionType.CREATE_RESOURCE };
      initialState.vocabulary = new Vocabulary({
        label: "Test vocabulary",
        iri: Generator.generateUri(),
        types: [VocabularyUtils.VOCABULARY],
      });
      expect(
        reducers(stateToPlainObject(initialState), asyncActionSuccess(action))
          .vocabulary
      ).toEqual(EMPTY_VOCABULARY);
    });

    it("sets term count on vocabulary when it is loaded", () => {
      initialState.vocabulary = new Vocabulary({
        label: "Test vocabulary",
        iri: Generator.generateUri(),
        types: [VocabularyUtils.VOCABULARY],
      });
      const action: AsyncActionSuccess<number> = {
        type: ActionType.LOAD_TERM_COUNT,
        status: AsyncActionStatus.SUCCESS,
        payload: 97,
      };
      (action as any).vocabularyIri = VocabularyUtils.create(
        initialState.vocabulary.iri
      );
      expect(
        reducers(stateToPlainObject(initialState), asyncActionSuccess(action))
          .vocabulary.termCount
      ).toEqual(action.payload);
    });

    it("does not set term count on vocabulary when its identifier does not match action", () => {
      initialState.vocabulary = new Vocabulary({
        label: "Test vocabulary",
        iri: Generator.generateUri(),
        types: [VocabularyUtils.VOCABULARY],
      });
      const action: AsyncActionSuccess<number> = {
        type: ActionType.LOAD_TERM_COUNT,
        status: AsyncActionStatus.SUCCESS,
        payload: 97,
      };
      (action as any).vocabularyIri = VocabularyUtils.create(
        Generator.generateUri()
      );
      expect(
        reducers(stateToPlainObject(initialState), asyncActionSuccess(action))
          .vocabulary.termCount
      ).not.toBeDefined();
    });

    it("resets vocabulary to empty when vocabulary loading request is sent", () => {
      const action = { type: ActionType.LOAD_VOCABULARY };
      initialState.vocabulary = new Vocabulary({
        label: "Test vocabulary",
        iri: Generator.generateUri(),
        types: [VocabularyUtils.VOCABULARY],
      });
      expect(
        reducers(stateToPlainObject(initialState), asyncActionRequest(action))
          .vocabulary
      ).toEqual(EMPTY_VOCABULARY);
    });
  });

  describe("select term", () => {
    it("sets selectedTerm when it was successfully selected", () => {
      const term: TermData = {
        label: langString("Test term"),
        iri: Generator.generateUri(),
      };
      expect(
        reducers(stateToPlainObject(initialState), selectVocabularyTerm(term))
      ).toEqual(
        Object.assign({}, initialState, {
          selectedTerm: new Term(term),
        })
      );
    });

    it("sets selectedTerm when it was successfully selected then deselect it", () => {
      const term: TermData = {
        label: langString("Test term"),
        iri: Generator.generateUri(),
      };
      expect(
        reducers(stateToPlainObject(initialState), selectVocabularyTerm(term))
      ).toEqual(
        Object.assign({}, initialState, {
          selectedTerm: new Term(term),
        })
      );
      expect(
        reducers(stateToPlainObject(initialState), selectVocabularyTerm(null))
      ).toEqual(Object.assign({}, initialState, { selectedTerm: null }));
    });

    it("sets term draft status after successful term status update action", () => {
      const term = Generator.generateTerm();
      term.draft = true;
      initialState.selectedTerm = term;

      const resultState = reducers(
        stateToPlainObject(initialState),
        asyncActionSuccessWithPayload(
          {
            type: ActionType.SET_TERM_STATUS,
            status: AsyncActionStatus.SUCCESS,
          } as AsyncActionSuccess<TermStatus>,
          TermStatus.CONFIRMED
        )
      );
      expect(resultState.selectedTerm!.draft).toBeFalsy();
    });
  });

  describe("load types", () => {
    it("sets default terms when it was successfully loaded", () => {
      const terms: TermData[] = [
        {
          label: langString("Test type 1"),
          iri: Generator.generateUri(),
        },
        {
          label: langString("Test type 2"),
          iri: Generator.generateUri(),
        },
      ];

      const map = {};
      terms.forEach((v: TermData) => (map[v.iri || ""] = new Term(v)));

      expect(
        reducers(
          stateToPlainObject(initialState),
          asyncActionSuccessWithPayload(
            { type: ActionType.LOAD_TYPES },
            terms.map((vt) => new Term(vt))
          )
        )
      ).toEqual(Object.assign({}, initialState, { types: map }));
    });
  });

  it("does not change loading status on request action with ignoreLoading specified", () => {
    const action = {
      type: ActionType.SEARCH,
      status: AsyncActionStatus.REQUEST,
      ignoreLoading: true,
    };
    expect(reducers(stateToPlainObject(initialState), action).loading).toEqual(
      initialState.loading
    );
  });

  describe("properties", () => {
    it("sets properties when they were successfully loaded", () => {
      const properties: RdfsResource[] = [
        new RdfsResource({
          iri: "http://www.w3.org/2000/01/rdf-schema#label",
          label: "Label",
          comment: "RDFS label property",
        }),
      ];
      expect(
        reducers(
          stateToPlainObject(initialState),
          asyncActionSuccessWithPayload(
            { type: ActionType.GET_PROPERTIES },
            properties
          )
        )
      ).toEqual(Object.assign({}, initialState, { properties }));
    });

    it("clear properties on clearProperties action", () => {
      initialState.properties = [
        new RdfsResource({
          iri: "http://www.w3.org/2000/01/rdf-schema#label",
          label: "Label",
          comment: "RDFS label property",
        }),
      ];
      expect(
        reducers(stateToPlainObject(initialState), clearProperties())
      ).toEqual(Object.assign({}, initialState, { properties: [] }));
    });
  });

  describe("notifications", () => {
    it("appends notification into queue on publish notification action", () => {
      const notification: AppNotification = {
        source: {
          type: ActionType.CREATE_VOCABULARY_TERM,
          status: AsyncActionStatus.SUCCESS,
        },
      };
      expect(
        reducers(
          stateToPlainObject(initialState),
          publishNotification(notification)
        )
      ).toEqual(
        Object.assign({}, initialState, {
          notifications: [notification],
        })
      );
    });

    it("removes notification from queue on consume notification action", () => {
      const notification: AppNotification = {
        source: {
          type: ActionType.CREATE_VOCABULARY_TERM,
          status: AsyncActionStatus.SUCCESS,
        },
      };
      initialState.notifications = [notification];
      expect(
        reducers(
          stateToPlainObject(initialState),
          consumeNotification(notification)
        )
      ).toEqual(Object.assign({}, initialState, { notifications: [] }));
    });

    it("does nothing when unknown notification is consumed", () => {
      const notification: AppNotification = {
        source: {
          type: ActionType.CREATE_VOCABULARY_TERM,
          status: AsyncActionStatus.SUCCESS,
        },
      };
      initialState.notifications = [notification];
      const another: AppNotification = {
        source: { type: ActionType.SWITCH_LANGUAGE },
      };
      expect(
        reducers(stateToPlainObject(initialState), consumeNotification(another))
      ).toEqual(initialState);
    });
  });

  describe("pendingActions", () => {
    it("adds action to pendingActions when it is async request action", () => {
      const action = asyncActionRequest(
        { type: ActionType.LOAD_RESOURCES },
        true
      );
      const added = {};
      added[ActionType.LOAD_RESOURCES] = AsyncActionStatus.REQUEST;
      expect(reducers(stateToPlainObject(initialState), action)).toEqual(
        Object.assign(initialState, { pendingActions: added })
      );
    });

    it("does nothing when action is not asynchronous", () => {
      expect(
        reducers(stateToPlainObject(initialState), {
          type: ActionType.CLEAR_RESOURCE,
        })
      ).toEqual(initialState);
    });

    it("removes action from pendingActions when it is async success action", () => {
      const added = {};
      added[ActionType.LOAD_RESOURCES] = AsyncActionStatus.REQUEST;
      initialState.pendingActions = added;
      expect(
        reducers(
          stateToPlainObject(initialState),
          asyncActionSuccessWithPayload({ type: ActionType.LOAD_RESOURCES }, [])
        )
      ).toEqual(Object.assign(initialState, { pendingActions: {} }));
    });

    it("removes action from pendingActions when it is async failure action", () => {
      const added = {};
      added[ActionType.LOAD_RESOURCES] = AsyncActionStatus.REQUEST;
      initialState.pendingActions = added;
      expect(
        reducers(
          stateToPlainObject(initialState),
          asyncActionFailure(
            { type: ActionType.LOAD_RESOURCES },
            { status: 404 }
          )
        ).pendingActions
      ).toEqual({});
    });

    it("does nothing when the same async action request is registered multiple times", () => {
      const added = {};
      added[ActionType.LOAD_RESOURCES] = AsyncActionStatus.REQUEST;
      initialState.pendingActions = added;
      const action = asyncActionRequest(
        { type: ActionType.LOAD_RESOURCES },
        true
      );
      expect(
        Object.is(
          reducers(stateToPlainObject(initialState), action).pendingActions,
          initialState.pendingActions
        )
      ).toBeTruthy();
    });
  });

  describe("errors", () => {
    it("records error with timestamp", () => {
      const error: ErrorData = { message: "Login failed", status: 500 };
      const result = reducers(
        stateToPlainObject(initialState),
        asyncActionFailure({ type: ActionType.LOGIN }, error)
      ).errors;
      expect(result.length).toEqual(1);
      expect(result[0].timestamp).toBeDefined();
      expect(result[0].error).toEqual(new ErrorInfo(ActionType.LOGIN, error));
    });

    it("records errors from latest to oldest", () => {
      const errorOne: ErrorData = {
        message: "Fetch user failed",
        status: 500,
      };
      const errorTwo: ErrorData = {
        message: "Login failed",
        status: 400,
      };
      const tempState = reducers(
        stateToPlainObject(initialState),
        asyncActionFailure({ type: ActionType.FETCH_USER }, errorOne)
      );
      const result = reducers(
        stateToPlainObject(tempState),
        asyncActionFailure({ type: ActionType.LOGIN }, errorTwo)
      ).errors;
      expect(result.length).toEqual(2);
      expect(result[0].error.origin).toEqual(ActionType.LOGIN);
      expect(result[1].error.origin).toEqual(ActionType.FETCH_USER);
    });

    it("does nothing when action is no error", () => {
      expect(
        reducers(
          stateToPlainObject(initialState),
          asyncActionSuccess({ type: ActionType.LOGIN })
        ).errors
      ).toEqual([]);
    });

    it("clears errors on clear errors action", () => {
      initialState.errors = [
        {
          timestamp: Date.now(),
          error: new ErrorInfo(ActionType.FETCH_USER, {
            message: "Connection error",
          }),
        },
      ];
      expect(
        reducers(stateToPlainObject(initialState), clearErrors()).errors
      ).toEqual([]);
    });
  });

  describe("lastModified", () => {
    it("sets last modified value on UpdateLastModified action", () => {
      const value = new Date().toISOString();
      const result = reducers(
        stateToPlainObject(initialState),
        updateLastModified(VocabularyUtils.VOCABULARY, value)
      );
      expect(result.lastModified[VocabularyUtils.VOCABULARY]).toEqual(value);
    });
  });

  describe("fileContent", () => {
    it("resets file content on request for new file content", () => {
      initialState.fileContent = "test file content";
      const result = reducers(
        stateToPlainObject(initialState),
        asyncActionRequest({ type: ActionType.LOAD_FILE_CONTENT })
      );
      expect(result.fileContent).toBeNull();
    });

    it("resets file  content on CLEAR_FILE_CONTENT action", () => {
      initialState.fileContent = "test file content";
      const result = reducers(
        stateToPlainObject(initialState),
        clearFileContent()
      );
      expect(result.fileContent).toBeNull();
    });
  });

  describe("routeTransitionPayload", () => {
    it("adds payload to store for specified route name on pushRoutingPayload action", () => {
      const payload = "test";
      const result = reducers(
        stateToPlainObject(initialState),
        pushRoutingPayload(Routes.annotateFile, payload)
      );
      expect(result.routeTransitionPayload[Routes.annotateFile.name]).toEqual(
        payload
      );
    });

    it("removes payload for specified route name from store on popRoutingPayload action", () => {
      initialState.routeTransitionPayload[Routes.annotateFile.name] = "test";
      const result = reducers(
        stateToPlainObject(initialState),
        popRoutingPayload(Routes.annotateFile)
      );
      expect(
        result.routeTransitionPayload[Routes.annotateFile.name]
      ).not.toBeDefined();
    });
  });

  describe("labelCache", () => {
    it("stores loaded label under the identifier for which the label was loaded", () => {
      const iri = Generator.generateUri();
      const label = "Test label";
      const payload = {};
      payload[iri] = label;
      const result = reducers(
        stateToPlainObject(initialState),
        asyncActionSuccessWithPayload({ type: ActionType.GET_LABEL }, payload)
      );
      expect(result.labelCache[iri]).toBeDefined();
      expect(result.labelCache[iri]).toEqual(label);
    });
  });

  describe("sidebarExpanded", () => {
    it("changes sidebarExpanded to !sidebarExpanded on toggleSidebar", () => {
      let result = reducers(stateToPlainObject(initialState), toggleSidebar());
      expect(result.sidebarExpanded).toBeFalsy();
      result = reducers(stateToPlainObject(result), toggleSidebar());
      expect(result.sidebarExpanded).toBeTruthy();
    });
  });

  describe("desktopView", () => {
    it("changes desktopView to !desktopView on isDesktopView", () => {
      let result = reducers(
        stateToPlainObject({ ...initialState, desktopView: true }),
        changeView()
      );
      expect(result.desktopView).toBeFalsy();
      result = reducers(stateToPlainObject(result), changeView());
      expect(result.desktopView).toBeTruthy();
    });
  });

  describe("annotatorTerms", () => {
    let terms: { [key: string]: Term };

    beforeEach(() => {
      terms = {};
      for (let i = 0; i < 5; i++) {
        const t = Generator.generateTerm();
        terms[t.iri] = t;
      }
    });

    it("sets loaded terms to state on request success", () => {
      const result = reducers(
        stateToPlainObject(initialState),
        asyncActionSuccessWithPayload(
          { type: ActionType.ANNOTATOR_LOAD_TERMS },
          terms
        )
      );
      expect(result.annotatorTerms).toEqual(terms);
    });

    it("resets state terms on request", () => {
      initialState.annotatorTerms = terms;
      const result = reducers(
        stateToPlainObject(initialState),
        asyncActionRequest({ type: ActionType.ANNOTATOR_LOAD_TERMS })
      );
      expect(result.annotatorTerms).toEqual({});
    });

    it("adds loaded term to state, replacing any existing one", () => {
      initialState.annotatorTerms = terms;
      const term = Generator.generateTerm();
      const expected = Object.assign({}, terms);
      expected[term.iri] = term;
      const result = reducers(
        stateToPlainObject(initialState),
        asyncActionSuccessWithPayload(
          { type: ActionType.ANNOTATOR_LOAD_TERM },
          term
        )
      );
      expect(result.annotatorTerms).toEqual(expected);
    });
  });

  describe("configuration", () => {
    it("sets loaded configuration to state on request success", () => {
      const config: Configuration = {
        iri: Generator.generateUri(),
        language: "es",
        maxFileUploadSize: "25MB",
        roles: [],
      };
      const result = reducers(
        stateToPlainObject(initialState),
        asyncActionSuccessWithPayload(
          { type: ActionType.LOAD_CONFIGURATION },
          config
        )
      );
      expect(result.configuration).toEqual(config);
    });
  });

  describe("definitionallyRelatedTerms", () => {
    it("sets loaded occurrences targeting term on state", () => {
      const payload = [
        Generator.generateOccurrenceOf(Generator.generateTerm()),
        Generator.generateOccurrenceOf(Generator.generateTerm()),
      ];
      const result = reducers(
        stateToPlainObject(initialState),
        asyncActionSuccessWithPayload(
          { type: ActionType.LOAD_DEFINITION_RELATED_TERMS_TARGETING },
          payload
        )
      );
      expect(result.definitionallyRelatedTerms.targeting).toEqual(payload);
    });

    it("sets loaded occurrences of term on state", () => {
      const t = Generator.generateTerm();
      const payload = [
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
      ];
      const result = reducers(
        stateToPlainObject(initialState),
        asyncActionSuccessWithPayload(
          { type: ActionType.LOAD_DEFINITION_RELATED_TERMS_OF },
          payload
        )
      );
      expect(result.definitionallyRelatedTerms.of).toEqual(payload);
    });

    it("resets definitionally related terms on term loading action", () => {
      initialState.definitionallyRelatedTerms = {
        targeting: [Generator.generateOccurrenceOf(Generator.generateTerm())],
        of: [Generator.generateOccurrenceOf(Generator.generateTerm())],
      };
      const result = reducers(
        stateToPlainObject(initialState),
        asyncActionRequest({ type: ActionType.LOAD_TERM })
      );
      expect(result.definitionallyRelatedTerms).toEqual(
        new TermItState().definitionallyRelatedTerms
      );
    });
  });

  describe("searchListenerCount", () => {
    it("does not allow to go listener count to negative if removeListener is called after logout", () => {
      initialState.searchListenerCount = 0;
      const result = reducers(
        stateToPlainObject(initialState),
        removeSearchListener()
      );
      expect(result.searchListenerCount).toEqual(0);
    });
  });
});
