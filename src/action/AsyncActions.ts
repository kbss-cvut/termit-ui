import * as SyncActions from "./SyncActions";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
  publishMessage,
  publishNotification,
} from "./SyncActions";
import Ajax, {
  accept,
  content,
  contentType,
  param,
  params,
} from "../util/Ajax";
import { GetStoreState, TermFetchParams, ThunkDispatch } from "../util/Types";
import Routing from "../util/Routing";
import Constants from "../util/Constants";
import Vocabulary, {
  CONTEXT as VOCABULARY_CONTEXT,
  VocabularyData,
} from "../model/Vocabulary";
import Routes, { Route } from "../util/Routes";
import { ErrorData } from "../model/ErrorInfo";
import { AxiosResponse } from "axios";
import * as jsonld from "jsonld";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import Term, { CONTEXT as TERM_CONTEXT, TermData } from "../model/Term";
import VocabularyUtils, { IRI, IRIImpl } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import Resource, { ResourceData } from "../model/Resource";
import RdfsResource, {
  CONTEXT as RDFS_RESOURCE_CONTEXT,
  RdfsResourceData,
} from "../model/RdfsResource";
import TermItState from "../model/TermItState";
import Utils from "../util/Utils";
import { CONTEXT as DOCUMENT_CONTEXT } from "../model/Document";
import {
  Configuration,
  CONTEXT as CONFIGURATION_CONTEXT,
} from "../model/Configuration";
import TermItFile from "../model/File";
import Asset from "../model/Asset";
import AssetFactory from "../util/AssetFactory";
import JsonLdUtils from "../util/JsonLdUtils";
import { Action } from "redux";
import {
  CONTEXT as TEXT_ANALYSIS_RECORD_CONTEXT,
  TextAnalysisRecord,
  TextAnalysisRecordData,
} from "../model/TextAnalysisRecord";
import {
  ChangeRecordData,
  CONTEXT as CHANGE_RECORD_CONTEXT,
} from "../model/changetracking/ChangeRecord";
import RecentlyModifiedAsset, {
  CONTEXT as RECENTLY_MODIFIED_ASSET_CONTEXT,
  RecentlyModifiedAssetData,
} from "../model/RecentlyModifiedAsset";
import NotificationType from "../model/NotificationType";
import ValidationResult, {
  CONTEXT as VALIDATION_RESULT_CONTEXT,
} from "../model/ValidationResult";
import { ConsolidatedResults } from "../model/ConsolidatedResults";
import UserRole, { UserRoleData } from "../model/UserRole";
import { loadTermCount } from "./AsyncVocabularyActions";
import { getApiPrefix } from "./ActionUtils";

/*
 * Asynchronous actions involve requests to the backend server REST API. As per recommendations in the Redux docs, this consists
 * of several synchronous sub-actions which inform the application of initiation of the request and its result.
 *
 * Some conventions (they are also described in README.md):
 * API guidelines:
 *      _Load_   - use IRI identifiers as parameters (+ normalized name as string if necessary, e.g. when fetching a term).
 *      _Create_ - use the instance to be created as parameter + IRI identifier if additional context is necessary (e.g. when creating a term).
 *      _Update_ - use the instance to be updated as parameter. It should contain all the necessary data.
 *      _Remove_ - use the instance to be removed as parameter.
 *
 * Naming conventions for CRUD operations:
 *      _load${ASSET(S)}_ - loading assets from the server, e.g. `loadVocabulary`
 *      _create${ASSET}_  - creating an asset, e.g. `createVocabulary`
 *      _update${ASSET}_  - updating an asset, e.g. `updateVocabulary`
 *      _remove${ASSET}_  - removing an asset, e.g. `removeVocabulary`
 *
 * TODO Consider splitting this file into multiple, it is becoming too long
 */

export function isActionRequestPending(state: TermItState, action: Action) {
  return state.pendingActions[action.type] !== undefined;
}

