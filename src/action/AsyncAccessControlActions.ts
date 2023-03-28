import { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
} from "./SyncActions";
import Ajax, { param } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import { AccessControlList, CONTEXT } from "../model/AccessControlList";
import { ErrorData } from "../model/ErrorInfo";
import RdfsResource, {
  RdfsResourceData,
  CONTEXT as RDFS_CONTEXT,
} from "../model/RdfsResource";
import TermItState from "../model/TermItState";

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
          CONTEXT
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
