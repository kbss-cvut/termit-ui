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
    return Ajax.get(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/terms/count`,
      param("namespace", vocabularyIri.namespace).accept(
        Constants.JSON_MIME_TYPE
      )
    )
      .then((res: number) =>
        dispatch(asyncActionSuccessWithPayload(action, res))
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(publishMessage(new Message(error, MessageType.ERROR)));
      });
  };
}
