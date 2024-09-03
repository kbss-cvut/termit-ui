import { IRI, IRIImpl } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import { asyncActionRequest } from "./SyncActions";
import { isString, pickBy } from "lodash";
import Constants from "../util/Constants";
import { StompClient } from "../component/hoc/withStompClient";

const sentVocabularyValidationRequests: Map<string, number> = new Map();

/**
 * @param vocabularyIri
 * @param stompClient the client acquired from {@link import('react-stomp-hooks')#useStompClient} hook
 */
export function requestVocabularyValidation(
  vocabularyIri: IRI,
  stompClient: StompClient
) {
  const action = {
    type: ActionType.FETCH_VALIDATION_RESULTS,
  };

  return (dispatch: ThunkDispatch) => {
    if (!stompClient || !stompClient.active) {
      return;
    }

    const strIri = IRIImpl.create(vocabularyIri).toString();
    const lastRequest = sentVocabularyValidationRequests.get(strIri) || 0;
    const requestTimeoutExpired =
      performance.now() - lastRequest > Constants.WEBSOCKET_REQUEST_TIMEOUT ||
      lastRequest === 0;

    if (!requestTimeoutExpired) {
      return;
    }

    sentVocabularyValidationRequests.set(strIri, performance.now());

    dispatch(asyncActionRequest(action, true));
    const headers = pickBy(
      {
        namespace: vocabularyIri.namespace,
      },
      isString
    );

    stompClient.publish({
      destination: `/vocabularies/${vocabularyIri.fragment}/validate`,
      headers,
    });
  };
}
