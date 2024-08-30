import { IRI, IRIImpl } from "../util/VocabularyUtils";
import { Client } from "react-stomp-hooks";
import ActionType from "./ActionType";
import { GetStoreState, ThunkDispatch } from "../util/Types";
import { asyncActionRequest } from "./SyncActions";
import { isString, pickBy } from "lodash";

const sentVocabularyValidationRequests: string[] = [];

/**
 * @param vocabularyIri
 * @param stompClient the client acquired from {@link import('react-stomp-hooks').useStompClient} hook
 */
export function requestVocabularyValidation(
  vocabularyIri: IRI,
  stompClient: Client
) {
  const action = {
    type: ActionType.FETCH_VALIDATION_RESULTS,
  };

  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    if (!stompClient || !stompClient.active) {
      return;
    }

    const strIri = IRIImpl.create(vocabularyIri).toString();

    if (sentVocabularyValidationRequests.includes(strIri)) {
      return;
    }

    sentVocabularyValidationRequests.push(strIri);

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
