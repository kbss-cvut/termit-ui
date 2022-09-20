import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import Ajax, { content } from "../util/Ajax";
import Constants from "../util/Constants";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
} from "./SyncActions";
import { ErrorData } from "../model/ErrorInfo";
import * as SyncActions from "./SyncActions";
import Message from "../model/Message";
import MessageType from "../model/MessageType";

export function openForEditing(contexts: string[]) {
  const action = { type: ActionType.OPEN_CONTEXTS_FOR_EDITING };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.put(`${Constants.API_PREFIX}/workspace`, content(contexts))
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}
