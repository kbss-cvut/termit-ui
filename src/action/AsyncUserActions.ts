/*
 * Asynchronous actions involve requests to the backend server REST API. As per recommendations in the Redux docs, this consists
 * of several synchronous sub-actions which inform the application of initiation of the request and its result.
 *
 * This file contains asynchronous actions related to user management in the frontend.
 */

import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import Ajax from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import User, { CONTEXT as USER_CONTEXT, UserData } from "../model/User";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccessWithPayload,
  publishMessage,
} from "./SyncActions";
import { ErrorData } from "../model/ErrorInfo";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import { loadConfiguration } from "./AsyncActions";
import keycloak from "../util/Keycloak";
import Routing, { Routing as RoutingCls } from "../util/Routing";
import Routes from "../util/Routes";

const USERS_ENDPOINT = "/users";

export function loadUser() {
  const action = {
    type: ActionType.FETCH_USER,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.get(`${Constants.API_PREFIX}${USERS_ENDPOINT}/current`)
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferences<UserData>(data, USER_CONTEXT)
      )
      .then((data: UserData) => {
        dispatch(loadConfiguration());
        return dispatch(asyncActionSuccessWithPayload(action, new User(data)));
      })
      .catch((error: ErrorData) => {
        if (error.status === Constants.STATUS_UNAUTHORIZED) {
          return dispatch(
            asyncActionFailure(action, {
              message: "Not logged in.",
            })
          );
        } else {
          dispatch(asyncActionFailure(action, error));
          return dispatch(
            publishMessage(new Message(error, MessageType.ERROR))
          );
        }
      });
  };
}

export function login() {
  const action = {
    type: ActionType.LOGIN,
  };
  const redirectUri = RoutingCls.buildFullUrl(
    Routing.originalRoutingTarget
      ? Routing.originalRoutingTarget
      : Routes.dashboard
  );
  keycloak.login({ redirectUri });
  return (dispatch: ThunkDispatch) => {
    dispatch(action);
  };
}
