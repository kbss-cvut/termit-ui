import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import {
  createFileInDocument,
  createProperty,
  createVocabulary,
  executeFileTextAnalysis,
  exportFileContent,
  getContentType,
  getLabel,
  getProperties,
  hasFileContent,
  loadAllTerms,
  loadConfiguration,
  loadFileContent,
  loadHistory,
  loadImportedVocabularies,
  loadLastEditedAssets,
  loadLatestTextAnalysisRecord,
  loadMyAssets,
  loadNews,
  loadResource,
  loadTerms,
  loadTypes,
  loadUnusedTermsForVocabulary,
  loadVocabularies,
  loadVocabulary,
  removeTerm,
  removeVocabulary,
  saveFileContent,
  updateResource,
  updateTerm,
  updateVocabulary,
  uploadFileContent,
  validateVocabulary,
} from "../AsyncActions";
import Constants from "../../util/Constants";
import Ajax, { param } from "../../util/Ajax";
import thunk from "redux-thunk";
import { Action } from "redux";
import Routing from "../../util/Routing";
import Vocabulary, {
  CONTEXT as VOCABULARY_CONTEXT,
} from "../../model/Vocabulary";
import Vocabulary2 from "../../util/VocabularyUtils";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
import Routes from "../../util/Routes";
import ActionType, {
  AsyncAction,
  AsyncActionSuccess,
  MessageAction,
} from "../ActionType";
import Term from "../../model/Term";
import Generator from "../../__tests__/environment/Generator";
import { TermFetchParams, ThunkDispatch } from "../../util/Types";
import RdfsResource, {
  CONTEXT as RDFS_RESOURCE_CONTEXT,
} from "../../model/RdfsResource";
import TermItState from "../../model/TermItState";
import Resource from "../../model/Resource";
import Utils from "../../util/Utils";
import AsyncActionStatus from "../AsyncActionStatus";
import fileContent from "../../rest-mock/file";
import TermItFile from "../../model/File";
import MessageType from "../../model/MessageType";
import {
  CONTEXT as TA_RECORD_CONTEXT,
  TextAnalysisRecord,
} from "../../model/TextAnalysisRecord";
import { verifyExpectedAssets } from "../../__tests__/environment/TestUtil";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import RecentlyModifiedAsset from "../../model/RecentlyModifiedAsset";
import NotificationType from "../../model/NotificationType";
import { langString } from "../../model/MultilingualString";
import ValidationResult from "../../model/ValidationResult";
import UserRole from "../../model/UserRole";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => {
  const originalModule = jest.requireActual("../../util/Ajax");
  return {
    ...originalModule,
    default: jest.fn(),
  };
});

const mockStore = configureMockStore<TermItState>([thunk]);

const compareTerms = (list1: Term[], list2: Term[]) => {
  expect(list1.length).toEqual(list2.length);
  list1.sort((a, b) => a.iri.localeCompare(b.iri));
  list2.sort((a: object, b: object) => a["@id"].localeCompare(b["@id"]));
  for (let i = 0; i < list2.length; i++) {
    expect(list1[i].iri).toEqual(list2[i]["@id"]);
  }
};

