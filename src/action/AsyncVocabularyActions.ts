import { ThunkDispatch } from "../util/Types";
import * as SyncActions from "./SyncActions";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
  publishMessage,
} from "./SyncActions";
import VocabularyUtils, { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import Ajax, { param, params } from "../util/Ajax";
import Constants from "../util/Constants";
import { ErrorData } from "../model/ErrorInfo";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import ExportType from "../util/ExportType";
import { AxiosResponse } from "axios";
import Utils from "../util/Utils";

export function loadTermCount(vocabularyIri: IRI) {
  const action = { type: ActionType.LOAD_TERM_COUNT, vocabularyIri };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.head(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/terms`,
      param("namespace", vocabularyIri.namespace)
    )
      .then((resp) => {
        const countHeader = resp.headers[Constants.Headers.X_TOTAL_COUNT];
        if (!countHeader) {
          return dispatch(
            asyncActionFailure(action, {
              message: `'${Constants.Headers.X_TOTAL_COUNT}' header missing in server response.`,
            })
          );
        }
        const count = Number(countHeader);
        return dispatch(asyncActionSuccessWithPayload(action, count));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(publishMessage(new Message(error, MessageType.ERROR)));
      });
  };
}

export function exportGlossary(
  vocabularyIri: IRI,
  type: ExportType,
  queryParams: {} = {}
) {
  const action = {
    type: ActionType.EXPORT_GLOSSARY,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const url =
      Constants.API_PREFIX +
      "/vocabularies/" +
      vocabularyIri.fragment +
      "/terms";
    return Ajax.getRaw(
      url,
      params(queryParams)
        .param("namespace", vocabularyIri.namespace)
        .accept(type.mimeType)
        .responseType("arraybuffer")
    )
      .then((resp: AxiosResponse) => {
        const disposition = resp.headers[Constants.Headers.CONTENT_DISPOSITION];
        const filenameMatch = disposition
          ? disposition.match(/filename="(.+\..+)"/)
          : null;
        if (filenameMatch) {
          const fileName = filenameMatch[1];
          Utils.fileDownload(resp.data, fileName, type.mimeType);
          return dispatch(asyncActionSuccess(action));
        } else {
          const error: ErrorData = {
            requestUrl: url,
            messageId: "vocabulary.summary.export.error",
          };
          dispatch(asyncActionFailure(action, error));
          return dispatch(
            SyncActions.publishMessage(new Message(error, MessageType.ERROR))
          );
        }
      })
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function exportGlossaryWithExactMatchReferences(vocabularyIri: IRI) {
  return exportGlossary(vocabularyIri, ExportType.Turtle, {
    withReferences: true,
    property: [VocabularyUtils.SKOS_EXACT_MATCH],
  });
}
