import * as SyncActions from "./SyncActions";
import {
    asyncActionFailure,
    asyncActionRequest,
    asyncActionSuccess,
    asyncActionSuccessWithPayload,
    publishMessage,
    publishNotification
} from "./SyncActions";
import Ajax, {content, contentType, param, params} from "../util/Ajax";
import {GetStoreState, ThunkDispatch} from "../util/Types";
import Routing from "../util/Routing";
import Constants from "../util/Constants";
import Vocabulary, {CONTEXT as VOCABULARY_CONTEXT, VocabularyData} from "../model/Vocabulary";
import Routes, {Route} from "../util/Routes";
import {ErrorData} from "../model/ErrorInfo";
import {AxiosResponse} from "axios";
import * as jsonld from "jsonld";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import Term, {CONTEXT as TERM_CONTEXT, TermData} from "../model/Term";
import FetchOptionsFunction from "../model/Functions";
import VocabularyUtils, {IRI} from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import Resource, {ResourceData} from "../model/Resource";
import RdfsResource, {CONTEXT as RDFS_RESOURCE_CONTEXT, RdfsResourceData} from "../model/RdfsResource";
import {CONTEXT as TERM_ASSIGNMENTS_CONTEXT, TermAssignments} from "../model/TermAssignments";
import TermItState from "../model/TermItState";
import Utils from "../util/Utils";
import ExportType from "../util/ExportType";
import {CONTEXT as DOCUMENT_CONTEXT} from "../model/Document";
import TermitFile from "../model/File";
import Asset from "../model/Asset";
import AssetFactory from "../util/AssetFactory";
import IdentifierResolver from "../util/IdentifierResolver";
import JsonLdUtils from "../util/JsonLdUtils";
import {Action} from "redux";
import {
    CONTEXT as TEXT_ANALYSIS_RECORD_CONTEXT,
    TextAnalysisRecord,
    TextAnalysisRecordData
} from "../model/TextAnalysisRecord";
import {CONTEXT as RESOURCE_TERM_ASSIGNMENTS_CONTEXT, ResourceTermAssignments} from "../model/ResourceTermAssignments";
import {ChangeRecordData, CONTEXT as CHANGE_RECORD_CONTEXT} from "../model/changetracking/ChangeRecord";
import RecentlyModifiedAsset, {
    CONTEXT as RECENTLY_MODIFIED_ASSET_CONTEXT,
    RecentlyModifiedAssetData
} from "../model/RecentlyModifiedAsset";
import TermOccurrence from "../model/TermOccurrence";
import SearchResult, {CONTEXT as SEARCH_RESULT_CONTEXT, SearchResultData} from "../model/SearchResult";
import {getShortLocale} from "../util/IntlUtil";
import NotificationType from "../model/NotificationType";

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

const JOINED_RESOURCE_CONTEXT = Object.assign({}, DOCUMENT_CONTEXT);

export function createVocabulary(vocabulary: Vocabulary) {
    const action = {
        type: ActionType.CREATE_VOCABULARY
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.post(Constants.API_PREFIX + "/vocabularies", content(vocabulary.toJsonLd()))
            .then((resp: AxiosResponse) => {
                dispatch(asyncActionSuccess(action));
                dispatch(loadVocabularies());
                const location = resp.headers[Constants.Headers.LOCATION];
                Routing.transitionTo(Routes.vocabularySummary, IdentifierResolver.routingOptionsFromLocation(location));
                return dispatch(SyncActions.publishMessage(new Message({messageId: "vocabulary.created.message"}, MessageType.SUCCESS)));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
                return undefined;
            });
    };
}

export function createTerm(term: Term, vocabularyIri: IRI) {
    const action = {
        type: ActionType.CREATE_VOCABULARY_TERM
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        const parents = Utils.sanitizeArray(term.parentTerms);
        const vocabularyIriToUse = parents.length > 0 ? VocabularyUtils.create(parents[0].vocabulary!.iri!) : vocabularyIri;
        const url = resolveTermCreationUrl(term, vocabularyIriToUse);
        const data = Object.assign(term.toJsonLd(), {vocabulary: {iri: vocabularyIri.namespace + vocabularyIri.fragment}});
        return Ajax.post(url, content(data).contentType(Constants.JSON_LD_MIME_TYPE).param("namespace", vocabularyIriToUse.namespace))
            .then((resp: AxiosResponse) => {
                const asyncSuccessAction = asyncActionSuccess(action);
                dispatch(asyncSuccessAction);
                dispatch(SyncActions.publishMessage(new Message({messageId: "vocabulary.term.created.message"}, MessageType.SUCCESS)));
                dispatch(publishNotification({source: asyncSuccessAction}));
                return resp.headers[Constants.Headers.LOCATION];
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
                return undefined;
            });
    };
}