describe("Async actions", () => {
  let store: MockStoreEnhanced<TermItState>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore(new TermItState());
  });

  describe("create vocabulary", () => {
    it("adds context definition to vocabulary data and sends it over network", () => {
      const vocabulary = new Vocabulary({
        label: "Test",
        iri: "http://test",
      });
      const mock = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.post = mock;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(createVocabulary(vocabulary))
      ).then(() => {
        expect(Ajax.post).toHaveBeenCalled();
        const config = mock.mock.calls[0][1];
        expect(config.getContentType()).toEqual(Constants.JSON_LD_MIME_TYPE);
        const data = config.getContent();
        expect(data["@context"]).toBeDefined();
        expect(data["@context"]).toEqual(VOCABULARY_CONTEXT);
      });
    });

    it("reloads vocabularies on success", () => {
      const vocabulary = new Vocabulary({
        label: "Test",
        iri: "http://kbss.felk.cvut.cz/termit/rest/vocabularies/test",
      });
      Ajax.post = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ headers: { location: vocabulary.iri } })
        );
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(createVocabulary(vocabulary))
      ).then(() => {
        const actions = store.getActions();
        expect(
          actions.find((a) => a.type === ActionType.LOAD_VOCABULARIES)
        ).toBeDefined();
      });
    });
  });

  describe("load vocabulary", () => {
    it("extracts vocabulary data from incoming JSON-LD", () => {
      Ajax.get = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve(require("../../rest-mock/vocabulary"))
        );
      Ajax.head = jest.fn().mockResolvedValue({ headers: {} });
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadVocabulary({ fragment: "metropolitan-plan" })
        )
      ).then(() => {
        const loadSuccessAction: AsyncActionSuccess<Vocabulary> = store
          .getActions()
          .find(
            (a) =>
              a.type === ActionType.LOAD_VOCABULARY &&
              a.status === AsyncActionStatus.SUCCESS
          );
        expect(loadSuccessAction).toBeDefined();
        expect(
          Vocabulary2.create(loadSuccessAction.payload.iri).fragment ===
            "metropolitan-plan"
        ).toBeTruthy();
      });
    });

    it("does nothing when vocabulary loading action is already pending", () => {
      Ajax.get = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve(require("../../rest-mock/vocabulary"))
        );

      store.getState().pendingActions[ActionType.LOAD_VOCABULARY] =
        AsyncActionStatus.REQUEST;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadVocabulary({ fragment: "metropolitan-plan" })
        )
      ).then(() => {
        expect(Ajax.get).not.toHaveBeenCalled();
      });
    });

    it("dispatches vocabulary imports loading on success", () => {
      Ajax.get = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve(require("../../rest-mock/vocabulary"))
        );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadVocabulary({ fragment: "metropolitan-plan" })
        )
      ).then(() => {
        const loadImportsAction = store
          .getActions()
          .find((a) => a.type === ActionType.LOAD_VOCABULARY_IMPORTS);
        expect(loadImportsAction).toBeDefined();
      });
    });

    it("dispatches vocabulary validation action on success", () => {
      Ajax.get = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve(require("../../rest-mock/vocabulary"))
        );
      const vocabularyIri: IRI = { fragment: "metropolitan-plan" };
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadVocabulary(vocabularyIri))
      ).then(() => {
        const validationAction = store
          .getActions()
          .find((a) => a.type === ActionType.LOAD_TERM_COUNT);
        expect(validationAction).toBeDefined();
        expect(validationAction.vocabularyIri).toEqual(vocabularyIri);
      });
    });

    it("dispatches vocabulary term count loading action on success", () => {
      Ajax.get = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve(require("../../rest-mock/vocabulary"))
        );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadVocabulary({ fragment: "metropolitan-plan" })
        )
      ).then(() => {
        const validationAction = store
          .getActions()
          .find((a) => a.type === ActionType.FETCH_VALIDATION_RESULTS);
        expect(validationAction).toBeDefined();
      });
    });

    it("passes loaded vocabulary imports to store", () => {
      const imports = [Generator.generateUri(), Generator.generateUri()];
      Ajax.get = jest.fn().mockImplementation((url) => {
        if (url.endsWith("/imports")) {
          return Promise.resolve(imports);
        } else {
          return Promise.resolve(require("../../rest-mock/vocabulary"));
        }
      });
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadVocabulary({ fragment: "metropolitan-plan" })
        )
      ).then(() => {
        const loadImportsSuccessAction = store
          .getActions()
          .find(
            (a) =>
              a.type === ActionType.LOAD_VOCABULARY_IMPORTS &&
              a.status === AsyncActionStatus.SUCCESS
          );
        expect(loadImportsSuccessAction).toBeDefined();
        expect(loadImportsSuccessAction.payload).toEqual(imports);
      });
    });

    it("uses public API endpoint to load a single vocabulary when user is not logged in", () => {
      Ajax.get = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve(require("../../rest-mock/vocabulary"))
        );
      Ajax.head = jest.fn().mockResolvedValue({ headers: {} });
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadVocabulary({ fragment: "metropolitan-plan" })
        )
      ).then(() => {
        const url = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(url).toContain(Constants.PUBLIC_API_PREFIX);
        const loadSuccessAction: AsyncActionSuccess<Vocabulary> = store
          .getActions()
          .find(
            (a) =>
              a.type === ActionType.LOAD_VOCABULARY &&
              a.status === AsyncActionStatus.SUCCESS
          );
        expect(loadSuccessAction).toBeDefined();
        expect(
          VocabularyUtils.create(loadSuccessAction.payload.iri).fragment ===
            "metropolitan-plan"
        ).toBeTruthy();
      });
    });

    it("uses public API endpoint to load vocabulary's imports as well when user is not logged in", () => {
      Ajax.get = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve(require("../../rest-mock/vocabulary"))
        );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadVocabulary({ fragment: "metropolitan-plan" })
        )
      ).then(() => {
        const loadImportsAction = store
          .getActions()
          .find((a) => a.type === ActionType.LOAD_VOCABULARY_IMPORTS);
        expect(loadImportsAction).toBeDefined();
        expect((Ajax.get as jest.Mock).mock.calls.length).toBeGreaterThan(2);
        const url = (Ajax.get as jest.Mock).mock.calls[1][0];
        expect(url).toContain(Constants.PUBLIC_API_PREFIX);
      });
    });
  });

  describe("removeVocabulary", () => {
    const normalizedName = "test-vocabulary";
    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
    it("sends delete vocabulary request to the server", () => {
      const vocabulary = new Vocabulary({
        label: "Test",
        iri: namespace + normalizedName,
      });
      Ajax.delete = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(removeVocabulary(vocabulary))
      ).then(() => {
        expect(Ajax.delete).toHaveBeenCalled();
        const call = (Ajax.delete as jest.Mock).mock.calls[0];
        expect(call[0]).toEqual(
          Constants.API_PREFIX + "/vocabularies/" + normalizedName
        );
        expect(call[1].getParams().namespace).toEqual(namespace);
      });
    });

    it("refreshes vocabulary list on success", () => {
      const vocabulary = new Vocabulary({
        label: "Test",
        iri: namespace + normalizedName,
      });
      Ajax.delete = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(removeVocabulary(vocabulary))
      ).then(() => {
        const actions = store.getActions();
        expect(
          actions.find((a) => a.type === ActionType.LOAD_VOCABULARIES)
        ).toBeDefined();
      });
    });

    it("transitions to vocabulary management on success", () => {
      const vocabulary = new Vocabulary({
        label: "Test",
        iri: namespace + normalizedName,
      });
      Ajax.delete = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(removeVocabulary(vocabulary))
      ).then(() => {
        expect(Routing.transitionTo).toHaveBeenCalledWith(
          Routes.vocabularies,
          undefined
        );
      });
    });
  });

  describe("load vocabularies", () => {
    it("extracts vocabularies from incoming JSON-LD", () => {
      const vocabularies = require("../../rest-mock/vocabularies");
      Ajax.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(vocabularies));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadVocabularies())
      ).then(() => {
        const loadSuccessAction: AsyncActionSuccess<Vocabulary[]> =
          store.getActions()[1];
        const result = loadSuccessAction.payload;
        verifyExpectedAssets(vocabularies, result);
      });
    });

    it("extracts single vocabulary as an array of vocabularies from incoming JSON-LD", () => {
      const vocabularies = require("../../rest-mock/vocabularies");
      Ajax.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve([vocabularies[0]]));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadVocabularies())
      ).then(() => {
        const loadSuccessAction: AsyncActionSuccess<Vocabulary[]> =
          store.getActions()[1];
        const result = loadSuccessAction.payload;
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toEqual(1);
        expect(result[0].iri).toEqual(vocabularies[0]["@id"]);
      });
    });

    it("does nothing when vocabularies loading action is already pending", () => {
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));

      store.getState().pendingActions[ActionType.LOAD_VOCABULARIES] =
        AsyncActionStatus.REQUEST;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadVocabularies())
      ).then(() => {
        expect(Ajax.get).not.toHaveBeenCalled();
      });
    });

    it("uses public API endpoint to load vocabularies into state", () => {
      const vocabularies = require("../../rest-mock/vocabularies");
      Ajax.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(vocabularies));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadVocabularies())
      ).then(() => {
        const url = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(url).toContain(Constants.PUBLIC_API_PREFIX);
        const loadSuccessAction: AsyncActionSuccess<Vocabulary[]> =
          store.getActions()[1];
        const result = loadSuccessAction.payload;
        verifyExpectedAssets(vocabularies, result);
      });
    });
  });

  describe("load file content", () => {
    it("extracts file content from incoming html data", () => {
      Ajax.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(fileContent));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadFileContent({ fragment: "metropolitan-plan" })
        )
      ).then(() => {
        const loadSuccessAction: AsyncActionSuccess<string> =
          store.getActions()[1];
        expect(loadSuccessAction.payload).toContain("html");
      });
    });

    it("does nothing when file content loading action is already pending", () => {
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));

      store.getState().pendingActions[ActionType.LOAD_FILE_CONTENT] =
        AsyncActionStatus.REQUEST;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadFileContent({ fragment: "metropolitan-plan" })
        )
      ).then(() => {
        expect(Ajax.get).not.toHaveBeenCalled();
      });
    });
  });

  describe("execute file text analysis", () => {
    const file = new TermItFile({
      iri: Generator.generateUri(),
      label: "test.html",
    });

    it("publishes message on error", () => {
      Ajax.put = jest.fn().mockImplementation(() => Promise.reject("An error"));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          executeFileTextAnalysis(
            VocabularyUtils.create(file.iri),
            Generator.generateUri()
          )
        )
      ).then(() => {
        const actions: Action[] = store.getActions();
        const found = actions.find(
          (a) => a.type === ActionType.PUBLISH_MESSAGE
        );
        expect(found).toBeDefined();
        expect((found as MessageAction).message.type).toBe(MessageType.ERROR);
      });
    });

    it("publishes message on success", () => {
      Ajax.put = jest.fn().mockImplementation(() => Promise.resolve("Success"));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          executeFileTextAnalysis(
            VocabularyUtils.create(file.iri),
            Generator.generateUri()
          )
        )
      ).then(() => {
        const actions: Action[] = store.getActions();
        const found = actions.find(
          (a) => a.type === ActionType.PUBLISH_MESSAGE
        );
        expect(found).toBeDefined();
        expect((found as MessageAction).message.type).toBe(MessageType.SUCCESS);
      });
    });
  });

  describe("load terms", () => {
    it("extracts terms from incoming JSON-LD", () => {
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadTerms(
            {
              searchString: "",
              limit: 5,
              offset: 0,
              optionID: "",
            },
            { fragment: "test-vocabulary" }
          )
        )
      ).then((data: Term[]) => compareTerms(data, terms));
    });

    it("provides search parameter with request when specified", () => {
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      const params: TermFetchParams<Term> = {
        searchString: "test",
      };
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadTerms(params, { fragment: "test-vocabulary" })
        )
      ).then(() => {
        const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
        expect(callConfig.getParams()).toEqual(params);
      });
    });

    it("gets all root terms when parent option is not specified", () => {
      store.getState().user = Generator.generateUser();
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      const vocabName = "test-vocabulary";
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadTerms({}, { fragment: vocabName })
        )
      ).then(() => {
        const targetUri = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(targetUri).toEqual(
          Constants.API_PREFIX + "/vocabularies/" + vocabName + "/terms/roots"
        );
        const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
        expect(callConfig.getParams()).toEqual({});
      });
    });

    it("gets subterms when parent option is specified", () => {
      store.getState().user = Generator.generateUser();
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      const parentUri = VocabularyUtils.create(
        "http://data.iprpraha.cz/zdroj/slovnik/test-vocabulary/term/pojem-3"
      );
      const params: TermFetchParams<Term> = {
        optionID: parentUri.toString(),
      };
      const vocabName = "test-vocabulary";
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadTerms(params, { fragment: vocabName })
        )
      ).then(() => {
        const targetUri = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(targetUri).toEqual(
          `${Constants.API_PREFIX}/terms/${parentUri.fragment}/subterms`
        );
        const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
        expect(callConfig.getParams()).toEqual({
          namespace: parentUri.namespace,
        });
      });
    });

    it("specifies correct paging params for offset and limit", () => {
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      const params: TermFetchParams<Term> = {
        offset: 88,
        limit: 100,
      };
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadTerms(params, { fragment: "test-vocabulary" })
        )
      ).then(() => {
        const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
        expect(callConfig.getParams()).toEqual({ page: 1, size: 100 });
      });
    });

    it("provides includeImported with request when specified", () => {
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      const params: TermFetchParams<Term> = {
        includeImported: true,
      };
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadTerms(params, { fragment: "test-vocabulary" })
        )
      ).then(() => {
        const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
        expect(callConfig.getParams()).toEqual(params);
      });
    });

    it("uses public API endpoint to fetch vocabulary terms when user is not logged in", () => {
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadTerms(
            {
              searchString: "",
              limit: 5,
              offset: 0,
              optionID: "",
            },
            { fragment: "test-vocabulary" }
          )
        )
      ).then((data: Term[]) => {
        const url = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(url).toContain(Constants.PUBLIC_API_PREFIX);
        verifyExpectedAssets(terms, data);
      });
    });
  });

  describe("load all terms", () => {
    it("extracts terms from incoming JSON-LD", () => {
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadAllTerms(
            {
              searchString: "",
              limit: 5,
              offset: 0,
              optionID: "",
            },
            "http://onto.fel.cvut.cz/ontologies/termit/"
          )
        )
      ).then((data: Term[]) => compareTerms(data, terms));
    });

    it("gets all root terms when parent option is not specified", () => {
      store.getState().user = Generator.generateUser();
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadAllTerms({}, "http://onto.fel.cvut.cz/ontologies/termit/")
        )
      ).then(() => {
        const targetUri = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(targetUri).toEqual(Constants.API_PREFIX + "/terms/roots");
      });
    });

    it("gets subterms when parent option is specified", () => {
      store.getState().user = Generator.generateUser();
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      const parentUri =
        "http://data.iprpraha.cz/zdroj/slovnik/test-vocabulary/term/pojem-3";
      const params: TermFetchParams<Term> = {
        optionID: parentUri,
      };
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadAllTerms(params, "http://onto.fel.cvut.cz/ontologies/termit/")
        )
      ).then(() => {
        const targetUri = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(targetUri).toEqual(
          Constants.API_PREFIX + "/terms/pojem-3/subterms"
        );
      });
    });

    it("specifies correct paging params for offset and limit", () => {
      const terms = require("../../rest-mock/terms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      const params: TermFetchParams<Term> = {
        offset: 88,
        limit: 100,
      };
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadAllTerms(params, "http://onto.fel.cvut.cz/ontologies/termit/")
        )
      ).then(() => {
        const callConfig = (Ajax.get as jest.Mock).mock.calls[0][1];
        expect(callConfig.getParams().page).toEqual(1);
        expect(callConfig.getParams().size).toEqual(100);
      });
    });
  });

  describe("load types", () => {
    it("loads types from the incoming JSON-LD", () => {
      const types = require("../../rest-mock/types");
      Ajax.get = jest.fn().mockResolvedValue(types);
      store.getState().types = {};
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadTypes())
      ).then(() => {
        const loadSuccessAction: AsyncActionSuccess<Vocabulary[]> = store
          .getActions()
          .find(
            (a) =>
              a.type === ActionType.LOAD_TYPES &&
              a.status === AsyncActionStatus.SUCCESS
          );
        expect(loadSuccessAction).toBeDefined();
        const data = loadSuccessAction.payload;
        verifyExpectedAssets(types, data);
      });
    });

    it("does not send request if data with correct language are already loaded", () => {
      const state = {};
      const types = [Generator.generateTerm()];
      state[types[0].iri] = types[0];
      store.getState().types = state;
      Ajax.get = jest.fn().mockResolvedValue([]);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadTypes())
      ).then(() => {
        expect(Ajax.get).not.toHaveBeenCalled();
      });
    });
  });

  describe("update term", () => {
    it("sends put request to correct endpoint using vocabulary and term IRI", () => {
      const namespace =
        "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
      const normalizedVocabularyName = "test-vocabulary";
      const normalizedTermName = "test-term";
      const term: Term = new Term({
        iri: namespace + "pojem/" + normalizedTermName,
        label: langString("Test"),
        scopeNote: langString("Test term"),
        vocabulary: { iri: namespace + normalizedVocabularyName },
      });
      const mock = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.put = mock;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(updateTerm(term))
      ).then(() => {
        expect(Ajax.put).toHaveBeenCalled();
        const requestUri = mock.mock.calls[0][0];
        expect(requestUri).toEqual(
          Constants.API_PREFIX +
            "/vocabularies/" +
            normalizedVocabularyName +
            "/terms/" +
            normalizedTermName
        );
        const params = mock.mock.calls[0][1].getParams();
        expect(params.namespace).toBeDefined();
        expect(params.namespace).toEqual(namespace);
      });
    });

    it("sends JSON-LD of term argument to REST endpoint", () => {
      const term: Term = new Term({
        iri: Generator.generateUri(),
        label: langString("Test"),
        scopeNote: langString("Test term"),
        vocabulary: {
          iri: "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/test-vocabulary",
        },
      });
      const mock = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.put = mock;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(updateTerm(term))
      ).then(() => {
        expect(Ajax.put).toHaveBeenCalled();
        const data = mock.mock.calls[0][1].getContent();
        expect(data).toEqual(term.toJsonLd());
      });
    });

    it("publishes notification with original value from store", () => {
      const original = Generator.generateTerm(
        "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/test-vocabulary"
      );
      const updated = new Term(
        Object.assign({}, original, { label: "Updated label" })
      );
      store.getState().selectedTerm = original;
      Ajax.put = jest.fn().mockResolvedValue(undefined);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(updateTerm(updated))
      ).then(() => {
        const notifyAction = store
          .getActions()
          .find((a) => a.type === ActionType.PUBLISH_NOTIFICATION);
        expect(notifyAction).toBeDefined();
        expect(notifyAction.notification.source.type).toEqual(
          NotificationType.ASSET_UPDATED
        );
        expect(notifyAction.notification.original).toEqual(original);
        expect(notifyAction.notification.updated).toEqual(updated);
      });
    });

    it("dispatches vocabulary validation action after save", () => {
      const original = Generator.generateTerm(
        "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/test-vocabulary"
      );
      const updated = new Term(
        Object.assign({}, original, { label: "Updated label" })
      );
      Ajax.put = jest.fn().mockResolvedValue(undefined);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(updateTerm(updated))
      ).then(() => {
        const validationAction = store
          .getActions()
          .find((a) => a.type === ActionType.FETCH_VALIDATION_RESULTS);
        expect(validationAction).toBeDefined();
      });
    });
  });

  describe("remove term", () => {
    const normalizedName = "test-vocabulary";
    const namespace = "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
    const termName = "test-term";
    const vocabulary = new Vocabulary({
      label: "Test Vocabulary",
      iri: namespace + normalizedName,
    });
    const term = new Term({
      label: langString("Test Term"),
      iri: vocabulary.iri + "/pojem/" + termName,
      vocabulary,
    });
    it("sends delete term request to the server", () => {
      Ajax.delete = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(removeTerm(term))
      ).then(() => {
        expect(Ajax.delete).toHaveBeenCalled();
        const call = (Ajax.delete as jest.Mock).mock.calls[0];
        expect(call[0]).toEqual(
          Constants.API_PREFIX +
            "/vocabularies/" +
            normalizedName +
            "/terms/" +
            termName
        );
        expect(call[1].getParams().namespace).toEqual(namespace);
      });
    });

    it("refreshes vocabulary list on success", () => {
      Ajax.delete = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(removeTerm(term))
      ).then(() => {
        const actions = store.getActions();
        expect(
          actions.find((a) => a.type === ActionType.LOAD_VOCABULARY)
        ).toBeDefined();
      });
    });

    it("transitions to vocabulary management on success", () => {
      Ajax.delete = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(removeTerm(term))
      ).then(() => {
        const vocabularyIri = VocabularyUtils.create(vocabulary.iri);
        expect(Routing.transitionTo).toHaveBeenCalledWith(
          Routes.vocabularySummary,
          {
            params: new Map([["name", vocabularyIri.fragment]]),
            query: vocabularyIri.namespace
              ? new Map([["namespace", vocabularyIri.namespace]])
              : undefined,
          }
        );
      });
    });
  });

  describe("update vocabulary", () => {
    it("sends put request to correct endpoint using vocabulary IRI", () => {
      const namespace =
        "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/";
      const normalizedVocabularyName = "test-vocabulary";
      const vocabulary = new Vocabulary({
        iri: namespace + normalizedVocabularyName,
        label: "Test vocabulary",
      });
      const mock = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.put = mock;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(updateVocabulary(vocabulary))
      ).then(() => {
        expect(Ajax.put).toHaveBeenCalled();
        const requestUri = mock.mock.calls[0][0];
        expect(requestUri).toEqual(
          Constants.API_PREFIX + "/vocabularies/" + normalizedVocabularyName
        );
        const params = mock.mock.calls[0][1].getParams();
        expect(params.namespace).toBeDefined();
        expect(params.namespace).toEqual(namespace);
      });
    });

    it("sends JSON-LD of vocabulary argument to REST endpoint", () => {
      const vocabulary = new Vocabulary({
        iri: Generator.generateUri(),
        label: "Test vocabulary",
      });
      const mock = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.put = mock;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(updateVocabulary(vocabulary))
      ).then(() => {
        expect(Ajax.put).toHaveBeenCalled();
        const data = mock.mock.calls[0][1].getContent();
        expect(data).toEqual(vocabulary.toJsonLd());
      });
    });

    it("reloads vocabulary on successful update", () => {
      const vocabulary = new Vocabulary({
        iri: Generator.generateUri(),
        label: "Test vocabulary",
      });
      Ajax.put = jest.fn().mockImplementation(() => Promise.resolve());
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(updateVocabulary(vocabulary))
      ).then(() => {
        const action: AsyncAction = store
          .getActions()
          .find((a) => a.type === ActionType.LOAD_VOCABULARY);
        expect(action).toBeDefined();
      });
    });

    it("dispatches success message on successful update", () => {
      const vocabulary = new Vocabulary({
        iri: Generator.generateUri(),
        label: "Test vocabulary",
      });
      Ajax.put = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve());
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(updateVocabulary(vocabulary))
      ).then(() => {
        const action: MessageAction = store
          .getActions()
          .find((a) => a.type === ActionType.PUBLISH_MESSAGE);
        expect(action).toBeDefined();
        expect(action.message.messageId).toEqual("vocabulary.updated.message");
      });
    });

    it("publishes notification with original value from store", () => {
      const original = Generator.generateVocabulary();
      const updated = new Vocabulary(
        Object.assign({}, original, { label: "Updated label" })
      );
      store.getState().vocabulary = original;
      Ajax.put = jest.fn().mockResolvedValue(undefined);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(updateVocabulary(updated))
      ).then(() => {
        const notifyAction = store
          .getActions()
          .find((a) => a.type === ActionType.PUBLISH_NOTIFICATION);
        expect(notifyAction).toBeDefined();
        expect(notifyAction.notification.source.type).toEqual(
          NotificationType.ASSET_UPDATED
        );
        expect(notifyAction.notification.original).toEqual(original);
        expect(notifyAction.notification.updated).toEqual(updated);
      });
    });
  });

  describe("get label", () => {
    it("sends request with identifier as query param", () => {
      const iri = Generator.generateUri();
      const label = "test";
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(label));
      // const store = mockStore({});
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(getLabel(iri))
      ).then(() => {
        const url = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(url).toEqual(Constants.API_PREFIX + "/data/label");
        const config = (Ajax.get as jest.Mock).mock.calls[0][1];
        expect(config).toBeDefined();
        expect(config.getParams().iri).toEqual(iri);
      });
    });

    it("returns retrieved label on success", () => {
      const iri = Generator.generateUri();
      const label = "test";
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(label));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(getLabel(iri))
      ).then((result) => {
        expect(result).toEqual(label);
      });
    });

    it("returns undefined if label is not found", () => {
      const iri = Generator.generateUri();
      Ajax.get = jest
        .fn()
        .mockImplementation(() => Promise.reject({ status: 404 }));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(getLabel(iri))
      ).then((result) => {
        expect(result).not.toBeDefined();
      });
    });

    it("disables loading when sending label request", () => {
      const iri = Generator.generateUri();
      const label = "test";
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(label));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(getLabel(iri))
      ).then(() => {
        const action: AsyncAction = store.getActions()[0];
        expect(action.ignoreLoading).toBeTruthy();
      });
    });

    it("passes loaded label as payload to store for saving", () => {
      const iri = Generator.generateUri();
      const label = "test";
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(label));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(getLabel(iri))
      ).then(() => {
        const resultAction: AsyncActionSuccess<{}> = store
          .getActions()
          .find(
            (a) =>
              a.type === ActionType.GET_LABEL &&
              a.status === AsyncActionStatus.SUCCESS
          );
        expect(resultAction).toBeDefined();
        expect(resultAction.payload).toBeDefined();
        expect(resultAction.payload[iri]).toEqual(label);
      });
    });

    it("returns label immediately if it is stored in label cache", () => {
      const iri = Generator.generateUri();
      const label = "test";
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(label));
      store.getState().labelCache[iri] = label;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(getLabel(iri))
      ).then(() => {
        expect(
          store.getActions().find((a) => a.type === ActionType.GET_LABEL)
        ).not.toBeDefined();
        expect(Ajax.get).not.toHaveBeenCalled();
      });
    });
  });

  describe("getProperties", () => {
    it("sends request to load properties from server", () => {
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(getProperties())!
      ).then(() => {
        const url = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(url).toEqual(Constants.API_PREFIX + "/data/properties");
      });
    });

    it("loads data from response and passes them to store", () => {
      const result = [
        {
          "@id": "http://www.w3.org/2000/01/rdf-schema#label",
          "http://www.w3.org/2000/01/rdf-schema#label": "Label",
          "http://www.w3.org/2000/01/rdf-schema#comment": "Comment",
        },
      ];
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(result));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(getProperties())!
      ).then(() => {
        const action: AsyncActionSuccess<RdfsResource[]> =
          store.getActions()[1];
        expect(action.payload.length).toEqual(1);
        expect(action.payload[0].iri).toEqual(result[0]["@id"]);
        expect(action.payload[0].label).toEqual(
          result[0]["http://www.w3.org/2000/01/rdf-schema#label"]
        );
        expect(action.payload[0].comment).toEqual(
          result[0]["http://www.w3.org/2000/01/rdf-schema#comment"]
        );
      });
    });

    it("does not send request if data are already present in store", () => {
      const data = [
        new RdfsResource({
          iri: "http://www.w3.org/2000/01/rdf-schema#label",
          label: "Label",
          comment: "Comment",
        }),
      ];
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
      store.getState().properties = data;
      (store.dispatch as ThunkDispatch)(getProperties());
      return Promise.resolve().then(() => {
        expect(store.getActions().length).toEqual(0);
      });
    });
  });

  describe("createProperty", () => {
    it("sends property data in JSON-LD to server", () => {
      const data = new RdfsResource({
        iri: "http://www.w3.org/2000/01/rdf-schema#label",
        label: "Label",
        comment: "Comment",
      });
      Ajax.post = jest.fn().mockImplementation(() => Promise.resolve());
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(createProperty(data))
      ).then(() => {
        expect(Ajax.post).toHaveBeenCalled();
        const payload = (Ajax.post as jest.Mock).mock.calls[0][1].getContent();
        expect(payload.iri).toEqual(data.iri);
        expect(payload.label).toEqual(data.label);
        expect(payload.comment).toEqual(data.comment);
        expect(payload["@context"]).toEqual(RDFS_RESOURCE_CONTEXT);
      });
    });
  });

  describe("validate results", () => {
    const v = VocabularyUtils.create("");
    it("extracts validation results from incoming JSON", () => {
      const validationResults = require("../../rest-mock/validation-results.json");
      Ajax.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(validationResults));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(validateVocabulary(v))
      ).then(() => {
        const successAction: AsyncActionSuccess<{
          [vocabularyIri: string]: ValidationResult[];
        }> = store.getActions()[1];
        const result = successAction.payload[v.toString()];
        const array =
          result[
            "http://onto.fel.cvut.cz/ontologies/slovník/datový/psp-2016/pojem/chráněná-část-záplavového-území"
          ];
        expect(array.length).toEqual(validationResults.length);
        // @ts-ignore
        array.sort((a, b) => a.term.iri.localeCompare(b.term.iri));
        validationResults.sort((a: object, b: object) =>
          a.toString().localeCompare(b.toString())
        );
        for (let i = 0; i < validationResults.length; i++) {
          expect(array[i].term.iri).toEqual(
            validationResults[i]["http://www.w3.org/ns/shacl#focusNode"]["@id"]
          );
          expect(array[i].severity.iri).toEqual(
            validationResults[i]["http://www.w3.org/ns/shacl#resultSeverity"][
              "@id"
            ]
          );
          expect(array[i].message.length).toEqual(
            validationResults[i]["http://www.w3.org/ns/shacl#resultMessage"]
              .length
          );
        }
      });
    });

    it("extracts single resource as an array of resources from incoming JSON-LD", () => {
      const validationResults = require("../../rest-mock/validation-results.json");
      Ajax.get = jest
        .fn()
        .mockImplementation(() => Promise.resolve(validationResults));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(validateVocabulary(v))
      ).then(() => {
        const successAction: AsyncActionSuccess<{
          [vocabularyIri: string]: ValidationResult[];
        }> = store.getActions()[1];
        const result = successAction.payload[v.toString()];
        const array =
          result[
            "http://onto.fel.cvut.cz/ontologies/slovník/datový/psp-2016/pojem/chráněná-část-záplavového-území"
          ];
        expect(array).toBeDefined();
        expect(array[0].term.iri).toEqual(
          validationResults[0]["http://www.w3.org/ns/shacl#focusNode"]["@id"]
        );
        expect(array[0].severity.iri).toEqual(
          validationResults[0]["http://www.w3.org/ns/shacl#resultSeverity"][
            "@id"
          ]
        );
        expect(array[0].message.length).toEqual(
          validationResults[0]["http://www.w3.org/ns/shacl#resultMessage"]
            .length
        );
      });
    });

    it("does nothing when loading action is already pending", () => {
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve([]));
      store.getState().pendingActions[ActionType.FETCH_VALIDATION_RESULTS] =
        AsyncActionStatus.REQUEST;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(validateVocabulary(v))
      ).then(() => {
        expect(Ajax.get).not.toHaveBeenCalled();
      });
    });
  });

  describe("loadResource", () => {
    it("returns resource as correct type based on type specified in JSON-LD data", () => {
      const iri = Generator.generateUri();
      const data = {
        "@id": iri,
        "@type": [VocabularyUtils.RESOURCE, VocabularyUtils.FILE],
      };
      data[VocabularyUtils.RDFS_LABEL] = "Test label";
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadResource(VocabularyUtils.create(iri))
        )
      ).then((res: Resource | null) => {
        expect(
          store
            .getActions()
            .find(
              (a) =>
                a.type === ActionType.LOAD_RESOURCE &&
                a.status === AsyncActionStatus.SUCCESS
            )
        ).toBeDefined();
        expect(res).not.toBeNull();
        expect(res).toBeInstanceOf(TermItFile);
      });
    });
  });

  describe("loadLastEditedAssets", () => {
    it("returns correct instances of received asset data", () => {
      const data = [
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": "Test file",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
        },
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": "Test vocabulary",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.VOCABULARY],
        },
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2004/02/skos/core#prefLabel": "Test term",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
            {
              "@id": Generator.generateUri(),
            },
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.TERM],
        },
      ];
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadLastEditedAssets())
      ).then((result: RecentlyModifiedAsset[]) => {
        expect(Ajax.get).toHaveBeenCalledWith(
          Constants.API_PREFIX + "/assets/last-edited",
          param("limit", "5")
        );
        expect(result.length).toEqual(data.length);
        result.forEach((r) => expect(r).toBeInstanceOf(RecentlyModifiedAsset));
      });
    });

    it("handles correctly label of terms being skos:prefLabel instead of rdsf:label", () => {
      const data = [
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2004/02/skos/core#prefLabel": "Test term",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
            {
              "@id": Generator.generateUri(),
            },
          "http://www.w3.org/2004/02/skos/core#broader": [
            {
              "@id": Generator.generateUri(),
              "http://www.w3.org/2004/02/skos/core#prefLabel":
                "Test parent one",
              "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
                {
                  "@id": Generator.generateUri(),
                },
              "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
              "http://purl.org/dc/terms/modified": Date.now(),
              "@type": [VocabularyUtils.TERM],
            },
            {
              "@id": Generator.generateUri(),
              "http://www.w3.org/2004/02/skos/core#prefLabel":
                "Test parent two",
              "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
                {
                  "@id": Generator.generateUri(),
                },
              "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
              "http://purl.org/dc/terms/modified": Date.now(),
              "@type": [VocabularyUtils.TERM],
            },
          ],
          "@type": [VocabularyUtils.TERM],
        },
      ];
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadLastEditedAssets())
      ).then((result: RecentlyModifiedAsset[]) => {
        expect(Ajax.get).toHaveBeenCalledWith(
          Constants.API_PREFIX + "/assets/last-edited",
          param("limit", "5")
        );
        result.forEach((r) => expect(r).toBeInstanceOf(RecentlyModifiedAsset));
      });
    });
  });

  describe("loadMyAssets", () => {
    it("returns correct instances of received asset data", () => {
      const data = [
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": "Test file",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.FILE, VocabularyUtils.RESOURCE],
        },
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": "Test vocabulary",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.VOCABULARY],
        },
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": "Test term",
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
            {
              "@id": Generator.generateUri(),
            },
          "@type": [VocabularyUtils.TERM],
        },
      ];
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadMyAssets())
      ).then((result: RecentlyModifiedAsset[]) => {
        expect(Ajax.get).toHaveBeenCalledWith(
          Constants.API_PREFIX + "/assets/last-edited",
          param("forCurrentUserOnly", "true").param("limit", "5")
        );
        expect(result.length).toEqual(data.length);
        result.forEach((r) => expect(r).toBeInstanceOf(RecentlyModifiedAsset));
      });
    });

    it("correctly handles labels of vocabularies and resources and pref label of terms", () => {
      const vocLabel = "Test vocabulary";
      const termLabel = "Test term";
      const data = [
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": vocLabel,
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "@type": [VocabularyUtils.VOCABULARY],
        },
        {
          "@id": Generator.generateUri(),
          "http://www.w3.org/2000/01/rdf-schema#label": termLabel,
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-editora": require("../../rest-mock/current"),
          "http://purl.org/dc/terms/modified": Date.now(),
          "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovniku":
            {
              "@id": Generator.generateUri(),
            },
          "@type": [VocabularyUtils.TERM],
        },
      ];
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(data));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadMyAssets())
      ).then((result: RecentlyModifiedAsset[]) => {
        expect(Ajax.get).toHaveBeenCalledWith(
          Constants.API_PREFIX + "/assets/last-edited",
          param("forCurrentUserOnly", "true").param("limit", "5")
        );
        expect(result.length).toEqual(data.length);
        expect(result[0].label).toEqual(vocLabel);
        expect(result[1].label).toEqual(termLabel);
      });
    });
  });

  describe("uploadFileContent", () => {
    const fileIri =
      "http://onto.fel.cvut.cz/ontologies/termit/resources/test.html";
    const fileName = "test.html";

    it("attaches file data to server request", () => {
      Ajax.put = jest.fn().mockResolvedValue(undefined);
      const blob = new Blob([""], { type: "text/html" });
      // @ts-ignore
      blob.name = fileName;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          uploadFileContent(VocabularyUtils.create(fileIri), blob as File)
        )
      ).then(() => {
        const actions = store.getActions();
        expect(actions[0].type).toEqual(ActionType.SAVE_FILE_CONTENT);
        const args = (Ajax.put as jest.Mock).mock.calls[0];
        expect(args[1].getFormData().get("file").name).toEqual(fileName);
      });
    });

    it("passes file IRI namespace as parameter", () => {
      const namespace =
        "http://onto.fel.cvut.cz/ontologies/slovník/datový/soubory/";
      const iri = `${namespace}${fileName}`;
      Ajax.put = jest.fn().mockResolvedValue(undefined);
      const blob = new Blob([""], { type: "text/html" });
      // @ts-ignore
      blob.name = fileName;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          uploadFileContent(VocabularyUtils.create(iri), blob as File)
        )
      ).then(() => {
        const args = (Ajax.put as jest.Mock).mock.calls[0];
        expect(args[1].getParams().namespace).toEqual(namespace);
      });
    });
  });

  describe("saveFileContent", () => {
    it("passes file IRI namespace as parameter", () => {
      const namespace =
        "http://onto.fel.cvut.cz/ontologies/slovník/datový/soubory/";
      const fileName = "test.html";
      const iri = `${namespace}${fileName}`;
      Ajax.put = jest.fn().mockResolvedValue(undefined);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          saveFileContent(VocabularyUtils.create(iri), "test")
        )
      ).then(() => {
        const args = (Ajax.put as jest.Mock).mock.calls[0];
        expect(args[1].getParams().namespace).toEqual(namespace);
      });
    });
  });

  describe("createFileInDocument", () => {
    it("POSTs File metadata to server under the specified Document identifier", () => {
      const file = new TermItFile({
        iri: Generator.generateUri(),
        label: "test.html",
      });
      const docName = "test-document";
      const documentIri = VocabularyUtils.create(
        "http://onto.fel.cvut.cz/ontologies/termit/resources/test-document"
      );
      Ajax.post = jest
        .fn()
        .mockImplementation(() =>
          Promise.resolve({ headers: { location: file.iri } })
        );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          createFileInDocument(file, documentIri)
        )
      ).then(() => {
        const actions = store.getActions();
        expect(actions[0].type).toEqual(ActionType.CREATE_RESOURCE);
        expect((Ajax.post as jest.Mock).mock.calls[0][0]).toEqual(
          Constants.API_PREFIX + "/identifiers"
        );
        expect((Ajax.post as jest.Mock).mock.calls[1][0]).toEqual(
          Constants.API_PREFIX + "/resources/" + docName + "/files"
        );
        expect((Ajax.post as jest.Mock).mock.calls[1][1].getContent()).toEqual(
          file.toJsonLd()
        );
      });
    });
  });

  describe("loadLatestTextAnalysisRecord", () => {
    it("loads text analysis record for specified resource", () => {
      const resourceIri = VocabularyUtils.create(
        "http://onto.fel.cvut.cz/ontologies/termit/resources/test-file.html"
      );
      const record = {
        "@context": TA_RECORD_CONTEXT,
        iri: Generator.generateUri(),
        analyzedResource: {
          iri: resourceIri.toString(),
          label: "test-file.html",
        },
        vocabularies: [{ iri: Generator.generateUri() }],
        created: Date.now(),
      };
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(record));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadLatestTextAnalysisRecord(resourceIri)
        )
      ).then((data: TextAnalysisRecord | null) => {
        expect(data).not.toBeNull();
        expect(data!.analyzedResource).toEqual(record.analyzedResource);
        expect(Ajax.get).toHaveBeenCalledWith(
          Constants.API_PREFIX +
            "/resources/" +
            resourceIri.fragment +
            "/text-analysis/records/latest",
          param("namespace", resourceIri.namespace)
        );
      });
    });

    it("returns null when no record exists", () => {
      const resourceIri = VocabularyUtils.create(
        "http://onto.fel.cvut.cz/ontologies/termit/resources/test-file.html"
      );
      Ajax.get = jest
        .fn()
        .mockImplementation(() => Promise.reject({ status: 404 }));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadLatestTextAnalysisRecord(resourceIri)
        )
      ).then((data: TextAnalysisRecord | null) => {
        expect(data).toBeNull();
        expect(Ajax.get).toHaveBeenCalledWith(
          Constants.API_PREFIX +
            "/resources/" +
            resourceIri.fragment +
            "/text-analysis/records/latest",
          param("namespace", resourceIri.namespace)
        );
      });
    });
  });

  describe("hasFileContent", () => {
    it("returns true when response is positive", () => {
      const resourceIri = VocabularyUtils.create(
        "http://onto.fel.cvut.cz/ontologies/termit/resources/test-file.html"
      );
      Ajax.head = jest
        .fn()
        .mockImplementation(() => Promise.resolve({ status: 204 }));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(hasFileContent(resourceIri))
      ).then((result: boolean) => {
        expect(result).toBeTruthy();
        expect(Ajax.head).toHaveBeenCalled();
      });
    });

    it("returns false when response is negative", () => {
      const resourceIri = VocabularyUtils.create(
        "http://onto.fel.cvut.cz/ontologies/termit/resources/test-file.html"
      );
      Ajax.head = jest
        .fn()
        .mockImplementation(() => Promise.reject({ status: 404 }));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(hasFileContent(resourceIri))
      ).then((result: boolean) => {
        expect(result).toBeFalsy();
        expect(Ajax.head).toHaveBeenCalled();
      });
    });
  });

  describe("getContentType", () => {
    it("returns correct content type", () => {
      const resourceIri = VocabularyUtils.create(
        "http://onto.fel.cvut.cz/ontologies/termit/resources/test-file.html"
      );
      Ajax.head = jest.fn().mockImplementation(() =>
        Promise.resolve({
          status: 200,
          headers: { "content-type": "text/csv" },
        })
      );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(getContentType(resourceIri))
      ).then((result: string | null) => {
        expect(result).toEqual("text/csv");
        expect(Ajax.head).toHaveBeenCalled();
      });
    });
    it("returns null if content type is missing", () => {
      const resourceIri = VocabularyUtils.create(
        "http://onto.fel.cvut.cz/ontologies/termit/resources/test-file.html"
      );
      Ajax.head = jest.fn().mockImplementation(() =>
        Promise.resolve({
          status: 200,
          headers: {},
        })
      );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(getContentType(resourceIri))
      ).then((result: string | null) => {
        expect(result).toEqual(null);
        expect(Ajax.head).toHaveBeenCalled();
      });
    });
  });

  describe("exportFileContent", () => {
    const fileName = "test-file.html";
    const fileIri = VocabularyUtils.create(
      "http://onto.fel.cvut.cz/ontologies/termit/resources/" + fileName
    );

    it("sends request asking for content as attachment", () => {
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: "test",
          headers: {
            "content-type": "text/html",
            "content-disposition": 'attachment; filename="' + fileName + '"',
          },
        })
      );
      Utils.fileDownload = jest.fn();
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(exportFileContent(fileIri))
      ).then(() => {
        expect(Ajax.getRaw).toHaveBeenCalled();
        const url = (Ajax.getRaw as jest.Mock).mock.calls[0][0];
        expect(url).toEqual(
          Constants.API_PREFIX + "/resources/" + fileName + "/content"
        );
        const config = (Ajax.getRaw as jest.Mock).mock.calls[0][1];
        expect(config.getParams().attachment).toEqual("true");
        expect(config.getParams().namespace).toEqual(fileIri.namespace);
      });
    });

    it("stores response attachment", () => {
      const data = '<html lang="en">test</html>';
      Ajax.getRaw = jest.fn().mockImplementation(() =>
        Promise.resolve({
          data,
          headers: {
            "content-type": "text/html",
            "content-disposition": 'attachment; filename="' + fileName + '"',
          },
        })
      );
      Utils.fileDownload = jest.fn();
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(exportFileContent(fileIri))
      ).then(() => {
        expect(Utils.fileDownload).toHaveBeenCalled();
        const args = (Utils.fileDownload as jest.Mock).mock.calls[0];
        expect(args[0]).toEqual(data);
        expect(args[1]).toEqual(fileName);
        expect(args[2]).toEqual("text/html");
      });
    });
  });

  describe("loadImportedVocabularies", () => {
    it("loads imported vocabularies for the specified vocabulary IRI", () => {
      const imports = [Generator.generateUri(), Generator.generateUri()];
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(imports));
      const iri = VocabularyUtils.create(Generator.generateUri());
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadImportedVocabularies(iri))
      ).then(() => {
        expect(Ajax.get).toHaveBeenCalled();
        const url = (Ajax.get as jest.Mock).mock.calls[0][0];
        expect(url).toEqual(
          Constants.API_PREFIX + "/vocabularies/" + iri.fragment + "/imports"
        );
      });
    });

    it("returns loaded imports", () => {
      const imports = [Generator.generateUri(), Generator.generateUri()];
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(imports));
      const iri = VocabularyUtils.create(Generator.generateUri());
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadImportedVocabularies(iri))
      ).then((result) => {
        expect(result).toEqual(imports);
      });
    });

    it("returns empty array on error on request error", () => {
      Ajax.get = jest.fn().mockImplementation(() => Promise.reject({}));
      const iri = VocabularyUtils.create(Generator.generateUri());
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadImportedVocabularies(iri))
      ).then((result) => {
        expect(result).toEqual([]);
      });
    });
  });
  describe("load unused terms", () => {
    it("extracts terms from incoming JSON-LD", () => {
      const terms = require("../../rest-mock/unusedTerms");
      Ajax.get = jest.fn().mockImplementation(() => Promise.resolve(terms));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadUnusedTermsForVocabulary({
            fragment: "test-vocabulary",
          })
        ).then((data: string[]) => {
          expect(data.length).toEqual(terms.length);
          data.sort((a, b) => a.localeCompare(b));
          terms.sort((a: string, b: string) => a.localeCompare(b));
          for (let i = 0; i < terms.length; i++) {
            expect(data[i]).toEqual(terms[i]);
          }
        })
      );
    });
    it("returns empty list upon server error", () => {
      Ajax.get = jest
        .fn()
        .mockImplementation(() => Promise.reject(new Error("fail")));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          loadUnusedTermsForVocabulary({
            fragment: "test-vocabulary",
          })
        ).then((data: string[]) => {
          expect(data.length).toEqual(0);
        })
      );
    });
  });

  describe("loadHistory", () => {
    const namespace = VocabularyUtils.NS_TERMIT;
    const assetName = "test-asset";

    it("loads term history when asset is term", () => {
      const asset = Generator.generateTerm();
      Ajax.get = jest.fn().mockResolvedValue([]);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadHistory(asset))
      ).then(() => {
        expect(
          store
            .getActions()
            .find((a) => a.type === ActionType.LOAD_TERM_HISTORY)
        ).toBeDefined();
        expect((Ajax.get as jest.Mock).mock.calls[0][0]).toMatch(
          /\/terms\/.+\/history/
        );
      });
    });

    it("loads vocabulary history when asset is vocabulary", () => {
      const asset = new Vocabulary({
        iri: Generator.generateUri(),
        label: "Test vocabulary",
        types: [VocabularyUtils.VOCABULARY],
      });
      Ajax.get = jest.fn().mockResolvedValue([]);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadHistory(asset))
      ).then(() => {
        expect(
          store
            .getActions()
            .find((a) => a.type === ActionType.LOAD_VOCABULARY_HISTORY)
        ).toBeDefined();
        expect((Ajax.get as jest.Mock).mock.calls[0][0]).toMatch(
          /\/vocabularies\/.+\/history/
        );
      });
    });

    it("requests history from REST endpoint for specified term", () => {
      Ajax.get = jest.fn().mockResolvedValue({});
      const asset = Generator.generateTerm();
      asset.iri = namespace + assetName;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadHistory(asset))
      ).then(() => {
        expect(Ajax.get).toHaveBeenCalled();
        const args = (Ajax.get as jest.Mock).mock.calls[0];
        expect(args[0]).toEqual(
          `${Constants.API_PREFIX}/terms/${assetName}/history`
        );
        expect(args[1].getParams().namespace).toEqual(namespace);
      });
    });

    it("maps returned data to change record instances", () => {
      Ajax.get = jest
        .fn()
        .mockResolvedValue(require("../../rest-mock/termHistory.json"));
      const asset = Generator.generateTerm();
      asset.iri = namespace + assetName;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadHistory(asset))
      ).then((records: ChangeRecord[]) => {
        expect(records.length).toBeGreaterThan(0);
        records.forEach((r) => {
          expect(r).toBeInstanceOf(ChangeRecord);
        });
      });
    });

    it("returns empty array on AJAX error", () => {
      Ajax.get = jest.fn().mockResolvedValue({ status: 500 });
      const asset = Generator.generateTerm();
      asset.iri = namespace + assetName;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadHistory(asset))
      ).then((records: ChangeRecord[]) => {
        expect(records).toBeDefined();
        expect(records.length).toEqual(0);
      });
    });
  });

  describe("updateResource", () => {
    it("loads updated resource", () => {
      const original = Generator.generateResource();
      const updated = new Resource(
        Object.assign({}, original, { label: "Updated label" })
      );
      Ajax.put = jest.fn().mockResolvedValue({});
      Ajax.get = jest
        .fn()
        .mockResolvedValue(require("../../rest-mock/resource.json"));
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(updateResource(updated))
      ).then((res: Resource | null) => {
        expect(res).not.toBeNull();
        expect(Ajax.get).toHaveBeenCalled();
      });
    });
  });

  describe("loadNews", () => {
    it("uses specified language to load news", () => {
      const news = "New version published, yay!";
      const lang = "cs";
      Ajax.get = jest.fn().mockResolvedValue(news);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadNews(lang))
      ).then((result: any) => {
        expect(result).toEqual(news);
        expect((Ajax.get as jest.Mock).mock.calls[0][0]).toEqual(
          Constants.NEWS_MD_URL[lang]
        );
      });
    });
  });

  describe("loadConfiguration", () => {
    it("maps returned role data to UserRole instances", () => {
      const data = {
        "@id":
          "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/konfigurace/default",
        "@type": [
          "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/konfigurace",
        ],
        "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/má-uživatelskou-roli":
          [
            {
              "@id":
                "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/plný-uživatel-termitu",
              "@type": [
                "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/uživatelská-role",
              ],
              "http://www.w3.org/2004/02/skos/core#prefLabel": [
                {
                  "@language": "cs",
                  "@value": "Editor",
                },
                { "@language": "en", "@value": "Editor" },
              ],
            },
          ],
        "http://purl.org/dc/terms/language": "cs",
      };
      Ajax.get = jest.fn().mockResolvedValue(data);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(loadConfiguration())
      ).then(() => {
        const successAction = store
          .getActions()
          .find(
            (a) =>
              a.type === ActionType.LOAD_CONFIGURATION &&
              a.status === AsyncActionStatus.SUCCESS
          );
        expect(successAction).toBeDefined();
        expect(successAction.payload.roles).toBeDefined();
        successAction.payload.roles.forEach((r: any) =>
          expect(r).toBeInstanceOf(UserRole)
        );
      });
    });
  });
});
