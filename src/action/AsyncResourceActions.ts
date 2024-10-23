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
import File, { FileData } from "../model/File";
import { CONTEXT as DOCUMENT_CONTEXT } from "../model/Document";
import { ErrorData } from "../model/ErrorInfo";
import { AxiosResponse } from "axios";
import Utils from "../util/Utils";

export function loadFileMetadata(fileIri: IRI) {
  const action = { type: ActionType.LOAD_FILE_METADATA };
  return (dispatch: ThunkDispatch) => {
    asyncActionRequest(action, true);
    return Ajax.get(
      `${Constants.API_PREFIX}/resources/${fileIri.fragment}`,
      param("namespace", fileIri.namespace)
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferences<FileData>(
          data,
          DOCUMENT_CONTEXT
        )
      )
      .then((data: FileData) => {
        dispatch(asyncActionSuccess(action));
        return new File(data);
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return undefined;
      });
  };
}

/**
 * Downloads the content of a file with the specified IRI (assuming it is stored on the server).
 * @param fileIri File identifier
 * @param options File export options
 */
export function exportFileContent(
  fileIri: IRI,
  options: {
    at?: string;
    withoutUnconfirmedOccurrences?: boolean;
  } = {}
) {
  const action = {
    type: ActionType.EXPORT_FILE_CONTENT,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const url =
      Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content";
    return Ajax.getRaw(
      url,
      param("namespace", fileIri.namespace)
        .param("attachment", "true")
        .param("at", options.at)
        .param(
          "withoutUnconfirmedOccurrences",
          options.withoutUnconfirmedOccurrences?.toString()
        )
        .responseType("arraybuffer")
    )
      .then((resp: AxiosResponse) => {
        const fileName = fileIri.fragment;
        const mimeType = resp.headers["content-type"];
        Utils.fileDownload(resp.data, fileName, mimeType);
        return dispatch(asyncActionSuccess(action));
      })
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}
