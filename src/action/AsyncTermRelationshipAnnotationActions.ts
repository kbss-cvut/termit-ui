import { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccessWithPayload,
} from "./SyncActions";
import Ajax, { param } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import RelationshipAnnotation, {
  CONTEXT,
} from "../model/meta/RelationshipAnnotation";
import { ErrorData } from "../model/ErrorInfo";

export function loadTermRelationshipAnnotations(termIri: IRI) {
  const action = { type: ActionType.LOAD_TERM_RELATIONSHIP_ANNOTATIONS };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${Constants.API_PREFIX}/terms/${termIri.fragment}/relationship-annotations`,
      param("namespace", termIri.namespace)
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<RelationshipAnnotation>(
          data,
          CONTEXT
        )
      )
      .then((annotations) =>
        dispatch(asyncActionSuccessWithPayload(action, annotations))
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        throw error;
      });
  };
}
