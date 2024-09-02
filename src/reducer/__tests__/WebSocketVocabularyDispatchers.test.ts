import { IRIImpl } from "../../util/VocabularyUtils";
import { IMessage, mock as stompMock } from "react-stomp-hooks";
import { vocabularyValidation } from "../WebSocketVocabularyDispatchers";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import { ThunkDispatch } from "../../util/Types";
import { AsyncActionSuccess } from "../../action/ActionType";
import ValidationResult from "../../model/ValidationResult";

const mockStore = configureMockStore<TermItState>([thunk]);

describe("Vocabulary Validation", () => {
  const vocabularyIri = IRIImpl.create({
    namespace: "vocabularyNamespace",
    fragment: "vocabularyFragment",
  });

  let store: MockStoreEnhanced<TermItState>;
  let dispatch: ThunkDispatch;

  const message: IMessage = {
    ack: () => {},
    nack: () => {},
    isBinaryBody: false,
    binaryBody: new Uint8Array(0),
    command: "MESSAGE",
    body: "",
    headers: {
      vocabulary: vocabularyIri.toString(),
      namespace: vocabularyIri.namespace || "",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    stompMock.reset();
    store = mockStore(new TermItState());
    dispatch = store.dispatch;
  });

  /**
   * If the iri is not specified, we want to update validation that is present in the store
   */
  it("It loads validation when iri is null and validation is present in store", async () => {
    store.getState().validationResults[vocabularyIri.toString()] = [
      // @ts-ignore
      {} as ValidationResult,
    ];

    const result = await dispatch(
      vocabularyValidation({ ...message, body: "[]" }, null)
    );

    expect(result).toBeTruthy();
  });

  /**
   * If the iri is specified we want to load the validation anytime the iri matches with the one in the message
   */
  it("It loads validation when iri is specified and validation is present in store", async () => {
    store.getState().validationResults[vocabularyIri.toString()] = [
      // @ts-ignore
      {} as ValidationResult,
    ];

    const result = await dispatch(
      vocabularyValidation({ ...message, body: "[]" }, vocabularyIri.toString())
    );

    expect(result).toBeTruthy();
  });

  /**
   * If the iri is specified we want to load the validation anytime the iri matches with the one in the message
   */
  it("It loads validation when iri is specified and validation is not present in store", async () => {
    const result = await dispatch(
      vocabularyValidation({ ...message, body: "[]" }, vocabularyIri.toString())
    );

    expect(result).toBeTruthy();
  });

  /**
   * When IRI is not specified, we don't want to load new validation that is not already in the store
   */
  it("It does not load validation when iri is null and validation is not present in store", async () => {
    const result = await dispatch(
      vocabularyValidation({ ...message, body: "[]" }, null)
    );

    expect(result).toBeFalsy();
  });

  it("It does not load validation when iri is specified and vocabulary from message differ", async () => {
    const result = await dispatch(
      vocabularyValidation(
        {
          ...message,
          body: "[]",
          headers: { ...message.headers, vocabulary: "another IRI" },
        },
        vocabularyIri.toString()
      )
    );

    expect(result).toBeFalsy();
  });

  it("Extracts validation results from incoming JSON", async () => {
    const validationResults = require("../../rest-mock/validation-results.json");

    const validationLoaded = await dispatch(
      vocabularyValidation(
        { ...message, body: JSON.stringify(validationResults) },
        vocabularyIri.toString()
      )
    );
    expect(validationLoaded).toBeTruthy();
    expect(store.getActions().length).toBe(1);

    const successAction: AsyncActionSuccess<{
      [vocabularyIri: string]: ValidationResult[];
    }> = store.getActions()[0];
    const result = successAction.payload[vocabularyIri.toString()];
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
        validationResults[i]["http://www.w3.org/ns/shacl#resultSeverity"]["@id"]
      );
      expect(Object.getOwnPropertyNames(array[i].message).length).toEqual(
        validationResults[i]["http://www.w3.org/ns/shacl#resultMessage"].length
      );
    }
  });

  it("Extracts single resource as an array of resources from incoming JSON-LD", async () => {
    const validationResults = require("../../rest-mock/validation-results.json");

    const validationLoaded = await dispatch(
      vocabularyValidation(
        { ...message, body: JSON.stringify(validationResults) },
        vocabularyIri.toString()
      )
    );
    expect(validationLoaded).toBeTruthy();
    expect(store.getActions().length).toBe(1);

    const successAction: AsyncActionSuccess<{
      [vocabularyIri: string]: ValidationResult[];
    }> = store.getActions()[0];
    const result = successAction.payload[vocabularyIri.toString()];
    const array =
      result[
        "http://onto.fel.cvut.cz/ontologies/slovník/datový/psp-2016/pojem/chráněná-část-záplavového-území"
      ];
    expect(array).toBeDefined();
    expect(array[0].term.iri).toEqual(
      validationResults[0]["http://www.w3.org/ns/shacl#focusNode"]["@id"]
    );
    expect(array[0].severity.iri).toEqual(
      validationResults[0]["http://www.w3.org/ns/shacl#resultSeverity"]["@id"]
    );
    expect(Object.getOwnPropertyNames(array[0].message).length).toEqual(
      validationResults[0]["http://www.w3.org/ns/shacl#resultMessage"].length
    );
  });
});
