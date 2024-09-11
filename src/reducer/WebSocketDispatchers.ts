import { IMessage, StompHeaders } from "react-stomp-hooks";
import { ThunkDispatch } from "../util/Types";
import ActionType from "../action/ActionType";
import { asyncActionFailure } from "../action/SyncActions";
import { Action } from "redux";
import { vocabularyValidation } from "./WebSocketVocabularyDispatchers";
import { updateLongRunningTasks } from "./WebSocketUtilityDispatchers";
import Constants from "../util/Constants";

export interface WebSocketDispatcher<A extends Action> {
  action: A;
  destinations: string | string[];
  onMessage: WebSocketDispatcherCallback<A>;
  headers?: StompHeaders;
}

export type WebSocketDispatcherCallback<A> = (
  message: IMessage,
  action: A,
  dispatch: ThunkDispatch
) => Promise<any>;

/**
 * Creates {@link WebSocketDispatcher}
 */
function d<A extends Action>(
  destinations: string | string[],
  action: A,
  onMessage: WebSocketDispatcherCallback<A>,
  headers?: StompHeaders
): { [key in ActionType]?: WebSocketDispatcher<A> } {
  return { [action.type]: { destinations, action, onMessage, headers } };
}

const DISPATCHERS: { [key in ActionType]?: WebSocketDispatcher<any> } = {
  ...d(
    Constants.WEBSOCKET_ENDPOINT.VOCABULARIES_VALIDATION,
    {
      type: ActionType.FETCH_VALIDATION_RESULTS,
    },
    (message, action, dispatch) => dispatch(vocabularyValidation(message, null))
  ),
  ...d(
    [
      Constants.WEBSOCKET_ENDPOINT.LONG_RUNNING_TASKS_UPDATE,
      "/user" + Constants.WEBSOCKET_ENDPOINT.LONG_RUNNING_TASKS_UPDATE,
    ],
    {
      type: ActionType.LONG_RUNNING_TASKS_UPDATE,
    },
    (message, action, dispatch) =>
      dispatch(updateLongRunningTasks(message, action))
  ),
};

export function dispatcherExceptionHandler(
  error: any,
  action: Action<any>,
  dispatch: ThunkDispatch
) {
  dispatch(asyncActionFailure(action, error));
}

export default DISPATCHERS;
