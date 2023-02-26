import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  publishMessage,
} from "./SyncActions";
import Ajax, { content } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import UserGroup, { CONTEXT, UserGroupData } from "../model/UserGroup";
import { ErrorData } from "../model/ErrorInfo";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import VocabularyUtils, { IRI } from "../util/VocabularyUtils";

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

export function loadUserGroup(iri: IRI) {
  const action = { type: ActionType.LOAD_USER_GROUP };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(`${GROUPS_ENDPOINT}/${iri.fragment}`)
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferences<UserGroupData>(data, CONTEXT)
      )
      .then((data: UserGroupData) => {
        dispatch(asyncActionSuccess(action));
        return Promise.resolve(new UserGroup(data));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(publishMessage(new Message(error, MessageType.ERROR)));
        return Promise.resolve(undefined);
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
    return Ajax.delete(`${GROUPS_ENDPOINT}/${iri.fragment}`)
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

export function updateUserGroupLabel(group: UserGroup) {
  const action = { type: ActionType.UPDATE_USER_GROUP_LABEL, group };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const iri = VocabularyUtils.create(group.iri!);
    return Ajax.put(
      `${GROUPS_ENDPOINT}/${iri.fragment}/label`,
      content(group.label).contentType(Constants.TEXT_MIME_TYPE)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(publishMessage(new Message(error, MessageType.ERROR)));
      });
  };
}

export function addGroupMembers(group: UserGroup, toAdd: string[]) {
  const action = { type: ActionType.ADD_USER_GROUP_MEMBERS, group, toAdd };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const iri = VocabularyUtils.create(group.iri!);
    return Ajax.post(
      `${GROUPS_ENDPOINT}/${iri.fragment}/members`,
      content(toAdd)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(publishMessage(new Message(error, MessageType.ERROR)));
      });
  };
}

export function removeGroupMembers(group: UserGroup, toRemove: string[]) {
  const action = {
    type: ActionType.REMOVE_USER_GROUP_MEMBERS,
    group,
    toRemove,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const iri = VocabularyUtils.create(group.iri!);
    return Ajax.delete(
      `${GROUPS_ENDPOINT}/${iri.fragment}/members`,
      content(toRemove)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(publishMessage(new Message(error, MessageType.ERROR)));
      });
  };
}
