import { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
  publishMessage,
} from "./SyncActions";
import Ajax, { content, param } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import {
  AccessControlList,
  AccessControlRecord,
  CONTEXT as ACL_CONTEXT,
} from "../model/AccessControlList";
import { ErrorData } from "../model/ErrorInfo";
import RdfsResource, {
  CONTEXT as RDFS_CONTEXT,
  RdfsResourceData,
} from "../model/RdfsResource";
import TermItState from "../model/TermItState";
import Message from "../model/Message";
import MessageType from "../model/MessageType";

/**
 * Loads access level options.
 */
export function loadAccessLevels() {
  const action = { type: ActionType.LOAD_ACCESS_LEVELS };
  return (dispatch: ThunkDispatch, getState: () => TermItState) => {
    if (Object.keys(getState().accessLevels).length > 0) {
      return Promise.resolve();
    }
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(`${Constants.API_PREFIX}/language/accessLevels`)
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<RdfsResourceData>(
          data,
          RDFS_CONTEXT
        )
      )
      .then((data: RdfsResourceData[]) =>
        dispatch(
          asyncActionSuccessWithPayload(
            action,
            data.map((d) => new RdfsResource(d))
          )
        )
      )
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function loadVocabularyAccessControlList(vocabularyIri: IRI) {
  const action = { type: ActionType.LOAD_ACCESS_CONTROL_LIST, vocabularyIri };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/acl`,
      param("namespace", vocabularyIri.namespace)
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferences<AccessControlList>(
          data,
          ACL_CONTEXT
        )
      )
      .then((acl: AccessControlList) => {
        dispatch(asyncActionSuccess(action));
        return Promise.resolve(acl);
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return Promise.resolve(undefined);
      });
  };
}

export function createAccessControlRecord(
  vocabularyIri: IRI,
  record: AccessControlRecord<any>
) {
  const action = {
    type: ActionType.CREATE_ACCESS_CONTROL_RECORD,
    vocabularyIri,
    record,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.post(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/acl/records`,
      content(record.toJsonLd()).param("namespace", vocabularyIri.namespace)
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .then(() =>
        dispatch(
          publishMessage(
            new Message(
              { messageId: "vocabulary.acl.record.save.success" },
              MessageType.SUCCESS
            )
          )
        )
      )
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}
