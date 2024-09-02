import { IRIImpl } from "../../util/VocabularyUtils";
import configureMockStore, { MockStoreEnhanced } from "redux-mock-store";
import TermItState from "../../model/TermItState";
import thunk from "redux-thunk";
import { Client, mock as stompMock, IPublishParams } from "react-stomp-hooks";
import { ThunkDispatch } from "../../util/Types";

const mockStore = configureMockStore<TermItState>([thunk]);

describe("Vocabulary validation request", () => {
  const vocabularyIri = IRIImpl.create({
    namespace: "vocabularyNamespace",
    fragment: "vocabularyFragment",
  });
  const destination = `/vocabularies/${vocabularyIri.fragment}/validate`;

  let sut: typeof import("../WebSocketVocabularyActions");

  let store: MockStoreEnhanced<TermItState>;
  /**
   * The mock supports only the publish operation
   */
  let stompClient: Client;
  let dispatch: ThunkDispatch;

  const getSentMessages = (): IPublishParams[] =>
    (stompMock.getSentMockMessages(destination) as IPublishParams[]) || [];

  beforeEach(() => {
    jest.clearAllMocks();
    stompMock.reset();
    store = mockStore(new TermItState());
    dispatch = store.dispatch;
    stompClient = { ...stompMock.getMockClient(), active: true } as Client;

    return import("../WebSocketVocabularyActions").then((module) => {
      sut = module;
      jest.resetModules();
    });
  });

  it("Sends only one request when called multiple times in a short time", () => {
    expect(getSentMessages().length).toBe(0);

    dispatch(sut.requestVocabularyValidation(vocabularyIri, stompClient));
    dispatch(sut.requestVocabularyValidation(vocabularyIri, stompClient));
    dispatch(sut.requestVocabularyValidation(vocabularyIri, stompClient));

    expect(getSentMessages().length).toBe(1);
  });
  it("Always sends namespace in header", () => {
    expect(getSentMessages().length).toBe(0);

    dispatch(sut.requestVocabularyValidation(vocabularyIri, stompClient));

    expect(getSentMessages().length).toBe(1);
    const message = getSentMessages()[0];
    expect(message.headers).not.toBeNull();
    expect(message.headers!["namespace"]).toBe(vocabularyIri.namespace);
  });
});