export function createVocabulary(vocabulary: Vocabulary) {
  const action = {
    type: ActionType.CREATE_VOCABULARY,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.post(
      Constants.API_PREFIX + "/vocabularies",
      content(vocabulary.toJsonLd())
    )
      .then((resp: AxiosResponse) => {
        dispatch(asyncActionSuccess(action));
        dispatch(loadVocabularies());
        dispatch(
          SyncActions.publishMessage(
            new Message(
              { messageId: "vocabulary.created.message" },
              MessageType.SUCCESS
            )
          )
        );
        return resp.headers[Constants.Headers.LOCATION];
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
        return undefined;
      });
  };
}

export function loadVocabulary(
  iri: IRI,
  withValidation = true,
  timestamp?: string
) {
  const action = {
    type: ActionType.LOAD_VOCABULARY,
  };
  return (dispatch: ThunkDispatch, getState: () => TermItState) => {
    if (isActionRequestPending(getState(), action)) {
      return Promise.resolve({});
    }
    dispatch(asyncActionRequest(action, true));
    const actualIri = Utils.resolveVocabularyIriFromRoute(
      { name: iri.fragment, timestamp },
      iri.namespace ? `namespace=${iri.namespace}` : "",
      getState().configuration
    );
    return Ajax.get(
      `${getApiPrefix(getState())}/vocabularies/${actualIri.fragment}`,
      param("namespace", actualIri.namespace)
    )
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferences<VocabularyData>(
          data,
          VOCABULARY_CONTEXT
        )
      )
      .then((data: VocabularyData) => {
        dispatch(loadImportedVocabulariesIntoState(actualIri));
        if (withValidation) {
          dispatch(validateVocabulary(actualIri));
        }
        dispatch(loadTermCount(actualIri));
        return dispatch(
          asyncActionSuccessWithPayload(action, new Vocabulary(data))
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

function loadImportedVocabulariesIntoState(vocabularyIri: IRI) {
  const action = {
    type: ActionType.LOAD_VOCABULARY_IMPORTS,
  };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${getApiPrefix(getState())}/vocabularies/${
        vocabularyIri.fragment
      }/imports`,
      param("namespace", vocabularyIri.namespace)
    )
      .then((data) => dispatch(asyncActionSuccessWithPayload(action, data)))
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

/**
 * Loads vocabularies imported (directly or transitively) by the vocabulary with the specified IRI.
 */
export function loadImportedVocabularies(vocabularyIri: IRI) {
  const action = {
    type: ActionType.LOAD_VOCABULARY_IMPORTS,
  };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    if (isActionRequestPending(getState(), action)) {
      return Promise.resolve([]);
    }
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      Constants.API_PREFIX +
        "/vocabularies/" +
        vocabularyIri.fragment +
        "/imports",
      param("namespace", vocabularyIri.namespace)
    )
      .then((data) => {
        dispatch(asyncActionSuccess(action));
        return data;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
        return [];
      });
  };
}

export function loadResource(iri: IRI) {
  const action = {
    type: ActionType.LOAD_RESOURCE,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.get(
      Constants.API_PREFIX + "/resources/" + iri.fragment,
      param("namespace", iri.namespace)
    )
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferences<ResourceData>(
          data,
          DOCUMENT_CONTEXT
        )
      )
      .then((data: ResourceData) => {
        const resource = AssetFactory.createResource(data);
        dispatch(asyncActionSuccessWithPayload(action, resource));
        return resource;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
        return null;
      });
  };
}

export function createFileInDocument(file: TermItFile, documentIri: IRI) {
  const action = {
    type: ActionType.CREATE_RESOURCE,
  };
  return (dispatch: ThunkDispatch) =>
    Ajax.post(
      `${Constants.API_PREFIX}/identifiers`,
      params({
        name: file.label,
        contextIri: documentIri,
        assetType: "FILE",
      })
    ).then((response) => {
      dispatch(asyncActionRequest(action));
      file.iri = response.data;
      return Ajax.post(
        `${Constants.API_PREFIX}/resources/${documentIri.fragment}/files`,
        content(file.toJsonLd()).param("namespace", documentIri.namespace)
      )
        .then((resp: AxiosResponse) => {
          dispatch(asyncActionSuccess(action));
          dispatch(
            SyncActions.publishMessage(
              new Message(
                { messageId: "resource.created.message" },
                MessageType.SUCCESS
              )
            )
          );
          return resp.headers[Constants.Headers.LOCATION];
        })
        .catch((error: ErrorData) => {
          dispatch(asyncActionFailure(action, error));
          dispatch(
            SyncActions.publishMessage(new Message(error, MessageType.ERROR))
          );
          return undefined;
        });
    });
}

export function removeFileFromDocument(file: TermItFile, documentIri: IRI) {
  const action = {
    type: ActionType.REMOVE_RESOURCE,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const fileIri = VocabularyUtils.create(file.iri);
    return Ajax.delete(
      Constants.API_PREFIX +
        "/resources/" +
        documentIri.fragment +
        "/files/" +
        fileIri.fragment,
      param("namespace", fileIri.namespace)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        dispatch(loadResource(documentIri));
        dispatch(
          SyncActions.publishMessage(
            new Message(
              { messageId: "resource.removed.message" },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function uploadFileContent(fileIri: IRI, data: File) {
  const action = {
    type: ActionType.SAVE_FILE_CONTENT,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return uploadFile(fileIri, data)
      .then(() => {
        dispatch(asyncActionSuccess(action));
        return dispatch(
          SyncActions.publishMessage(
            new Message(
              {
                messageId: "file.content.upload.success",
                values: { fileName: data.name },
              },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

function uploadFile(fileIri: IRI, data: Blob) {
  const formData = new FormData();
  formData.append("file", data, fileIri.fragment);
  return Ajax.put(
    Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content",
    contentType(Constants.MULTIPART_FORM_DATA)
      .formData(formData)
      .param("namespace", fileIri.namespace)
  );
}

export function removeVocabulary(vocabulary: Vocabulary) {
  const iri = VocabularyUtils.create(vocabulary.iri);
  return removeAsset(
    iri,
    iri.namespace,
    ActionType.REMOVE_VOCABULARY,
    "vocabularies",
    loadVocabularies,
    "vocabulary.removed.message",
    Routes.vocabularies
  );
}

export function removeTerm(term: Term) {
  const vocabularyIri = VocabularyUtils.create(term.vocabulary?.iri!);
  return removeAsset(
    VocabularyUtils.create(term.iri),
    vocabularyIri.namespace,
    ActionType.REMOVE_VOCABULARY_TERM,
    "vocabularies/" + vocabularyIri.fragment + "/terms",
    () => loadVocabulary(vocabularyIri),
    "term.removed.message",
    Routes.vocabularySummary,
    {
      params: new Map([["name", vocabularyIri.fragment]]),
      query: vocabularyIri.namespace
        ? new Map([["namespace", vocabularyIri.namespace]])
        : undefined,
    }
  );
}

export function removeAsset(
  iri: IRI,
  namespace: string | undefined,
  type: string,
  assetPathFragment: string,
  load: () => (dispatch: ThunkDispatch, getState: GetStoreState) => Promise<{}>,
  messageId: string,
  transitionRoute: Route,
  options?: {}
) {
  const action = { type };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.delete(
      Constants.API_PREFIX + "/" + assetPathFragment + "/" + iri.fragment,
      param("namespace", namespace)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        dispatch(load());
        Routing.transitionTo(transitionRoute, options);
        return dispatch(
          SyncActions.publishMessage(
            new Message({ messageId }, MessageType.SUCCESS)
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function loadVocabularies() {
  const action = {
    type: ActionType.LOAD_VOCABULARIES,
  };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    if (isActionRequestPending(getState(), action)) {
      return Promise.resolve({});
    }
    dispatch(asyncActionRequest(action));
    return Ajax.get(`${getApiPrefix(getState())}/vocabularies`)
      .then((data: object[]) =>
        data.length !== 0
          ? JsonLdUtils.compactAndResolveReferencesAsArray<VocabularyData>(
              data,
              VOCABULARY_CONTEXT
            )
          : []
      )
      .then((data: VocabularyData[]) =>
        dispatch(
          asyncActionSuccessWithPayload(
            action,
            data.map((v) => new Vocabulary(v))
          )
        )
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function loadAllTerms(
  fetchOptions: TermFetchParams<any>,
  namespace?: string
) {
  return genericLoadTerms(
    ActionType.FETCH_ALL_TERMS,
    "",
    {
      searchString: fetchOptions.searchString,
      includeTerms: fetchOptions.includeTerms,
      namespace,
    },
    fetchOptions
  );
}

export function loadTerms(
  fetchOptions: TermFetchParams<any>,
  vocabularyIri: IRI
) {
  return genericLoadTerms(
    ActionType.FETCH_VOCABULARY_TERMS,
    `/vocabularies/${vocabularyIri.fragment}`,
    {
      searchString: fetchOptions.searchString,
      includeImported: fetchOptions.includeImported,
      includeTerms: fetchOptions.includeTerms,
      namespace: vocabularyIri.namespace,
    },
    fetchOptions
  );
}

export function genericLoadTerms(
  type: string,
  prefix: string,
  target: any,
  fetchOptions: TermFetchParams<any>
) {
  const action = { type };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    dispatch(asyncActionRequest(action, true));
    let url = `${getApiPrefix(getState())}${prefix}/terms/`;
    if (fetchOptions.optionID) {
      const parentIri = VocabularyUtils.create(fetchOptions.optionID);
      url = `${getApiPrefix(getState())}/terms/${parentIri.fragment}/subterms`;
      target.namespace = parentIri.namespace;
    } else if (!fetchOptions.searchString) {
      url += "roots";
    }
    return Ajax.get(
      url,
      params(
        Object.assign(
          target,
          Utils.createPagingParams(fetchOptions.offset, fetchOptions.limit)
        )
      )
    )
      .then((data: object[]) =>
        data.length !== 0
          ? JsonLdUtils.compactAndResolveReferencesAsArray<TermData>(
              data,
              TERM_CONTEXT
            )
          : []
      )
      .then((data: TermData[]) => {
        dispatch(asyncActionSuccess(action));
        return data.map((d) => new Term(d));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function loadTermByIri(termIri: IRI) {
  const action = {
    type: ActionType.LOAD_TERM_BY_IRI,
  };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${getApiPrefix(getState())}/terms/${termIri.fragment}`,
      param("namespace", termIri.namespace)
    )
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferences<TermData>(data, TERM_CONTEXT)
      )
      .then((data: TermData) => {
        dispatch(asyncActionSuccess(action));
        return new Term(data);
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return null;
      });
  };
}

export function validateVocabulary(
  vocabularyIri: IRI,
  apiPrefix: string = Constants.API_PREFIX
) {
  const action = {
    type: ActionType.FETCH_VALIDATION_RESULTS,
  };

  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    if (isActionRequestPending(getState(), action)) {
      return Promise.resolve([]);
    }

    dispatch(asyncActionRequest(action));
    return Ajax.get(
      `${apiPrefix}/vocabularies/${vocabularyIri.fragment}/validate`,
      param("namespace", vocabularyIri.namespace)
    )
      .then((data: object[]) =>
        data.length !== 0
          ? JsonLdUtils.compactAndResolveReferencesAsArray<ValidationResult>(
              data,
              VALIDATION_RESULT_CONTEXT
            )
          : []
      )
      .then((data: ValidationResult[]) => consolidateResults(data))
      .then((data: ConsolidatedResults) =>
        dispatch(
          asyncActionSuccessWithPayload(action, {
            [IRIImpl.toString(vocabularyIri)]: data,
          })
        )
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

function consolidateResults(validationResults: ValidationResult[]) {
  const consolidatedResults = {};
  validationResults.forEach((r) => {
    consolidatedResults![r.term.iri!] = consolidatedResults![r.term.iri!] || [];
    consolidatedResults![r.term.iri!].push(r);
  });
  return consolidatedResults;
}

export function executeQuery(queryString: string) {
  const action = {
    type: ActionType.EXECUTE_QUERY,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      Constants.API_PREFIX + "/query",
      params({ query: queryString })
    )
      .then((data: object) => jsonld.expand(data))
      .then((data: object) =>
        dispatch(SyncActions.executeQuerySuccess(queryString, data))
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function loadTypes() {
  const action = {
    type: ActionType.LOAD_TYPES,
  };
  return (dispatch: ThunkDispatch, getState: GetStoreState): Promise<any> => {
    if (Object.getOwnPropertyNames(getState().types).length > 0) {
      // No need to load types if they are already loaded
      return Promise.resolve([]);
    }
    dispatch(asyncActionRequest(action));
    return Ajax.get(Constants.API_PREFIX + "/language/types")
      .then((data: object[]) =>
        data.length !== 0
          ? JsonLdUtils.compactAndResolveReferencesAsArray<TermData>(
              data,
              TERM_CONTEXT
            )
          : []
      )
      .then((data: TermData[]) => {
        return data.map((term: TermData) => {
          if (term.subTerms) {
            // @ts-ignore
            term.subTerms = Utils.sanitizeArray(term.subTerms).map(
              (subTerm) => subTerm.iri
            );
          }
          return new Term(term);
        });
      })
      .then((result: Term[]) =>
        dispatch(asyncActionSuccessWithPayload(action, result))
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function executeFileTextAnalysis(fileIri: IRI, vocabularyIri: string) {
  const action = {
    type: ActionType.EXECUTE_FILE_TEXT_ANALYSIS,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const reqParams: any = {};
    reqParams.namespace = fileIri.namespace;
    if (vocabularyIri) {
      reqParams.vocabulary = vocabularyIri;
    }
    return Ajax.put(
      Constants.API_PREFIX +
        "/resources/" +
        fileIri.fragment +
        "/text-analysis",
      params(reqParams)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        return dispatch(
          publishMessage(
            new Message(
              {
                messageId: "file.text-analysis.finished.message",
              },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function executeTextAnalysisOnAllTerms(vocabularyIri: IRI) {
  const action = {
    type: ActionType.EXECUTE_TEXT_ANALYSIS_ON_ALL_DEFINITIONS,
  };

  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));

    return Ajax.put(
      Constants.API_PREFIX +
        "/vocabularies/" +
        vocabularyIri.fragment +
        "/terms/text-analysis",
      params({ namespace: vocabularyIri.namespace })
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        return dispatch(
          publishMessage(
            new Message(
              {
                messageId: "vocabulary.text-analysis.finished.message",
              },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function executeTextAnalysisOnAllVocabularies() {
  const action = {
    type: ActionType.EXECUTE_TEXT_ANALYSIS_ON_ALL_VOCABULARIES,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.get(Constants.API_PREFIX + "/vocabularies/text-analysis")
      .then(() => {
        dispatch(asyncActionSuccess(action));
        return dispatch(
          publishMessage(
            new Message(
              {
                messageId: "vocabulary.all.text-analysis.invoke.message",
              },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function loadFileContent(fileIri: IRI) {
  const action = {
    type: ActionType.LOAD_FILE_CONTENT,
  };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    if (isActionRequestPending(getState(), action)) {
      return Promise.resolve({});
    }
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content",
      param("namespace", fileIri.namespace)
    )
      .then((data: object) => data.toString())
      .then((data: string) =>
        dispatch(asyncActionSuccessWithPayload(action, data))
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function hasFileContent(fileIri: IRI) {
  const action = { type: ActionType.HAS_FILE_CONTENT };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.head(
      Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content",
      param("namespace", fileIri.namespace)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        return true;
      })
      .catch(() => {
        // No problem here, 404 is the most likely reason
        dispatch(asyncActionSuccess(action));
        return false;
      });
  };
}

export function saveFileContent(fileIri: IRI, fileContent: string) {
  const action = {
    type: ActionType.SAVE_FILE_CONTENT,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const fileBlob = new Blob([fileContent], { type: "text/html" });
    return uploadFile(fileIri, fileBlob)
      .then(() => {
        dispatch(asyncActionSuccess(action));
        return dispatch(loadFileContent(fileIri));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function updateTerm(term: Term) {
  const action = {
    type: ActionType.UPDATE_TERM,
  };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    dispatch(asyncActionRequest(action));
    const termIri = VocabularyUtils.create(term.iri);
    const vocabularyIri = VocabularyUtils.create(term.vocabulary!.iri!);
    const reqUrl =
      Constants.API_PREFIX +
      "/vocabularies/" +
      vocabularyIri.fragment +
      "/terms/" +
      termIri.fragment;
    // Vocabulary namespace defines also term namespace
    return Ajax.put(
      reqUrl,
      content(term.toJsonLd()).params({
        namespace: vocabularyIri.namespace,
      })
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        dispatch(
          publishNotification({
            source: { type: NotificationType.ASSET_UPDATED },
            original: getState().selectedTerm,
            updated: term,
          })
        );
        dispatch(validateVocabulary(vocabularyIri));
        return dispatch(
          publishMessage(
            new Message(
              { messageId: "term.updated.message" },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function updateResource(res: Resource) {
  const action = {
    type: ActionType.UPDATE_RESOURCE,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const resourceIri = VocabularyUtils.create(res.iri);
    return Ajax.put(
      Constants.API_PREFIX + "/resources/" + resourceIri.fragment,
      content(res.toJsonLd()).params({ namespace: resourceIri.namespace })
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .then(() => {
        dispatch(
          publishMessage(
            new Message(
              { messageId: "resource.updated.message" },
              MessageType.SUCCESS
            )
          )
        );
        return dispatch(loadResource(resourceIri));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
        return null;
      });
  };
}

export function updateVocabulary(vocabulary: Vocabulary) {
  const action = {
    type: ActionType.UPDATE_VOCABULARY,
  };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    dispatch(asyncActionRequest(action, true));
    const vocabularyIri = VocabularyUtils.create(vocabulary.iri);
    const reqUrl =
      Constants.API_PREFIX + "/vocabularies/" + vocabularyIri.fragment;
    return Ajax.put(
      reqUrl,
      content(vocabulary.toJsonLd()).params({
        namespace: vocabularyIri.namespace,
      })
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        dispatch(
          publishNotification({
            source: { type: NotificationType.ASSET_UPDATED },
            original: getState().vocabulary,
            updated: vocabulary,
          })
        );
        dispatch(loadVocabulary(vocabularyIri));
        return dispatch(
          publishMessage(
            new Message(
              { messageId: "vocabulary.updated.message" },
              MessageType.SUCCESS
            )
          )
        );
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

/**
 * Fetches RDFS:label of a resource with the specified identifier.
 * @param iri Resource identifier
 */
export function getLabel(iri: string) {
  return getTextualField(iri, "label", ActionType.GET_LABEL);
}

function getTextualField(iri: string, field: string, actionType: string) {
  const action = {
    type: actionType,
  };
  return (dispatch: ThunkDispatch, getState: () => TermItState) => {
    if (field === "label" && getState().labelCache[iri]) {
      return Promise.resolve(getState().labelCache[iri]);
    }
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(Constants.API_PREFIX + "/data/" + field, param("iri", iri))
      .then((data) => {
        const payload = {};
        payload[iri] = data;
        dispatch(asyncActionSuccessWithPayload(action, payload));
        return data;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return undefined;
      });
  };
}

/**
 * Fetches RDFS:resource with the specified identifier.
 * @param iri Resource identifier
 */
export function getRdfsResource(iri: IRI) {
  const action = {
    type: ActionType.GET_RESOURCE,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      Constants.API_PREFIX + "/data/resource",
      param("iri", iri.toString())
    )
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferences<RdfsResource>(
          data,
          RDFS_RESOURCE_CONTEXT
        )
      )
      .then((data: RdfsResource) => {
        const res = new RdfsResource(data);
        dispatch(asyncActionSuccessWithPayload(action, res));
        return res;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return undefined;
      });
  };
}

/**
 * Fetches properties existing in the server repository.
 */
export function getProperties() {
  const action = {
    type: ActionType.GET_PROPERTIES,
  };
  return (dispatch: ThunkDispatch, getState: () => TermItState) => {
    if (getState().properties.length > 0) {
      return;
    }
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(Constants.API_PREFIX + "/data/properties")
      .then((data: object[]) =>
        data.length > 0
          ? JsonLdUtils.compactAndResolveReferencesAsArray<RdfsResourceData>(
              data,
              RDFS_RESOURCE_CONTEXT
            )
          : []
      )
      .then((data: RdfsResourceData[]) =>
        dispatch(
          asyncActionSuccessWithPayload(
            action,
            data.map((d) => new RdfsResource(d))
          )
        )
      )
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function createProperty(property: RdfsResource) {
  const action = {
    type: ActionType.CREATE_PROPERTY,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.post(
      Constants.API_PREFIX + "/data/properties",
      content(property.toJsonLd())
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function loadLastEditedAssets() {
  return loadPredefinedAssetList(ActionType.LOAD_LAST_EDITED, false);
}

export function loadMyAssets() {
  return loadPredefinedAssetList(ActionType.LOAD_MY, true);
}

function loadPredefinedAssetList(at: string, forCurrentUserOnly: boolean) {
  const action = {
    type: at,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    let config = param("limit", "5");
    if (forCurrentUserOnly) {
      config = config.param("forCurrentUserOnly", "true");
    }
    return Ajax.get(Constants.API_PREFIX + "/assets/last-edited", config)
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<RecentlyModifiedAssetData>(
          data,
          RECENTLY_MODIFIED_ASSET_CONTEXT
        )
      )
      .then((data: RecentlyModifiedAssetData[]) => {
        dispatch(asyncActionSuccess(action));
        return data.map((item) => new RecentlyModifiedAsset(item));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function loadLatestTextAnalysisRecord(resourceIri: IRI) {
  const action = {
    type: ActionType.LOAD_LATEST_TEXT_ANALYSIS_RECORD,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.get(
      Constants.API_PREFIX +
        "/resources/" +
        resourceIri.fragment +
        "/text-analysis/records/latest",
      param("namespace", resourceIri.namespace)
    )
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferences<TextAnalysisRecordData>(
          data,
          TEXT_ANALYSIS_RECORD_CONTEXT
        )
      )
      .then((data: TextAnalysisRecordData) => {
        dispatch(asyncActionSuccess(action));
        return new TextAnalysisRecord(data);
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return null;
      });
  };
}

export function exportFileContent(fileIri: IRI) {
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

export function loadUnusedTermsForVocabulary(iri: IRI) {
  const action = {
    type: ActionType.FETCH_UNUSED_TERMS_FOR_VOCABULARY,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.get(
      Constants.API_PREFIX + "/vocabularies/" + iri.fragment + "/unused-terms",
      param("namespace", iri.namespace)
    )
      .then((terms: string[]) => {
        dispatch(asyncActionSuccess(action));
        return terms;
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function loadHistory(asset: Asset) {
  const assetIri = VocabularyUtils.create(asset.iri);
  const historyConf = resolveHistoryLoadingParams(asset, assetIri);
  const action = { type: historyConf.actionType };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(historyConf.url, param("namespace", assetIri.namespace))
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<ChangeRecordData>(
          data,
          CHANGE_RECORD_CONTEXT
        )
      )
      .then((data: ChangeRecordData[]) => {
        dispatch(asyncActionSuccess(action));
        return data.map((d) => AssetFactory.createChangeRecord(d));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

function resolveHistoryLoadingParams(asset: Asset, assetIri: IRI) {
  const types = Utils.sanitizeArray(asset.types);
  if (types.indexOf(VocabularyUtils.TERM) !== -1) {
    return {
      actionType: ActionType.LOAD_TERM_HISTORY,
      url: `${Constants.API_PREFIX}/terms/${assetIri.fragment}/history`,
    };
  } else if (types.indexOf(VocabularyUtils.VOCABULARY) !== -1) {
    return {
      actionType: ActionType.LOAD_VOCABULARY_HISTORY,
      url: `${Constants.API_PREFIX}/vocabularies/${assetIri.fragment}/history`,
    };
  }
  throw new TypeError("Asset " + asset + "does not support history.");
}

/**
 * Fetches content type for file with given IRI
 * @param fileIri Resource identifier
 * @return MIME type
 */
export function getContentType(fileIri: IRI) {
  const action = { type: ActionType.GET_FILE_CONTENT_TYPE };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.head(
      Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content",
      param("namespace", fileIri.namespace)
    )
      .then((resp: AxiosResponse) => {
        dispatch(asyncActionSuccess(action));
        const s = resp.headers[Constants.Headers.CONTENT_TYPE];
        return s ? s : null;
      })
      .catch(() => {
        // No problem here, 404 is the most likely reason
        dispatch(asyncActionSuccess(action));
        return null;
      });
  };
}

export function invalidateCaches() {
  const action = { type: ActionType.INVALIDATE_CACHES };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    return Ajax.delete(`${Constants.API_PREFIX}/admin/cache`)
      .then(() => dispatch(asyncActionSuccess(action)))
      .then(() =>
        dispatch(
          publishMessage(
            new Message(
              {
                messageId:
                  "administration.maintenance.invalidateCaches.success",
              },
              MessageType.SUCCESS
            )
          )
        )
      )
      .catch((error) => dispatch(asyncActionFailure(action, error)));
  };
}

export function loadConfiguration() {
  const action = { type: ActionType.LOAD_CONFIGURATION };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${Constants.API_PREFIX}/configuration`,
      accept(Constants.JSON_LD_MIME_TYPE)
    )
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferences<Configuration>(
          data,
          CONFIGURATION_CONTEXT
        )
      )
      .then((data: Configuration) => {
        data.roles = Utils.sanitizeArray(data.roles).map(
          (d: UserRoleData) => new UserRole(d)
        );
        return dispatch(asyncActionSuccessWithPayload(action, data));
      })
      .catch((error) => dispatch(asyncActionFailure(action, error)));
  };
}

export function loadNews(language: string) {
  const action = { type: ActionType.LOAD_NEWS };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(Constants.NEWS_MD_URL[language])
      .then((data: string) => {
        dispatch(asyncActionSuccess(action));
        return data;
      })
      .catch((error) => {
        dispatch(asyncActionFailure(action, error));
        return null;
      });
  };
}

export function removeSnapshot(snapshotIri: IRI) {
  const action = { type: ActionType.REMOVE_SNAPSHOT, snapshotIri };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.delete(
      `${Constants.API_PREFIX}/snapshots/${snapshotIri.fragment}`,
      param("namespace", snapshotIri.namespace)
    )
      .then(() => {
        dispatch(asyncActionSuccess(action));
        dispatch(
          publishMessage(
            new Message(
              { messageId: "snapshot.removed.message" },
              MessageType.SUCCESS
            )
          )
        );
        return dispatch(
          publishNotification({
            source: { type: NotificationType.SNAPSHOT_COUNT_CHANGED },
          })
        );
      })
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}
