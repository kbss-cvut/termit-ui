import { GetStoreState, PageRequest, ThunkDispatch } from "../util/Types";
import * as SyncActions from "./SyncActions";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
  publishMessage,
  publishNotification,
} from "./SyncActions";
import { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import Ajax, { param } from "../util/Ajax";
import Constants from "../util/Constants";
import { ErrorData } from "../model/ErrorInfo";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
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
import ExportConfig from "../model/local/ExportConfig";
import RDFStatement, { RDFSTATEMENT_CONTEXT } from "../model/RDFStatement";
import ChangeRecord, {
  CONTEXT as CHANGE_RECORD_CONTEXT,
} from "../model/changetracking/ChangeRecord";
import AssetFactory from "../util/AssetFactory";

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

export function exportGlossary(vocabularyIri: IRI, config: ExportConfig) {
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
      param("namespace", vocabularyIri.namespace)
        .param("exportType", config.type)
        .param("property", config.referenceProperties)
        .accept(config.format.mimeType)
        .responseType("arraybuffer")
    )
      .then((resp: AxiosResponse) => {
        const disposition = resp.headers[Constants.Headers.CONTENT_DISPOSITION];
        const filenameMatch = disposition
          ? disposition.match(/filename="(.+\..+)"/)
          : null;
        if (filenameMatch) {
          const fileName = filenameMatch[1];
          Utils.fileDownload(resp.data, fileName, config.format.mimeType);
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

export function loadVocabularyContentDetailedChanges(
  vocabularyIri: IRI,
  pageReq: PageRequest
) {
  const action = {
    type: ActionType.LOAD_TERM_HISTORY,
  };

  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/history-of-content/detail`,
      param("namespace", vocabularyIri.namespace)
        .param("page", pageReq.page?.toString())
        .param("size", pageReq.size?.toString())
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<ChangeRecord>(
          data,
          CHANGE_RECORD_CONTEXT
        )
      )
      .then((data: ChangeRecord[]) => {
        dispatch(asyncActionSuccess(action));
        return data.map((r) => AssetFactory.createChangeRecord(r));
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

export function getVocabularyRelations(
  vocabularyIri: IRI,
  abortController: AbortController = new AbortController()
) {
  const action = { type: ActionType.GET_VOCABULARY_RELATIONS };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, false));
    return Ajax.get(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/relations`,
      param("namespace", vocabularyIri.namespace).signal(abortController)
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<RDFStatement>(
          data,
          RDFSTATEMENT_CONTEXT
        )
      )
      .then((statements: RDFStatement[]) => {
        dispatch(asyncActionSuccess(action));
        return statements;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function getVocabularyTermsRelations(
  vocabularyIri: IRI,
  abortController: AbortController = new AbortController()
) {
  const action = { type: ActionType.GET_VOCABULARY_TERMS_RELATIONS };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, false));
    return Ajax.get(
      `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/terms/relations`,
      param("namespace", vocabularyIri.namespace).signal(abortController)
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<RDFStatement>(
          data,
          RDFSTATEMENT_CONTEXT
        )
      )
      .then((statements: RDFStatement[]) => {
        dispatch(asyncActionSuccess(action));
        return statements;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}
