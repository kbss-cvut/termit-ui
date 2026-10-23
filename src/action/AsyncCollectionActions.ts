import VocabularyUtils, { IRI } from "../util/VocabularyUtils";
import ActionType, { AsyncAction, AsyncFailureAction } from "./ActionType";
import { PageRequest, PageRequestOptional, ThunkDispatch } from "../util/Types";
import Ajax, { params } from "../util/Ajax";
import Constants from "../util/Constants";
import {
  asyncActionFailureWithMessage,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
} from "./SyncActions";
import JsonLdUtils from "../util/JsonLdUtils";
import {
  CollectionMember,
  CollectionMemberData,
  CONTEXT,
  MEMBER_CONTEXT,
  SkosCollectionDto,
  SkosCollectionDtoData,
} from "../model/Collection";
import { ErrorData } from "../model/ErrorInfo";
import { EMPTY_PAGE, ResultPage } from "../model/ResultPage";
import { AxiosResponse } from "axios";

function path(vocabularyUri: IRI) {
  return `${Constants.API_PREFIX}/vocabularies/${vocabularyUri.fragment}/collections`;
}

function queryParams(collectionUri?: IRI, vocabularyUri?: IRI) {
  const builder = params({});
  if (collectionUri) {
    builder.param("collectionNamespace", collectionUri.namespace);
  }
  if (vocabularyUri) {
    builder.param("namespace", vocabularyUri.namespace);
  }
  return builder;
}

function createPage<T>(
  response: AxiosResponse,
  pageContent: T[]
): ResultPage<T> {
  return {
    totalCount: Number(response.headers[Constants.Headers.X_TOTAL_COUNT] ?? 0),
    pageContent,
  };
}