function resolveTermCreationUrl(term: Term, targetVocabularyIri: IRI) {
    let url = Constants.API_PREFIX + "/vocabularies/";
    const parents = Utils.sanitizeArray(term.parentTerms);
    if (parents.length > 0) {
        // Assuming there is at most one parent for a newly created term
        url += targetVocabularyIri.fragment + "/terms/" + VocabularyUtils.create(parents[0].iri!).fragment + "/subterms";
    } else {
        url += targetVocabularyIri.fragment + "/terms"
    }
    return url;
}

export function loadVocabulary(iri: IRI, ignoreLoading: boolean = false, apiPrefix: string = Constants.API_PREFIX) {
    const action = {
        type: ActionType.LOAD_VOCABULARY
    };
    return (dispatch: ThunkDispatch, getState: () => TermItState) => {
        if (isActionRequestPending(getState(), action)) {
            return Promise.resolve({});
        }
        dispatch(asyncActionRequest(action, ignoreLoading));
        return Ajax
            .get(`${apiPrefix}/vocabularies/${iri.fragment}`, param("namespace", iri.namespace))
            .then((data: object) => JsonLdUtils.compactAndResolveReferences<VocabularyData>(data, VOCABULARY_CONTEXT))
            .then((data: VocabularyData) => {
                dispatch(loadImportedVocabulariesIntoState(iri, apiPrefix));
                return dispatch(asyncActionSuccessWithPayload(action, new Vocabulary(data)));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

function loadImportedVocabulariesIntoState(vocabularyIri: IRI, apiPrefix: string) {
    const action = {
        type: ActionType.LOAD_VOCABULARY_IMPORTS
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(`${apiPrefix}/vocabularies/${vocabularyIri.fragment}/imports`, param("namespace", vocabularyIri.namespace))
            .then(data => dispatch(asyncActionSuccessWithPayload(action, data)))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    }
}

/**
 * Loads vocabularies imported (directly or transitively) by the vocabulary with the specified IRI.
 */
export function loadImportedVocabularies(vocabularyIri: IRI) {
    const action = {
        type: ActionType.LOAD_VOCABULARY_IMPORTS
    };
    return (dispatch: ThunkDispatch, getState: GetStoreState) => {
        if (isActionRequestPending(getState(), action)) {
            return Promise.resolve([]);
        }
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(Constants.API_PREFIX + "/vocabularies/" + vocabularyIri.fragment + "/imports", param("namespace", vocabularyIri.namespace))
            .then(data => {
                dispatch(asyncActionSuccess(action));
                return data;
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
                return [];
            });
    }
}

export function loadResource(iri: IRI) {
    const action = {
        type: ActionType.LOAD_RESOURCE
    };
    return (dispatch: ThunkDispatch, getState: GetStoreState) => {
        if (isActionRequestPending(getState(), action)) {
            return Promise.resolve({});
        }
        dispatch(asyncActionRequest(action));
        return Ajax
            .get(Constants.API_PREFIX + "/resources/" + iri.fragment, param("namespace", iri.namespace))
            .then((data: object) => JsonLdUtils.compactAndResolveReferences<ResourceData>(data, JOINED_RESOURCE_CONTEXT))
            .then((data: ResourceData) =>
                dispatch(asyncActionSuccessWithPayload(action, AssetFactory.createResource((data)))))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)))
            });
    };
}

