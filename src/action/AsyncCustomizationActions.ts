import { PageRequest, ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
} from "./SyncActions";
import Constants from "../util/Constants";
import Ajax, { param } from "../util/Ajax";
import { ErrorData } from "../model/ErrorInfo";
import { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { Rdf4jStatement } from "../model/Rdf4jStatement";

export function loadCustomAttributeUsage(
  attributeIri: IRI,
  pageRequest: PageRequest
) {
  return (dispatch: ThunkDispatch) => {
    const action = { type: ActionType.LOAD_CUSTOM_ATTRIBUTE_USAGE };
    dispatch(asyncActionRequest(action, true));
    return Ajax.getResponse(
      `${Constants.API_PREFIX}/data/custom-attributes/${attributeIri.fragment}/usage`
        `/data/custom-attributes/${attributeIri.fragment}/usage`,
      param("namespace", attributeIri.namespace)
        .param("size", pageRequest.size.toString())
        .param("page", pageRequest.page.toString())
    )
      .then((res) => {
        dispatch(asyncActionSuccess(action));
        return {
          data: res.data as Rdf4jStatement[],
          totalStatements: res?.headers[Constants.Headers.X_TOTAL_COUNT] || 0,
        };
      })
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function removeCustomAttribute(
  attributeIri: IRI,
  removeUsages: boolean
) {
  return (dispatch: ThunkDispatch) => {
    const action = { type: ActionType.REMOVE_CUSTOM_ATTRIBUTE };
    dispatch(asyncActionRequest(action, false));
    return Ajax.delete(
      `${Constants.API_PREFIX}/data/custom-attributes/${attributeIri.fragment}`,
      param("namespace", attributeIri.namespace).param(
        "removeUsages",
        removeUsages.toString()
      )
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}
