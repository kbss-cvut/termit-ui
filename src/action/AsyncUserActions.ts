/*
 * Asynchronous actions involve requests to the backend server REST API. As per recommendations in the Redux docs, this consists
 * of several synchronous sub-actions which inform the application of initiation of the request and its result.
 *
 * This file contains asynchronous actions related to user management in the frontend.
 */

import ActionType from "./ActionType";
import keycloak from "../util/Keycloak";
import { ThunkDispatch } from "../util/Types";
import Ajax, { content, param, params } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import User, {
  CONTEXT as USER_CONTEXT,
  UserAccountData,
  UserData,
} from "../model/User";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
  publishMessage,
} from "./SyncActions";
import { ErrorData } from "../model/ErrorInfo";
import Message, { createFormattedMessage } from "../model/Message";
import MessageType from "../model/MessageType";
import { isActionRequestPending, loadConfiguration } from "./AsyncActions";
import TermItState from "../model/TermItState";
import VocabularyUtils from "../util/VocabularyUtils";
import { Action } from "redux";
import { AxiosResponse } from "axios";
import Routing from "../util/Routing";
import { UserRoleData } from "../model/UserRole";
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
        Routing.transitionTo(Routes.login);
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

export function login(username: string, password: string) {
  const action = {
    type: ActionType.LOGIN,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.post(
      "/j_spring_security_check",
      params({
        username,
        password,
      }).contentType(Constants.X_WWW_FORM_URLENCODED)
    )
      .then((resp: AxiosResponse) => {
        const data = resp.data;
        if (!data.loggedIn) {
          return Promise.reject(data);
        } else {
          Routing.transitionToOriginalTarget();
          dispatch(asyncActionSuccess(action));
          return Promise.resolve();
        }
      })
      .then(() =>
        dispatch(publishMessage(createFormattedMessage("message.welcome")))
      )
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function loginKeycloak() {
  const action = {
    type: ActionType.LOGIN_KEYCLOAK,
  };
  const redirectUri = Routing.buildFullUrl(
    Routing.originalRoutingTarget
      ? Routing.originalRoutingTarget
      : Routes.dashboard
  );
  keycloak.login({ redirectUri });
  return (dispatch: ThunkDispatch) => {
    dispatch(action);
  };
}

export function register(user: UserAccountData) {
  const action = {
    type: ActionType.REGISTER,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.post(
      Constants.API_PREFIX + "/users",
      content(user).contentType("application/json")
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .then(() => dispatch(login(user.username, user.password)))
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

/**
 * This is basically the same as 'register', but is used from administration to add new users by admin and does not do
 * synthetic login on success.
 *
 * @param user Data of the user account to create
 */
export function createNewUser(user: UserAccountData) {
  const action = { type: ActionType.CREATE_USER };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.post(
      Constants.API_PREFIX + "/users",
      content(user).contentType("application/json")
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .then(() =>
        dispatch(
          publishMessage(
            new Message(
              {
                messageId: "administration.users.create.created",
                values: {
                  name: `${user.firstName} ${user.lastName}`,
                },
              },
              MessageType.SUCCESS
            )
          )
        )
      )
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function loadUsers() {
  const action = {
    type: ActionType.LOAD_USERS,
  };
  return (dispatch: ThunkDispatch, getState: () => TermItState) => {
    if (isActionRequestPending(getState(), action)) {
      return Promise.resolve([]);
    }
    dispatch(asyncActionRequest(action));
    return Ajax.get(Constants.API_PREFIX + USERS_ENDPOINT)
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<UserData>(
          data,
          USER_CONTEXT
        )
      )
      .then((data: UserData[]) => {
        dispatch(asyncActionSuccess(action));
        return data.map((d) => new User(d));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(publishMessage(new Message(error, MessageType.ERROR)));
        return [];
      });
  };
}

export function disableUser(user: User) {
  const action = {
    type: ActionType.DISABLE_USER,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const iri = VocabularyUtils.create(user.iri);
    return Ajax.delete(
      `${Constants.API_PREFIX}${USERS_ENDPOINT}/${iri.fragment}/status`,
      param("namespace", iri.namespace)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        return dispatch(
          publishMessage(
            new Message(
              {
                messageId: "administration.users.status.action.disable.success",
                values: { name: user.fullName },
              },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(publishMessage(new Message(error, MessageType.ERROR)));
      });
  };
}

export function changeRole(user: User, role: UserRoleData) {
  const action = {
    type: ActionType.CHANGE_ROLE,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const iri = VocabularyUtils.create(user.iri);
    return Ajax.put(
      `${Constants.API_PREFIX}${USERS_ENDPOINT}/${iri.fragment}/role`,
      param("namespace", iri.namespace)
        .content(role.iri)
        .contentType(Constants.TEXT_MIME_TYPE)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        return dispatch(
          publishMessage(
            new Message(
              {
                messageId:
                  "administration.users.status.action.changeRole.success",
              },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(publishMessage(new Message(error, MessageType.ERROR)));
      });
  };
}

export function enableUser(user: User) {
  const action = {
    type: ActionType.ENABLE_USER,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const iri = VocabularyUtils.create(user.iri);
    return Ajax.post(
      `${Constants.API_PREFIX}${USERS_ENDPOINT}/${iri.fragment}/status`,
      param("namespace", iri.namespace)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        return dispatch(
          publishMessage(
            new Message(
              {
                messageId: "administration.users.status.action.enable.success",
                values: { name: user.fullName },
              },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(publishMessage(new Message(error, MessageType.ERROR)));
      });
  };
}

export function unlockUser(user: User, newPassword: string) {
  const action = {
    type: ActionType.UNLOCK_USER,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const iri = VocabularyUtils.create(user.iri);
    return Ajax.delete(
      `${Constants.API_PREFIX}${USERS_ENDPOINT}/${iri.fragment}/lock`,
      content(newPassword)
        .contentType(Constants.TEXT_MIME_TYPE)
        .param("namespace", iri.namespace)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        return dispatch(
          publishMessage(
            new Message(
              {
                messageId: "administration.users.status.action.unlock.success",
                values: { name: user.fullName },
              },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(publishMessage(new Message(error, MessageType.ERROR)));
      });
  };
}

export function updateProfile(user: User) {
  const action = {
    type: ActionType.UPDATE_PROFILE,
  };
  return updateUser(user, action, "profile.updated.message");
}

function updateUser(user: User, action: Action, messageId: string) {
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));

    return Ajax.put(
      `${Constants.API_PREFIX}/users/current`,
      content(user.toJsonLd())
    )
      .then(() => dispatch(loadUser()))
      .then(() => {
        dispatch(
          publishMessage(new Message({ messageId }, MessageType.SUCCESS))
        );
        return dispatch(asyncActionSuccess(action));
      })
      .catch((error: ErrorData) => {
        dispatch(publishMessage(new Message(error, MessageType.ERROR)));
        return dispatch(asyncActionFailure(action, error));
      });
  };
}

export function changePassword(user: User) {
  const action = {
    type: ActionType.CHANGE_PASSWORD,
  };
  return updateUser(user, action, "change-password.updated.message");
}
