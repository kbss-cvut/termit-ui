import { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
} from "./SyncActions";
import Ajax, { param } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import { AccessControlList, CONTEXT } from "../model/AccessControlList";
import { ErrorData } from "../model/ErrorInfo";

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
