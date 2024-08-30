import { IMessage, StompHeaders } from "react-stomp-hooks";
import { ThunkDispatch } from "../util/Types";
import ActionType from "../action/ActionType";
import { asyncActionFailure } from "../action/SyncActions";
import { Action } from "redux";

export type WebSocketDispatcher<A extends Action> = {
  action: A;
  destinations: string | string[];
  onMessage: WebSocketDispatcherCallback<A>;
  headers?: StompHeaders;
};

export type WebSocketDispatcherCallback<A> = (
  message: IMessage,
  action: A,
  dispatch: ThunkDispatch
) => Promise<void>;

// function d<A extends Action>(
//   destinations: string | string[],
//   action: A,
//   onMessage: WebSocketDispatcherCallback<A>,
//   headers?: StompHeaders
// ): WebSocketDispatcher<A> {
//   return { destinations, action, onMessage, headers };
// }
const DISPATCHERS: { [key in ActionType]?: WebSocketDispatcher<any> } = {
  // [ActionType.FETCH_VALIDATION_RESULTS]: d(
  //   "/vocabularies/validation",
  //   {
  //     type: ActionType.FETCH_VALIDATION_RESULTS,
  //   },
  //   vocabularyValidation
  // ),
};

export function dispatcherExceptionHandler(
  error: any,
  action: Action<any>,
  dispatch: ThunkDispatch
) {
  dispatch(asyncActionFailure(action, error));
}

export default DISPATCHERS;