export function loadResources() {
    const action = {
        type: ActionType.LOAD_RESOURCES
    };
    return (dispatch: ThunkDispatch, getState: GetStoreState) => {
        if (isActionRequestPending(getState(), action)) {
            return Promise.resolve({});
        }
        dispatch(asyncActionRequest(action));
        return Ajax.get(Constants.API_PREFIX + "/resources")
            .then((data: object[]) =>
                data.length !== 0 ? JsonLdUtils.compactAndResolveReferencesAsArray<ResourceData>(data, JOINED_RESOURCE_CONTEXT) : [])
            .then((data: ResourceData[]) =>
                dispatch(asyncActionSuccessWithPayload(action, data.map(v => AssetFactory.createResource(v)))))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

export function loadResourceTermAssignmentsInfo(resourceIri: IRI) {
    const action = {
        type: ActionType.LOAD_RESOURCE_TERM_ASSIGNMENTS
    };
    return (dispatch: ThunkDispatch, getState: GetStoreState) => {
        if (isActionRequestPending(getState(), action)) {
            return Promise.resolve([]);
        }
        dispatch(asyncActionRequest(action));
        return Ajax.get(Constants.API_PREFIX + "/resources/" + resourceIri.fragment + "/assignments/aggregated", param("namespace", resourceIri.namespace))
            .then((data: object[]) => JsonLdUtils.compactAndResolveReferencesAsArray<ResourceTermAssignments>(data, RESOURCE_TERM_ASSIGNMENTS_CONTEXT))
            .then((data: ResourceTermAssignments[]) => {
                dispatch(asyncActionSuccess(action));
                const assignedTerms = data.filter(a => a.types.indexOf(VocabularyUtils.TERM_OCCURRENCE) === -1).map(a => new Term({
                    iri: a.term.iri,
                    label: a.label,
                    vocabulary: a.vocabulary,
                    draft: a.term.draft
                }));
                if (getState().resource.iri === resourceIri.namespace + resourceIri.fragment) {
                    dispatch(asyncActionSuccessWithPayload({type: ActionType.LOAD_RESOURCE_TERMS}, assignedTerms));
                }
                return data;
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
                return [];
            });
    };
}

export function createResource(resource: Resource) {
    const action = {
        type: ActionType.CREATE_RESOURCE
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.post(Constants.API_PREFIX + "/resources", content(resource.toJsonLd()))
            .then((resp: AxiosResponse) => {
                dispatch(asyncActionSuccess(action));
                dispatch(loadResources());
                dispatch(SyncActions.publishMessage(new Message({messageId: "resource.created.message"}, MessageType.SUCCESS)));
                return resp.headers[Constants.Headers.LOCATION];
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
                return undefined;
            });
    };
}

export function createFileInDocument(file: TermitFile, documentIri: IRI) {
    const action = {
        type: ActionType.CREATE_RESOURCE
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.post(Constants.API_PREFIX + "/resources/" + documentIri.fragment + "/files", content(file.toJsonLd()).param("namespace", documentIri.namespace))
            .then((resp: AxiosResponse) => {
                dispatch(asyncActionSuccess(action));
                dispatch(loadResources());
                dispatch(SyncActions.publishMessage(new Message({messageId: "resource.created.message"}, MessageType.SUCCESS)));
                return resp.headers[Constants.Headers.LOCATION];
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
                return undefined;
            });
    };
}

export function uploadFileContent(fileIri: IRI, data: File) {
    const action = {
        type: ActionType.SAVE_FILE_CONTENT
    };
    const formData = new FormData();
    formData.append("file", data, fileIri.fragment);
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.put(Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content",
            contentType(Constants.MULTIPART_FORM_DATA).formData(formData).param("namespace", fileIri.namespace)
        )
            .then(() => {
                dispatch(asyncActionSuccess(action));
                return dispatch(SyncActions.publishMessage(new Message({
                    messageId: "file.content.upload.success",
                    values: {fileName: data.name}
                }, MessageType.SUCCESS)));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

export function removeResource(resource: Resource) {
    const iri = VocabularyUtils.create(resource.iri)
    return removeAsset(
        iri,
        iri.namespace,
        ActionType.REMOVE_RESOURCE,
        "resources",
        loadResources,
        "resource.removed.message",
        Routes.resources
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
        Routes.vocabularyDetail,
        {
            params: new Map([["name", vocabularyIri.fragment]]),
            query: vocabularyIri.namespace ? new Map([["namespace", vocabularyIri.namespace]]) : undefined
        }
    );
}

export function removeAsset(iri: IRI,
                            namespace: string | undefined,
                            type: string,
                            assetPathFragment: string,
                            load: () => (dispatch: ThunkDispatch, getState: GetStoreState) => Promise<{}>,
                            messageId: string,
                            transitionRoute: Route,
                            options?: {}) {
    const action = {type};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.delete(Constants.API_PREFIX + "/" + assetPathFragment + "/" + iri.fragment,
            param("namespace", namespace)).then(() => {
            dispatch(asyncActionSuccess(action));
            dispatch(load());
            Routing.transitionTo(transitionRoute, options)
            return dispatch(SyncActions.publishMessage(new Message({messageId}, MessageType.SUCCESS)));
        })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    }
}

export function removeOccurrence(occurrence: TermOccurrence) {
    const action = {
        type: ActionType.REMOVE_TERM_OCCURRENCE
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        const OccurrenceIri = VocabularyUtils.create(occurrence.iri!);
        return Ajax.delete(Constants.API_PREFIX + "/occurrence/" + OccurrenceIri.fragment, param("namespace", OccurrenceIri.namespace))
            .then(() => {
                dispatch(asyncActionSuccess(action));
                return dispatch(SyncActions.publishMessage(new Message({messageId: "term.metadata.assignments.occurrence.remove"}, MessageType.SUCCESS)));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    }
}

export function approveOccurrence(occurrence: TermOccurrence) {
    const action = {
        type: ActionType.APPROVE_TERM_OCCURRENCE
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        const OccurrenceIri = VocabularyUtils.create(occurrence.iri!);
        return Ajax.put(Constants.API_PREFIX + "/occurrence/" + OccurrenceIri.fragment, param("namespace", OccurrenceIri.namespace))
            .then(() => {
                dispatch(asyncActionSuccess(action));
                return dispatch(SyncActions.publishMessage(new Message({messageId: "term.metadata.assignments.occurrence.approve"}, MessageType.SUCCESS)));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    }
}

export function loadVocabularies(apiPrefix: string = Constants.API_PREFIX) {
    const action = {
        type: ActionType.LOAD_VOCABULARIES
    };
    return (dispatch: ThunkDispatch, getState: GetStoreState) => {
        if (isActionRequestPending(getState(), action)) {
            return Promise.resolve({});
        }
        dispatch(asyncActionRequest(action));
        return Ajax.get(`${apiPrefix}/vocabularies`)
            .then((data: object[]) =>
                data.length !== 0 ? JsonLdUtils.compactAndResolveReferencesAsArray<VocabularyData>(data, VOCABULARY_CONTEXT) : [])
            .then((data: VocabularyData[]) =>
                dispatch(asyncActionSuccessWithPayload(action, data.map(v => new Vocabulary(v)))))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

export function searchTerms(searchString: string) {
    const action = {
        type: ActionType.FETCH_VOCABULARY_TERMS
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(Constants.API_PREFIX + "/search/fts", params({searchString}))
            .then((data: object[]) =>
                data.length > 0 ? JsonLdUtils.compactAndResolveReferencesAsArray<SearchResultData>(data, SEARCH_RESULT_CONTEXT) : []
            )
            .then((data: SearchResultData[]) => data.map(d => new SearchResult(d)))
            .then((data: SearchResult[]) => {
                dispatch(SyncActions.asyncActionSuccess(action));
                return data
                    .filter(d => d.hasType(VocabularyUtils.TERM))
                    .map(d => new Term({iri: d.iri, label: d.label}))
            })
            .catch((error: ErrorData) => {
                dispatch(SyncActions.asyncActionFailure(action, error));
                return [];
            });
    };
}

export function loadTerms(fetchOptions: FetchOptionsFunction, vocabularyIri: IRI, apiPrefix: string = Constants.API_PREFIX) {
    const action = {
        type: ActionType.FETCH_VOCABULARY_TERMS
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        let url = `${apiPrefix}/vocabularies/${vocabularyIri.fragment}/terms/`;
        if (fetchOptions.optionID) {
            url += `${VocabularyUtils.getFragment(fetchOptions.optionID)}/subterms`;
        } else if (!fetchOptions.searchString) {
            url += "roots";
        }
        return Ajax.get(url,
            params(Object.assign({
                searchString: fetchOptions.searchString,
                includeImported: fetchOptions.includeImported,
                includeTerms: fetchOptions.includeTerms,
                namespace: vocabularyIri.namespace
            }, Utils.createPagingParams(fetchOptions.offset, fetchOptions.limit))))
            .then((data: object[]) => data.length !== 0 ? JsonLdUtils.compactAndResolveReferencesAsArray<TermData>(data, TERM_CONTEXT) : [])
            .then((data: TermData[]) => {
                dispatch(asyncActionSuccess(action));
                return data.map(d => new Term(d));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return [];
            });
    };
}

export function loadTerm(termNormalizedName: string, vocabularyIri: IRI, apiPrefix: string = Constants.API_PREFIX) {
    const action = {
        type: ActionType.LOAD_TERM
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.get(`${apiPrefix}/vocabularies/${vocabularyIri.fragment}/terms/${termNormalizedName}`, param("namespace", vocabularyIri.namespace))
            .then((data: object) => JsonLdUtils.compactAndResolveReferences<TermData>(data, TERM_CONTEXT))
            .then((data: TermData) => dispatch(asyncActionSuccessWithPayload(action, new Term(data))))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

export function loadTermByIri(termIri: IRI, apiPrefix: string = Constants.API_PREFIX) {
    const action = {
        type: ActionType.LOAD_TERM_BY_IRI
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(`${apiPrefix}/terms/${termIri.fragment}`, param("namespace", termIri.namespace))
            .then((data: object) => JsonLdUtils.compactAndResolveReferences<TermData>(data, TERM_CONTEXT))
            .then((data: TermData) => {
                dispatch(asyncActionSuccess(action));
                return new Term(data);
            }).catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return null;
            });
    };
}

export function executeQuery(queryString: string) {
    const action = {
        type: ActionType.EXECUTE_QUERY
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax
            .get(Constants.API_PREFIX + "/query", params({query: queryString}))
            .then((data: object) =>
                jsonld.expand(data))
            .then((data: object) =>
                dispatch(SyncActions.executeQuerySuccess(queryString, data)))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

export function loadTypes() {
    const action = {
        type: ActionType.LOAD_TYPES
    };
    return (dispatch: ThunkDispatch, getState: GetStoreState): Promise<any> => {
        if (Object.getOwnPropertyNames(getState().types).length > 0) {
            // No need to load types if they are already loaded
            return Promise.resolve([]);
        }
        const language = getShortLocale(getState().intl.locale);
        dispatch(asyncActionRequest(action));
        return Ajax
            .get(Constants.API_PREFIX + "/language/types", params({language}))
            .then((data: object[]) =>
                data.length !== 0 ? JsonLdUtils.compactAndResolveReferencesAsArray<TermData>(data, TERM_CONTEXT) : [])
            .then((data: TermData[]) => {
                return data.map((term: TermData) => {
                    if (term.subTerms) {
                        // @ts-ignore
                        term.subTerms = Utils.sanitizeArray(term.subTerms).map(subTerm => subTerm.iri);
                    }
                    return new Term(term);
                });
            })
            .then((result: Term[]) => dispatch(asyncActionSuccessWithPayload(action, result)))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

export function executeFileTextAnalysis(file: TermitFile, vocabularyIri?: string) {
    const action = {
        type: ActionType.EXECUTE_FILE_TEXT_ANALYSIS
    };
    const iri = VocabularyUtils.create(file.iri);
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        const reqParams: any = {};
        reqParams.namespace = iri.namespace;
        if (vocabularyIri) {
            reqParams.vocabulary = vocabularyIri
        }
        return Ajax
            .put(Constants.API_PREFIX + "/resources/" + iri.fragment + "/text-analysis", params(reqParams))
            .then(() => {
                dispatch(asyncActionSuccess(action));
                return dispatch(publishMessage(new Message({
                    messageId: "file.text-analysis.finished.message",
                    values: {"fileName": file.label}
                }, MessageType.SUCCESS)));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

export function loadFileContent(fileIri: IRI) {
    const action = {
        type: ActionType.LOAD_FILE_CONTENT
    };
    return (dispatch: ThunkDispatch, getState: GetStoreState) => {
        if (isActionRequestPending(getState(), action)) {
            return Promise.resolve({});
        }
        dispatch(asyncActionRequest(action, true));
        return Ajax
            .get(Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content", param("namespace", fileIri.namespace))
            .then((data: object) => data.toString())
            .then((data: string) => dispatch(asyncActionSuccessWithPayload(action, data)))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

export function hasFileContent(fileIri: IRI) {
    const action = {type: ActionType.HAS_FILE_CONTENT};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.head(Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content", param("namespace", fileIri.namespace))
            .then(() => {
                dispatch(asyncActionSuccess(action));
                return true;
            })
            .catch(() => {
                // No problem here, 404 is the most likely reason
                dispatch(asyncActionSuccess(action));
                return false;
            });
    }
}

// TODO This has been is superseded by uploadFileContent and should internally make use of it
export function saveFileContent(fileIri: IRI, fileContent: string) {
    const action = {
        type: ActionType.SAVE_FILE_CONTENT
    };
    const formData = new FormData();
    const fileBlob = new Blob([fileContent], {type: "text/html"});
    formData.append("file", fileBlob, fileIri.fragment);
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax
            .put(
                Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content",
                contentType(Constants.MULTIPART_FORM_DATA).formData(formData).param("namespace", fileIri.namespace)
            )
            .then((data: object) => fileContent)// TODO load from the service instead
            .then((data: string) => dispatch(asyncActionSuccessWithPayload(action, data)))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

export function updateTerm(term: Term) {
    const action = {
        type: ActionType.UPDATE_TERM
    };
    return (dispatch: ThunkDispatch, getState: GetStoreState) => {
        dispatch(asyncActionRequest(action));
        const termIri = VocabularyUtils.create(term.iri);
        const vocabularyIri = VocabularyUtils.create(term.vocabulary!.iri!);
        const reqUrl = Constants.API_PREFIX + "/vocabularies/" + vocabularyIri.fragment + "/terms/" + termIri.fragment;
        // Vocabulary namespace defines also term namespace
        return Ajax.put(reqUrl, content(term.toJsonLd()).params({namespace: vocabularyIri.namespace}))
            .then(() => {
                dispatch(asyncActionSuccess(action));
                dispatch(publishNotification({
                    source: {type: NotificationType.ASSET_UPDATED},
                    original: getState().selectedTerm,
                    updated: term
                }));
                return dispatch(publishMessage(new Message({messageId: "term.updated.message"}, MessageType.SUCCESS)));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}

export function updateResourceTerms(res: Resource) {
    const action = {
        type: ActionType.UPDATE_RESOURCE_TERMS
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, false));
        const resourceIri = VocabularyUtils.create(res.iri);
        return Ajax.put(Constants.API_PREFIX + "/resources/" + resourceIri.fragment + "/terms",
            content(res.terms!.map(t => t.iri))
                .params({namespace: resourceIri.namespace}).contentType("application/json"))
            .then(() => {
                return dispatch(asyncActionSuccess(action));
            })
            .catch((error: ErrorData) => {
                return dispatch(asyncActionFailure(action, error));
            });
    };
}

export function updateResource(res: Resource) {
    const action = {
        type: ActionType.UPDATE_RESOURCE
    };
    return (dispatch: ThunkDispatch, getState: GetStoreState) => {
        dispatch(asyncActionRequest(action));
        const resourceIri = VocabularyUtils.create(res.iri);
        return Ajax.put(Constants.API_PREFIX + "/resources/" + resourceIri.fragment,
            content(res.toJsonLd()).params({namespace: resourceIri.namespace}))
            .then(() => {
                dispatch(asyncActionSuccess(action));
                dispatch(publishNotification({
                    source: {type: NotificationType.ASSET_UPDATED},
                    original: getState().resource,
                    updated: res
                }));
                return dispatch(updateResourceTerms(res));
            })
            .then(() => {
                dispatch(loadResource(resourceIri));
                return dispatch(publishMessage(new Message({messageId: "resource.updated.message"}, MessageType.SUCCESS)));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
            });
    };
}


export function updateVocabulary(vocabulary: Vocabulary) {
    const action = {
        type: ActionType.UPDATE_VOCABULARY
    };
    return (dispatch: ThunkDispatch, getState: GetStoreState) => {
        dispatch(asyncActionRequest(action));
        const vocabularyIri = VocabularyUtils.create(vocabulary.iri);
        const reqUrl = Constants.API_PREFIX + "/vocabularies/" + vocabularyIri.fragment;
        return Ajax.put(reqUrl, content(vocabulary.toJsonLd()).params({namespace: vocabularyIri.namespace}))
            .then(() => {
                dispatch(asyncActionSuccess(action));
                dispatch(publishNotification({
                    source: {type: NotificationType.ASSET_UPDATED},
                    original: getState().vocabulary,
                    updated: vocabulary
                }));
                dispatch(loadVocabulary(vocabularyIri));
                return dispatch(publishMessage(new Message({messageId: "vocabulary.updated.message"}, MessageType.SUCCESS)));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
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

/**
 * Fetches RDFS:label of a resource with the specified identifier.
 * @param iri Resource identifier
 */
export function getTextualField(iri: string, field: string, actionType: string) {
    const action = {
        type: actionType
    };
    return (dispatch: ThunkDispatch, getState: () => TermItState) => {
        if (field === "label" && getState().labelCache[iri]) {
            return Promise.resolve(getState().labelCache[iri]);
        }
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(Constants.API_PREFIX + "/data/" + field, param("iri", iri)).then(data => {
            const payload = {};
            payload[iri] = data;
            dispatch(asyncActionSuccessWithPayload(action, payload));
            return data;
        }).catch((error: ErrorData) => {
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
        type: ActionType.GET_RESOURCE
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(Constants.API_PREFIX + "/data/resource", param("iri", iri.toString()))
            .then((data: object) => JsonLdUtils.compactAndResolveReferences<RdfsResource>(data, RDFS_RESOURCE_CONTEXT))
            .then((data: RdfsResource) => {
                    const res = new RdfsResource(data);
                    dispatch(asyncActionSuccessWithPayload(action, res));
                    return res;
                }
            ).catch((error: ErrorData) => {
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
        type: ActionType.GET_PROPERTIES
    };
    return (dispatch: ThunkDispatch, getState: () => TermItState) => {
        if (getState().properties.length > 0) {
            return;
        }
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(Constants.API_PREFIX + "/data/properties")
            .then((data: object[]) => data.length > 0 ? JsonLdUtils.compactAndResolveReferencesAsArray<RdfsResourceData>(data, RDFS_RESOURCE_CONTEXT) : [])
            .then((data: RdfsResourceData[]) => dispatch(asyncActionSuccessWithPayload(action, data.map(d => new RdfsResource(d)))))
            .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
    };
}

export function createProperty(property: RdfsResource) {
    const action = {
        type: ActionType.CREATE_PROPERTY
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.post(Constants.API_PREFIX + "/data/properties", content(property.toJsonLd()))
            .then(() => dispatch(asyncActionSuccess(action)))
            .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
    }
}

export function loadTermAssignmentsInfo(termIri: IRI, vocabularyIri: IRI) {
    const action = {
        type: ActionType.LOAD_TERM_ASSIGNMENTS
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        const url = "/vocabularies/" + vocabularyIri.fragment + "/terms/" + termIri.fragment + "/assignments";
        return Ajax.get(Constants.API_PREFIX + url, param("namespace", vocabularyIri.namespace))
            .then((data: object) => JsonLdUtils.compactAndResolveReferencesAsArray<TermAssignments>(data, TERM_ASSIGNMENTS_CONTEXT))
            .then((data: TermAssignments[]) => {
                dispatch(asyncActionSuccess(action));
                return data;
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return [];
            });
    };
}

export function exportGlossary(vocabularyIri: IRI, type: ExportType) {
    const action = {
        type: ActionType.EXPORT_GLOSSARY
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        const url = Constants.API_PREFIX + "/vocabularies/" + vocabularyIri.fragment + "/terms";
        return Ajax.getRaw(url, param("namespace", vocabularyIri.namespace).accept(type.mimeType).responseType("arraybuffer"))
            .then((resp: AxiosResponse) => {
                const disposition = resp.headers[Constants.Headers.CONTENT_DISPOSITION];
                const filenameMatch = disposition ? disposition.match(/filename="(.+\..+)"/) : null;
                if (filenameMatch) {
                    const fileName = filenameMatch[1];
                    Utils.fileDownload(resp.data, fileName, type.mimeType);
                    return dispatch(asyncActionSuccess(action));
                } else {
                    const error: ErrorData = {
                        requestUrl: url,
                        messageId: "vocabulary.summary.export.error"
                    };
                    dispatch(asyncActionFailure(action, error));
                    return dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)))
                }
            })
            .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
    }
}

export function loadLastEditedAssets() {
    return loadPredefinedAssetList(ActionType.LOAD_LAST_EDITED, false);
}

export function loadMyAssets() {
    return loadPredefinedAssetList(ActionType.LOAD_MY, true);
}

function loadPredefinedAssetList(at: string, forCurrentUserOnly: boolean) {
    const action = {
        type: at
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        let config = param("limit", "5");
        if (forCurrentUserOnly) {
            config = config.param("forCurrentUserOnly", "true");
        }
        return Ajax.get(Constants.API_PREFIX + "/assets/last-edited", config)
            .then((data: object) => JsonLdUtils.compactAndResolveReferencesAsArray<RecentlyModifiedAssetData>(data, RECENTLY_MODIFIED_ASSET_CONTEXT))
            .then((data: RecentlyModifiedAssetData[]) => {
                dispatch(asyncActionSuccess(action));
                return data.map(item => new RecentlyModifiedAsset(item));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return [];
            });
    }
}

export function loadLatestTextAnalysisRecord(resourceIri: IRI) {
    const action = {
        type: ActionType.LOAD_LATEST_TEXT_ANALYSIS_RECORD
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.get(Constants.API_PREFIX + "/resources/" + resourceIri.fragment + "/text-analysis/records/latest", param("namespace", resourceIri.namespace))
            .then((data: object) => JsonLdUtils.compactAndResolveReferences<TextAnalysisRecordData>(data, TEXT_ANALYSIS_RECORD_CONTEXT))
            .then((data: TextAnalysisRecordData) => {
                dispatch(asyncActionSuccess(action));
                return new TextAnalysisRecord(data);
            }).catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return null;
            });
    }
}

export function exportFileContent(fileIri: IRI) {
    const action = {
        type: ActionType.EXPORT_FILE_CONTENT
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        const url = Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content";
        return Ajax.getRaw(url, param("namespace", fileIri.namespace).param("attachment", "true").responseType("arraybuffer"))
            .then((resp: AxiosResponse) => {
                const fileName = fileIri.fragment;
                const mimeType = resp.headers["content-type"];
                Utils.fileDownload(resp.data, fileName, mimeType);
                return dispatch(asyncActionSuccess(action));
            })
            .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
    }
}

export function loadUnusedTermsForVocabulary(iri: IRI) {
    const action = {
        type: ActionType.FETCH_UNUSED_TERMS_FOR_VOCABULARY
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax
            .get(Constants.API_PREFIX + "/vocabularies/" + iri.fragment + "/unused-terms", param("namespace", iri.namespace))
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
    const action = {type: historyConf.actionType};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(historyConf.url, param("namespace", assetIri.namespace))
            .then(data => JsonLdUtils.compactAndResolveReferencesAsArray<ChangeRecordData>(data, CHANGE_RECORD_CONTEXT))
            .then((data: ChangeRecordData[]) => {
                dispatch(asyncActionSuccess(action));
                return data.map(d => AssetFactory.createChangeRecord(d));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return [];
            });
    }
}

/**
 * Loads all changes related to the vocabulary itself together with all changes related to the terms belonging to the
 * vocabulary.
 *
 * @param vocabularyIri Vocabulary identifier
 */
export function loadVocabularyContentChanges(vocabularyIri: IRI) {
    const action = {type: ActionType.LOAD_VOCABULARY_CONTENT_HISTORY};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(`${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/history-of-content`,
            param("namespace", vocabularyIri.namespace))
            .then(data => JsonLdUtils.compactAndResolveReferencesAsArray<ChangeRecordData>(data, CHANGE_RECORD_CONTEXT))
            .then((data: ChangeRecordData[]) => {
                dispatch(asyncActionSuccess(action));
                return data.map(d => AssetFactory.createChangeRecord(d));
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return [];
            });
    }
}

function resolveHistoryLoadingParams(asset: Asset, assetIri: IRI) {
    const types = Utils.sanitizeArray(asset.types);
    if (types.indexOf(VocabularyUtils.TERM) !== -1) {
        return {
            actionType: ActionType.LOAD_TERM_HISTORY,
            url: `${Constants.API_PREFIX}/terms/${assetIri.fragment}/history`
        };
    } else if (types.indexOf(VocabularyUtils.VOCABULARY) !== -1) {
        return {
            actionType: ActionType.LOAD_VOCABULARY_HISTORY,
            url: `${Constants.API_PREFIX}/vocabularies/${assetIri.fragment}/history`
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
    const action = {type: ActionType.GET_FILE_CONTENT_TYPE};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.head(Constants.API_PREFIX + "/resources/" + fileIri.fragment + "/content", param("namespace", fileIri.namespace))
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
    }
}

export function invalidateCaches() {
    const action = {type: ActionType.INVALIDATE_CACHES};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.delete(`${Constants.API_PREFIX}/admin/cache`)
            .then(() => dispatch(asyncActionSuccess(action)))
            .then(() => dispatch(publishMessage(new Message({messageId: "administration.maintenance.invalidateCaches.success"}, MessageType.SUCCESS))))
            .catch(error => dispatch(asyncActionFailure(action, error)));
    }
}

export function loadStatistics(type: string) {
    const action = {type: ActionType.LOAD_STATISTICS};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(`${Constants.API_PREFIX}/statistics/${type}`)
            .then((data: any) => {
                dispatch(asyncActionSuccess(action));
                return data;
            })
            .catch(error => dispatch(asyncActionFailure(action, error)));
    };
}
