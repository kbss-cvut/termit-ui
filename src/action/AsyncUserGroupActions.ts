import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  publishMessage,
} from "./SyncActions";
import Ajax, { content, param } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import UserGroup, { CONTEXT, UserGroupData } from "../model/UserGroup";
import { ErrorData } from "../model/ErrorInfo";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import VocabularyUtils from "../util/VocabularyUtils";

const GROUPS_ENDPOINT = `${Constants.API_PREFIX}/groups`;

export function loadUserGroups() {
  const action = { type: ActionType.LOAD_USER_GROUPS };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(GROUPS_ENDPOINT)
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<UserGroupData>(
          data,
          CONTEXT
        )
      )
      .then((data: UserGroupData[]) => {
        dispatch(asyncActionSuccess(action));
        return Promise.resolve(data.map((d) => new UserGroup(d)));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(publishMessage(new Message(error, MessageType.ERROR)));
        return Promise.resolve([]);
      });
  };
}

export function createUserGroup(group: UserGroup) {
  const action = { type: ActionType.CREATE_USER_GROUP, group };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.post(GROUPS_ENDPOINT, content(group.toJson()))
      .then(() => {
        dispatch(asyncActionSuccess(action));
        dispatch(
          publishMessage(
            new Message(
              { messageId: "administration.groups.create.success" },
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

export function removeUserGroup(group: UserGroup) {
  const action = { type: ActionType.REMOVE_USER_GROUP, group };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const iri = VocabularyUtils.create(group.iri!);
    return Ajax.delete(
      `${GROUPS_ENDPOINT}/${iri.fragment}`,
      param("namespace", iri.namespace)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        dispatch(
          publishMessage(
            new Message(
              { messageId: "administration.groups.remove.success" },
              MessageType.SUCCESS
            )
          )
        );
      })
      .then(() => dispatch(loadUserGroups()))
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(publishMessage(new Message(error, MessageType.ERROR)));
        return dispatch(loadUserGroups());
      });
  };
}
