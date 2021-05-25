import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import VocabularyUtils from "../../util/VocabularyUtils";
import Ajax from "../../util/Ajax";
import { ThunkDispatch } from "../../util/Types";
import { setTermDefinitionSource } from "../AsyncTermActions";
import TermOccurrence from "../../model/TermOccurrence";
import Generator from "../../__tests__/environment/Generator";
import Term from "../../model/Term";
import ActionType from "../ActionType";
import MessageType from "../../model/MessageType";
import { langString } from "../../model/MultilingualString";
import Constants from "../../util/Constants";

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
