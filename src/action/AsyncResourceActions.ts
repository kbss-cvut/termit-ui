import { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { PageRequest, ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
  publishMessage,
} from "./SyncActions";
import Ajax, { param } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import File, { FileData } from "../model/File";
import { CONTEXT as DOCUMENT_CONTEXT } from "../model/Document";
import { ErrorData } from "../model/ErrorInfo";
import { AxiosResponse } from "axios";
import Utils from "../util/Utils";
import FileBackupDto, {
  CONTEXT as FILE_BACKUP_CONTEXT,
} from "../model/FileBackupDto";
import Message from "../model/Message";
import MessageType from "../model/MessageType";

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

export function loadFileBackupsCount(fileIri: IRI) {
  const action = {
    type: ActionType.LOAD_FILE_BACKUPS_COUNT,
  };
  return (dispatch: ThunkDispatch): Promise<number> => {
    return Ajax.head(
      `${Constants.API_PREFIX}/resources/${fileIri.fragment}/backups`,
      param("namespace", fileIri.namespace)
    )
      .then((resp: AxiosResponse) => {
        const countHeader = Number.parseInt(
          resp.headers[Constants.Headers.X_TOTAL_COUNT]
        );
        if (!countHeader || Number.isNaN(countHeader)) {
          dispatch(
            asyncActionFailure(action, {
              message: `'${Constants.Headers.X_TOTAL_COUNT}' header missing in server response.`,
            })
          );
          return 0;
        }
        dispatch(asyncActionSuccessWithPayload(action, countHeader));
        return countHeader;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(publishMessage(new Message(error, MessageType.ERROR)));
        return 0;
      });
  };
}

/**
 * Loads all available backups for the specified file.
 * @param fileIri File identifier
 * @param pageRequest pagination
 */
export function loadFileBackups(fileIri: IRI, pageRequest: PageRequest) {
  const action = {
    type: ActionType.LOAD_FILE_BACKUPS,
  };
  return (dispatch: ThunkDispatch): Promise<FileBackupDto[] | null> => {
    dispatch(asyncActionRequest(action));
    const params = param("namespace", fileIri.namespace)
      .param("page", pageRequest.page.toString())
      .param("pageSize", pageRequest.size.toString());

    return Ajax.get(
      `${Constants.API_PREFIX}/resources/${fileIri.fragment}/backups`,
      params
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<FileBackupDto>(
          data,
          FILE_BACKUP_CONTEXT
        )
      )
      .then((data: FileBackupDto[]) => {
        dispatch(asyncActionSuccess(action));
        return data;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(publishMessage(new Message(error, MessageType.ERROR)));
        return null;
      });
  };
}

export function restoreFileBackup(fileIri: IRI, backupDto: FileBackupDto) {
  const action = {
    type: ActionType.RESTORE_FILE_BACKUP,
  };
  return (dispatch: ThunkDispatch): Promise<void> => {
    dispatch(asyncActionRequest(action));
    const params = param("namespace", fileIri.namespace).param(
      "backupTimestamp",
      backupDto.timestamp
    );
    return Ajax.post(
      `${Constants.API_PREFIX}/resources/${fileIri.fragment}/backups/restore`,
      params
    )
      .then((res) => {
        if (res.status === 202) {
          dispatch(asyncActionSuccess(action));
          dispatch(
            publishMessage(
              new Message(
                { messageId: "resource.file.backup.restore.success" },
                MessageType.SUCCESS
              )
            )
          );
        } else {
          dispatch(
            asyncActionFailure(action, {
              message: `Failed to restore backup: ${res.data}`,
              status: res.status,
            })
          );
          dispatch(
            publishMessage(
              new Message(
                { messageId: "resource.file.backup.restore.failure" },
                MessageType.ERROR
              )
            )
          );
        }
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(
          publishMessage(
            new Message(
              { messageId: "resource.file.backup.restore.failure" },
              MessageType.ERROR
            )
          )
        );
      });
  };
}
