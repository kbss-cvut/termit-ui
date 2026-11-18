import { PageRequest, ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  publishMessage,
} from "./SyncActions";
import Constants from "../util/Constants";
import Ajax, { content, param } from "../util/Ajax";
import { ErrorData } from "../model/ErrorInfo";
import VocabularyUtils, { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { RDF_STATEMENT_CONTEXT, RdfStatement } from "../model/RdfStatement";
import { CustomAttribute, CustomAttributeData } from "../model/RdfsResource";
import { createPropertyImpl, getPropertiesImpl } from "./AsyncActions";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import JsonLdUtils from "../util/JsonLdUtils";

export function getCustomAttributes() {
  return getPropertiesImpl<CustomAttributeData, CustomAttribute>(
    { type: ActionType.GET_CUSTOM_ATTRIBUTES },
    "/data/custom-attributes",
    (d) => new CustomAttribute(d),
    () => []
  );
}

export function createCustomAttribute(attribute: CustomAttribute) {
  return createPropertyImpl(
    attribute,
    { type: ActionType.CREATE_CUSTOM_ATTRIBUTE },
    "/data/custom-attributes"
  );
}

export function updateCustomAttribute(attribute: CustomAttribute) {
  const action = { type: ActionType.UPDATE_CUSTOM_ATTRIBUTE };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.put(
      Constants.API_PREFIX +
        "/data/custom-attributes/" +
        VocabularyUtils.create(attribute.iri).fragment,
      content(attribute.toJsonLd())
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        dispatch(
          publishMessage(
            new Message(
              {
                messageId:
                  "administration.customization.customAttributes.update.success",
              },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function loadCustomAttributeUsage(
  attributeIri: IRI,
  pageRequest: PageRequest
) {
  return (dispatch: ThunkDispatch) => {
    const action = { type: ActionType.LOAD_CUSTOM_ATTRIBUTE_USAGE };
    dispatch(asyncActionRequest(action, true));
    return Ajax.getResponse(
      `${Constants.API_PREFIX}/data/custom-attributes/${attributeIri.fragment}/usage`,
      param("namespace", attributeIri.namespace)
        .param("size", pageRequest.size.toString())
        .param("page", pageRequest.page.toString())
    )
      .then((res) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<RdfStatement>(
          res.data,
          RDF_STATEMENT_CONTEXT
        ).then((data) => {
          dispatch(asyncActionSuccess(action));
          return {
            data,
            totalStatements: res?.headers[Constants.Headers.X_TOTAL_COUNT] || 0,
          };
        })
      )
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
