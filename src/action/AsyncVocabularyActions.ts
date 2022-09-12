import { GetStoreState, ThunkDispatch } from "../util/Types";
import * as SyncActions from "./SyncActions";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
  publishMessage,
  publishNotification,
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
import JsonLdUtils from "../util/JsonLdUtils";
import AggregatedChangeInfo, {
  AggregatedChangeInfoData,
  CONTEXT as CHANGE_INFO_CONTEXT,
} from "../model/changetracking/AggregatedChangeInfo";
import { getApiPrefix } from "./ActionUtils";
import SnapshotData, { CONTEXT as SNAPSHOT_CONTEXT } from "../model/Snapshot";
import NotificationType from "../model/NotificationType";

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

/**
 * Loads aggregated information about changes to terms in a vocabulary with the specified identifier.
 *
 * @param vocabularyIri Vocabulary identifier
 */
export function loadVocabularyContentChanges(vocabularyIri: IRI) {
  const action = {
    type: ActionType.LOAD_VOCABULARY_CONTENT_HISTORY,
    ignoreLoading: true,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/history-of-content`,
      param("namespace", vocabularyIri.namespace)
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<AggregatedChangeInfoData>(
          data,
          CHANGE_INFO_CONTEXT
        )
      )
      .then((data: AggregatedChangeInfoData[]) => {
        dispatch(asyncActionSuccess(action));
        return data.map((d) => new AggregatedChangeInfo(d));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function loadRelatedVocabularies(vocabularyIri: IRI) {
  const action = { type: ActionType.LOAD_RELATED_VOCABULARIES, vocabularyIri };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/related`,
      param("namespace", vocabularyIri.namespace)
    )
      .then((data: string[]) => {
        dispatch(asyncActionSuccess(action));
        return data;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function createVocabularySnapshot(vocabularyIri: IRI) {
  const action = {
    type: ActionType.CREATE_VOCABULARY_SNAPSHOT,
    vocabularyIri,
    ignoreLoading: true,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.post(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/versions`,
      param("namespace", vocabularyIri.namespace)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        dispatch(
          publishNotification({
            source: { type: NotificationType.SNAPSHOT_COUNT_CHANGED },
          })
        );
        return dispatch(
          publishMessage(
            new Message(
              {
                messageId: "vocabulary.snapshot.create.success",
              },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function loadVocabularySnapshots(vocabularyIri: IRI) {
  const action = { type: ActionType.LOAD_SNAPSHOTS, vocabularyIri };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    if (
      vocabularyIri.namespace + vocabularyIri.fragment ===
      Constants.EMPTY_ASSET_IRI
    ) {
      return Promise.resolve([]);
    }
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${getApiPrefix(getState())}/vocabularies/${
        vocabularyIri.fragment
      }/versions`,
      param("namespace", vocabularyIri.namespace)
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<SnapshotData>(
          data,
          SNAPSHOT_CONTEXT
        )
      )
      .then((snapshots: SnapshotData[]) => {
        dispatch(asyncActionSuccess(action));
        return snapshots;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}
