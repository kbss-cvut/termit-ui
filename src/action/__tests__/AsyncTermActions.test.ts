import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import VocabularyUtils from "../../util/VocabularyUtils";
import Ajax from "../../util/Ajax";
import { ThunkDispatch } from "../../util/Types";
import { createTerm, setTermDefinitionSource } from "../AsyncTermActions";
import TermOccurrence from "../../model/TermOccurrence";
import Generator from "../../__tests__/environment/Generator";
import Term, { CONTEXT as TERM_CONTEXT } from "../../model/Term";
import ActionType from "../ActionType";
import MessageType from "../../model/MessageType";
import { langString } from "../../model/MultilingualString";
import Constants from "../../util/Constants";
import AsyncActionStatus from "../AsyncActionStatus";

jest.mock("../../util/Routing");
jest.mock("../../util/Ajax", () => {
  const originalModule = jest.requireActual("../../util/Ajax");
  return {
    ...originalModule,
    default: jest.fn(),
  };
});

const mockStore = configureMockStore<TermItState>([thunk]);

describe("AsyncTermActions", () => {
  const namespace = VocabularyUtils.NS_TERMIT + "/vocabularies/";
  const vocabularyName = "test-vocabulary";
  const termName = "test-term";

  let store: MockStoreEnhanced<TermItState>;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore(new TermItState());
  });

  describe("create term", () => {
    const vocabularyIri = VocabularyUtils.create(
      "http://onto.fel.cvut.cz/ontologies/termit/vocabulary/test-vocabulary"
    );

    it("creates top level term in vocabulary context and send it over the network", () => {
      const term = new Term({
        label: langString("Test term 1"),
        iri: vocabularyIri.toString() + "term/test-term-1",
      });
      const mock = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.post = mock;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(createTerm(term, vocabularyIri))
      ).then(() => {
        expect(Ajax.post).toHaveBeenCalled();
        expect(mock.mock.calls[0][0]).toEqual(
          Constants.API_PREFIX +
            "/vocabularies/" +
            vocabularyIri.fragment +
            "/terms"
        );
        const config = mock.mock.calls[0][1];
        expect(config.getContentType()).toEqual(Constants.JSON_LD_MIME_TYPE);
        const data = config.getContent();
        expect(data["@context"]).toBeDefined();
        expect(data["@context"]).toEqual(TERM_CONTEXT);
      });
    });

    it("create child term in vocabulary context and send it over the network", () => {
      const parentFragment = "test-term-1";
      const parentTerm = new Term({
        label: langString("Test term 1"),
        iri: vocabularyIri.toString() + "term/" + parentFragment,
        vocabulary: { iri: vocabularyIri.toString() },
      });
      const childTerm = new Term({
        label: langString("Test term 2"),
        iri: vocabularyIri.toString() + "term/test-term-2",
        parentTerms: [parentTerm],
      });
      const mock = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.post = mock;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(createTerm(childTerm, vocabularyIri))
      ).then(() => {
        expect(Ajax.post).toHaveBeenCalled();
        expect(mock.mock.calls[0][0]).toEqual(
          Constants.API_PREFIX +
            "/vocabularies/" +
            vocabularyIri.fragment +
            "/terms/" +
            parentFragment +
            "/subterms"
        );
        const config = mock.mock.calls[0][1];
        expect(config.getContentType()).toEqual(Constants.JSON_LD_MIME_TYPE);
        const data = config.getContent();
        expect(data["@context"]).toBeDefined();
        expect(data["@context"]).toEqual(TERM_CONTEXT);
      });
    });

    it("publishes notification on successful creation", () => {
      const term = new Term({
        label: langString("Test term 1"),
        iri: vocabularyIri.toString() + "term/test-term-1",
      });
      Ajax.post = jest.fn().mockImplementation(() =>
        Promise.resolve({
          headers: {
            location: "http://test",
          },
        })
      );
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(createTerm(term, vocabularyIri))
      ).then(() => {
        const actions = store.getActions();
        const action = actions[actions.length - 1];
        expect(action.type).toEqual(ActionType.PUBLISH_NOTIFICATION);
        expect(action.notification.source.type).toEqual(
          ActionType.CREATE_VOCABULARY_TERM
        );
        expect(action.notification.source.status).toEqual(
          AsyncActionStatus.SUCCESS
        );
      });
    });

    it("provides vocabulary namespace in a request parameter", () => {
      const term = new Term({
        label: langString("Test term 1"),
        iri: vocabularyIri.toString() + "term/test-term-1",
      });
      const mock = jest.fn().mockImplementation(() => Promise.resolve());
      Ajax.post = mock;
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(createTerm(term, vocabularyIri))
      ).then(() => {
        const config = mock.mock.calls[0][1];
        expect(config.getParams().namespace).toEqual(vocabularyIri.namespace);
      });
    });

    it("sets term vocabulary before sending it to server", () => {
      const term = new Term({
        label: langString("Test term 1"),
        iri: vocabularyIri.toString() + "term/test-term-1",
      });
      Ajax.post = jest.fn().mockImplementation(() => Promise.resolve());
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(createTerm(term, vocabularyIri))
      ).then(() => {
        const config = (Ajax.post as jest.Mock).mock.calls[0][1];
        const data = config.getContent();
        expect(data.vocabulary).toBeDefined();
        expect(data.vocabulary.iri).toEqual(vocabularyIri.toString());
      });
    });
  });

  describe("setTermDefinitionSource", () => {
    const term = new Term({
      iri: `${namespace}${vocabularyName}/terms/${termName}`,
      label: langString(termName),
    });
    const definitionSource = new TermOccurrence({
      term,
      target: {
        source: { iri: Generator.generateUri() },
        selectors: [
          {
            exactMatch: "test",
            types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
          },
        ],
        types: [VocabularyUtils.FILE_OCCURRENCE_TARGET],
      },
      types: [VocabularyUtils.TERM_DEFINITION_SOURCE],
    });

    it("sends PUT request with term definition source data to REST endpoint", () => {
      Ajax.put = jest.fn().mockResolvedValue(null);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          setTermDefinitionSource(definitionSource, term)
        )
      ).then(() => {
        expect(Ajax.put).toHaveBeenCalled();
        const call = (Ajax.put as jest.Mock).mock.calls[0];
        const url = call[0];
        const config = call[1];
        expect(url).toMatch(new RegExp(`terms/${termName}/definition-source$`));
        expect(config.getContent()).toEqual(definitionSource.toJsonLd());
      });
    });

    it("publishes success message after successful request", () => {
      Ajax.put = jest.fn().mockResolvedValue(null);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          setTermDefinitionSource(definitionSource, term)
        )
      ).then(() => {
        expect(Ajax.put).toHaveBeenCalled();
        const messageAction = store
          .getActions()
          .find((a) => a.type === ActionType.PUBLISH_MESSAGE);
        expect(messageAction).toBeDefined();
        expect(messageAction.message.type).toEqual(MessageType.SUCCESS);
      });
    });

    // Bug #1449
    it("handles multilingual term label by showing localized label when publishing success message", () => {
      Ajax.put = jest.fn().mockResolvedValue(null);
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          setTermDefinitionSource(definitionSource, term)
        )
      ).then(() => {
        expect(Ajax.put).toHaveBeenCalled();
        const messageAction = store
          .getActions()
          .find((a) => a.type === ActionType.PUBLISH_MESSAGE);
        expect(messageAction).toBeDefined();
        expect(messageAction.message.values.term).toEqual(
          term.label[Constants.DEFAULT_LANGUAGE]
        );
      });
    });

    it("publishes error message when server responds with CONFLICT", () => {
      Ajax.put = jest.fn().mockRejectedValue({ status: 409 });
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          setTermDefinitionSource(definitionSource, term)
        )
      ).catch(() => {
        expect(Ajax.put).toHaveBeenCalled();
        const messageAction = store
          .getActions()
          .find((a) => a.type === ActionType.PUBLISH_MESSAGE);
        expect(messageAction).toBeDefined();
        expect(messageAction.message.type).toEqual(MessageType.ERROR);
      });
    });

    // Bug #1449
    it("handles multilingual term label by showing localized label when publishing error message", () => {
      Ajax.put = jest.fn().mockRejectedValue({ status: 409 });
      return Promise.resolve(
        (store.dispatch as ThunkDispatch)(
          setTermDefinitionSource(definitionSource, term)
        )
      ).catch(() => {
        expect(Ajax.put).toHaveBeenCalled();
        const messageAction = store
          .getActions()
          .find((a) => a.type === ActionType.PUBLISH_MESSAGE);
        expect(messageAction).toBeDefined();
        expect(messageAction.message.values.term).toEqual(
          term.label[Constants.DEFAULT_LANGUAGE]
        );
      });
    });
  });
});