export function loadSkosCollection(collectionUri: IRI, vocabularyUri: IRI) {
  const action = { type: ActionType.LOAD_COLLECTION };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${path(vocabularyUri)}/${collectionUri.fragment}`,
      queryParams(collectionUri, vocabularyUri)
    )
      .then((data) => JsonLdUtils.compactAndResolveReferences(data, CONTEXT))
      .then((data) => new SkosCollectionDto(data as SkosCollectionDtoData))
      .then((result) => dispatch(asyncActionSuccessWithPayload(action, result)))
      .catch((error: ErrorData) =>
        asyncActionFailureWithMessage(error, action, dispatch)
      );
  };
}

function parseIris(collection: SkosCollectionDtoData) {
  const vocabularyUri = VocabularyUtils.create(collection.vocabulary.iri);
  const collectionUri = VocabularyUtils.create(collection.iri);
  return { vocabularyUri, collectionUri };
}

export function loadSkosCollections(
  vocabularyUri: IRI,
  pageRequest: PageRequest,
  signal?: AbortSignal
) {
  const action = { type: ActionType.LOAD_COLLECTIONS };
  return (dispatch: ThunkDispatch): Promise<ResultPage<SkosCollectionDto>> => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.getResponse(
      path(vocabularyUri),
      queryParams(undefined, vocabularyUri)
        .param("page", pageRequest.page.toString())
        .param("size", pageRequest.size.toString())
        .signal(signal)
    )
      .then((response) => {
        return JsonLdUtils.compactAndResolveReferencesAsArray<SkosCollectionDtoData>(
          response.data,
          CONTEXT
        )
          .then((data) => data.map((d) => new SkosCollectionDto(d)))
          .then((pageContent) => createPage(response, pageContent));
      })
      .catch((error: ErrorData) => {
        asyncActionFailureWithMessage(error, action, dispatch);
        return EMPTY_PAGE;
      });
  };
}

export function loadCollectionMembers(
  collection: SkosCollectionDto,
  pageRequest: PageRequest,
  signal: AbortSignal | undefined
) {
  const action = { type: ActionType.LOAD_COLLECTION_MEMBERS };
  return (dispatch: ThunkDispatch): Promise<ResultPage<CollectionMember>> => {
    dispatch(asyncActionRequest(action, true));
    const { collectionUri, vocabularyUri } = parseIris(collection);

    let endpoint = path(vocabularyUri);
    if (collection.isOrdered()) {
      endpoint += "/ordered";
    }
    endpoint += `/${collectionUri.fragment}/members`;

    return Ajax.getResponse(
      endpoint,
      queryParams(collectionUri, vocabularyUri)
        .param("page", pageRequest.page.toString())
        .param("size", pageRequest.size.toString())
        .signal(signal)
    )
      .then((response) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<CollectionMemberData>(
          response.data,
          MEMBER_CONTEXT
        )
          .then((data) => data.map((d) => new CollectionMember(d)))
          .then((pageContent) => createPage(response, pageContent))
      )
      .catch((error: ErrorData) => {
        asyncActionFailureWithMessage(error, action, dispatch);
        return EMPTY_PAGE;
      });
  };
}

export function updateCollectionMemberPosition(
  collection: SkosCollectionDto,
  memberIri: string,
  originalPos: number,
  newPos: number
) {
  if (!collection.isOrdered()) {
    throw new Error(
      "Changing member order for unordered collection is not allowed"
    );
  }
  const action = { type: ActionType.UPDATE_COLLECTION_MEMBER_POSITION };
  return (
    dispatch: ThunkDispatch
  ): Promise<AsyncFailureAction | AsyncAction> => {
    dispatch(asyncActionRequest(action, true));
    const { vocabularyUri, collectionUri } = parseIris(collection);

    return Ajax.post(
      `${path(vocabularyUri)}/ordered/${
        collectionUri.fragment
      }/members/positions`,
      queryParams(collectionUri, vocabularyUri)
        .param("memberIri", memberIri)
        .param("originalPos", originalPos.toString())
        .param("newPos", newPos.toString())
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) =>
        asyncActionFailureWithMessage(error, action, dispatch)
      );
  };
}

export function updateSkosCollection(collection: SkosCollectionDto) {
  const action = { type: ActionType.UPDATE_COLLECTION };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const { vocabularyUri, collectionUri } = parseIris(collection);

    return Ajax.put(
      `${path(vocabularyUri)}/${collectionUri.fragment}`,
      queryParams(collectionUri, vocabularyUri)
        .content(collection.toJsonLd())
        .contentType(Constants.JSON_LD_MIME_TYPE)
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) =>
        asyncActionFailureWithMessage(error, action, dispatch)
      );
  };
}

export function createSkosCollection(collection: SkosCollectionDto) {
  const action = { type: ActionType.CREATE_COLLECTION };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const { vocabularyUri, collectionUri } = parseIris(collection);

    let endpoint = path(vocabularyUri);
    if (collection.isOrdered()) {
      endpoint += "/ordered";
    }

    return Ajax.post(
      endpoint,
      queryParams(collectionUri, vocabularyUri)
        .content(collection.toJsonLd())
        .contentType(Constants.JSON_LD_MIME_TYPE)
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) =>
        asyncActionFailureWithMessage(error, action, dispatch)
      );
  };
}

export function removeSkosCollection(collection: SkosCollectionDto) {
  const action = { type: ActionType.REMOVE_COLLECTION };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const { vocabularyUri, collectionUri } = parseIris(collection);

    return Ajax.delete(
      `${path(vocabularyUri)}/${collectionUri.fragment}`,
      queryParams(collectionUri, vocabularyUri)
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) =>
        asyncActionFailureWithMessage(error, action, dispatch)
      );
  };
}

export function loadAddCollectionMemberOptions(
  collection: SkosCollectionDto,
  pageRequest: PageRequestOptional,
  searchString?: string
) {
  const action = { type: ActionType.LOAD_ADD_COLLECTION_MEMBER_OPTIONS };
  return (dispatch: ThunkDispatch): Promise<ResultPage<CollectionMember>> => {
    dispatch(asyncActionRequest(action, true));
    const { vocabularyUri, collectionUri } = parseIris(collection);

    return Ajax.getResponse(
      `${path(vocabularyUri)}/${collectionUri.fragment}/members/options`,
      queryParams(collectionUri, vocabularyUri)
        .param("page", pageRequest.page?.toString())
        .param("size", pageRequest.size?.toString())
        .param("searchString", searchString)
    )
      .then((response: AxiosResponse) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<CollectionMemberData>(
          response.data,
          MEMBER_CONTEXT
        )
          .then((data) => data.map((d) => new CollectionMember(d)))
          .then((pageContent) => createPage(response, pageContent))
      )
      .catch((error: ErrorData) => {
        asyncActionFailureWithMessage(error, action, dispatch);
        return EMPTY_PAGE;
      });
  };
}
