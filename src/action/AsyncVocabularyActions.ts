import { ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccessWithPayload,
  publishMessage,
} from "./SyncActions";
import { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import Ajax, { param } from "../util/Ajax";
import Constants from "../util/Constants";
import { ErrorData } from "../model/ErrorInfo";
import Message from "../model/Message";
import MessageType from "../model/MessageType";

export function loadTermCount(vocabularyIri: IRI) {
  const action = { type: ActionType.LOAD_TERM_COUNT, vocabularyIri };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.head(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/terms`,
      param("namespace", vocabularyIri.namespace)
    )
      .then((resp) => {
        const countHeader = resp.headers[Constants.Headers.X_TOTAL_COUNT];
        if (!countHeader) {
          return dispatch(
            asyncActionFailure(action, {
              message: `'${Constants.Headers.X_TOTAL_COUNT}' header missing in server response.`,
            })
          );
        }
        const count = Number(countHeader);
        return dispatch(asyncActionSuccessWithPayload(action, count));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(publishMessage(new Message(error, MessageType.ERROR)));
      });
  };
}
