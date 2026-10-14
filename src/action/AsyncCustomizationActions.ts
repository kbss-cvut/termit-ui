import { PageRequest, ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
  publishMessage,
} from "./SyncActions";
import Constants from "../util/Constants";
import Ajax, { accept, content, param, paramsSerializer } from "../util/Ajax";
import { ErrorData } from "../model/ErrorInfo";
import VocabularyUtils, { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { RdfStatement } from "../model/RdfStatement";
import { CustomAttribute, CustomAttributeData } from "../model/RdfsResource";
import { createPropertyImpl, getPropertiesImpl } from "./AsyncActions";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import {
  CustomAttributesProfile,
  CustomAttributesProfileData,
  CustomAttributesProfileDescriptionData,
  PROFILE_CONTEXT,
  PROFILE_DESCRIPTION_CONTEXT,
} from "../model/CustomAttributesProfile";
import Utils from "../util/Utils";
import { AxiosResponse } from "axios";
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
      .then((res) => {
        dispatch(asyncActionSuccess(action));
        return {
          data: res.data as RdfStatement[],
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

/**
 * Exports the specified custom attributes as a JSON-LD profile and downloads it as a file.
 *
 * @param profile Description of the exported profile
 * @param customAttributeIris Identifiers of custom attributes to include in the profile
 */
export function exportCustomAttributesProfile(
  profile: CustomAttributesProfileDescriptionData,
  customAttributeIris: string[]
) {
  const action = { type: ActionType.EXPORT_CUSTOM_ATTRIBUTES_PROFILE };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const query = paramsSerializer({
      customAttributeUris: customAttributeIris,
    });
    return Ajax.post(
      `${Constants.API_PREFIX}/data/profile/custom-attributes/export?${query}`,
      content(
        Object.assign({}, profile, { "@context": PROFILE_DESCRIPTION_CONTEXT })
      )
    )
      .then((resp: AxiosResponse) => {
        const disposition = resp.headers[Constants.Headers.CONTENT_DISPOSITION];
        const filenameMatch = disposition
          ? disposition.match(/filename="(.+\..+)"/)
          : null;
        Utils.fileDownload(
          typeof resp.data === "string"
            ? resp.data
            : JSON.stringify(resp.data, null, 2),
          filenameMatch ? filenameMatch[1] : "custom-attributes-profile.jsonld",
          Constants.JSON_LD_MIME_TYPE
        );
        return dispatch(asyncActionSuccess(action));
      })
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function downloadProfileFromUri(
  uri: string,
  abortController: AbortController
) {
  const action = { type: ActionType.DOWNLOAD_CUSTOM_ATTRIBUTES_PROFILE };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      uri,
      accept(Constants.JSON_LD_MIME_TYPE)
        .signal(abortController)
        .preserveAcceptHeaderInPost()
        .excludeCredentials()
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferences<CustomAttributesProfileData>(
          data,
          PROFILE_CONTEXT
        )
      )
      .then((data) => new CustomAttributesProfile(data))
      .then((profile) =>
        dispatch(asyncActionSuccessWithPayload(action, profile))
      )
      .catch((error: ErrorData | Error) => {
        if (error instanceof Error) {
          error = { message: error.message };
        }
        return dispatch(asyncActionFailure(action, error));
      });
  };
}

export function loadProfileFromFile(file: File) {
  const action = { type: ActionType.LOAD_CUSTOM_ATTRIBUTES_PROFILE };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return file
      .text()
      .then(JSON.parse)
      .then((data) =>
        JsonLdUtils.compactAndResolveReferences<CustomAttributesProfileData>(
          data,
          PROFILE_CONTEXT
        )
      )
      .then((data) => new CustomAttributesProfile(data))
      .then((profile) =>
        dispatch(asyncActionSuccessWithPayload(action, profile))
      )
      .catch((error: ErrorData | Error) => {
        if (error instanceof Error) {
          error = { message: `${error.name}: ${error.message}` };
        }
        return dispatch(asyncActionFailure(action, error));
      });
  };
}

export function importCustomAttributesProfile(
  profile: CustomAttributesProfile
) {
  const action = { type: ActionType.IMPORT_CUSTOM_ATTRIBUTES_PROFILE };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.post(
      `${Constants.API_PREFIX}/data/profile/custom-attributes/import`,
      content(profile.toJsonLd())
    )
      .then(() => dispatch(getCustomAttributes()))
      .then(() => {
        dispatch(
          publishMessage(
            new Message(
              {
                messageId:
                  "administration.customization.customAttributes.profile.import.success",
              },
              MessageType.SUCCESS
            )
          )
        );
        return dispatch(asyncActionSuccess(action));
      })
      .catch((error: ErrorData) => {
        dispatch(
          publishMessage(
            new Message(
              {
                ...error,
              },
              MessageType.ERROR
            )
          )
        );
        return dispatch(asyncActionFailure(action, error));
      });
  };
}
