import * as SyncActions from "./SyncActions";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
} from "./SyncActions";
import Ajax, { contentType, responseType } from "../util/Ajax";
import { ThunkDispatch } from "../util/Types";
import Constants from "../util/Constants";
import { ErrorData } from "../model/ErrorInfo";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { Action } from "redux";
import { loadVocabulary } from "./AsyncActions";
import Utils from "../util/Utils";
import JsonLdUtils from "../util/JsonLdUtils";
import RdfsResource, {
  CONTEXT as RDFS_RESOURCE_CONTEXT,
  RdfsResourceData,
} from "../model/RdfsResource";

export function importIntoExistingVocabulary(
  vocabularyIri: IRI,
  data: File,
  translationsOnly: boolean = false
) {
  const action = { type: ActionType.IMPORT_VOCABULARY };
  const formData = new FormData();
  formData.append("file", data, "thesaurus");
  formData.append("namespace", vocabularyIri.namespace!);
  if (translationsOnly) {
    formData.append("translationsOnly", true.toString());
  }
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.post(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/import`,
      contentType(Constants.MULTIPART_FORM_DATA).formData(formData)
    )
      .then(() => processSuccess(dispatch, action, data))
      .then(() => dispatch(loadVocabulary(vocabularyIri)))
      .catch(processError(dispatch, action));
  };
}
export function getAvailableVocabularies() {
  const action = { type: ActionType.GET_AVAILABLE_VOCABULARIES };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(`${Constants.API_PREFIX}/vocabularies/imports/available`)
      .then((data: object[]) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<RdfsResourceData>(
          data,
          RDFS_RESOURCE_CONTEXT
        )
      )
      .then((data: RdfsResourceData[]) => data.map((d) => new RdfsResource(d)))
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function importSkosAsNewVocabulary(data: File, rename: Boolean) {
  const action = { type: ActionType.IMPORT_VOCABULARY };
  const formData = new FormData();
  formData.append("file", data, "thesaurus");
  formData.append("rename", rename.toString());
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.post(
      `${Constants.API_PREFIX}/vocabularies/import`,
      contentType(Constants.MULTIPART_FORM_DATA).formData(formData)
    )
      .then((response) => {
        processSuccess(dispatch, action, data);
        return response.headers[Constants.Headers.LOCATION];
      })
      .catch((error) => {
        processError(dispatch, action)(error);
        return undefined;
      });
  };
}

const processSuccess = (
  dispatch: ThunkDispatch,
  action: Action,
  data: File
) => {
  dispatch(asyncActionSuccess(action));
  return dispatch(
    SyncActions.publishMessage(
      new Message(
        {
          messageId: "vocabulary.import.success",
          values: { fileName: data.name },
        },
        MessageType.SUCCESS
      )
    )
  );
};

const processError =
  (dispatch: ThunkDispatch, action: Action) => (error: ErrorData) => {
    dispatch(asyncActionFailure(action, error));
    return dispatch(
      SyncActions.publishMessage(new Message(error, MessageType.ERROR))
    );
  };

export function downloadExcelTemplate(translationsOnly: boolean = false) {
  return (dispatch: ThunkDispatch) => {
    const action = { type: ActionType.LOAD_EXCEL_TEMPLATE };
    dispatch(asyncActionRequest(action, true));
    return Ajax.getRaw(
      `${Constants.API_PREFIX}/vocabularies/import/template`,
      responseType("arraybuffer").param(
        "translationsOnly",
        translationsOnly.toString()
      )
    )
      .then((response) => {
        Utils.fileDownload(
          response.data,
          "termit-import.xlsx",
          Constants.EXCEL_MIME_TYPE
        );
        dispatch(asyncActionSuccess(action));
      })
      .catch((error) => dispatch(asyncActionFailure(action, error)));
  };
}
