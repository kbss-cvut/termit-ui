import VocabularyUtils, { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import Ajax, { params } from "../util/Ajax";
import Constants from "../util/Constants";
import {
  asyncActionFailureWithMessage,
  asyncActionRequest,
  asyncActionSuccessWithPayload,
} from "./SyncActions";
import JsonLdUtils from "../util/JsonLdUtils";
import {
  CollectionMember,
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
  console.debug(response, pageContent);
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

export function loadSkosCollections(
  vocabularyUri: IRI,
  pageNumber: number,
  pageSize: number,
  signal?: AbortSignal
) {
  const action = { type: ActionType.LOAD_COLLECTIONS };
  return (dispatch: ThunkDispatch): Promise<ResultPage<SkosCollectionDto>> => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.getResponse(
      path(vocabularyUri),
      queryParams(undefined, vocabularyUri)
        .param("page", pageNumber.toString())
        .param("size", pageSize.toString())
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
  pageNumber: number,
  pageSize: number,
  signal: AbortSignal | undefined
) {
  const action = { type: ActionType.LOAD_COLLECTION_MEMBERS };
  return (dispatch: ThunkDispatch): Promise<ResultPage<CollectionMember>> => {
    dispatch(asyncActionRequest(action, true));
    const vocabularyUri = VocabularyUtils.create(collection.vocabulary.iri);
    const collectionUri = VocabularyUtils.create(collection.iri);
    let endpoint = path(vocabularyUri);
    if (collection.isOrdered()) {
      endpoint += "/ordered";
    }
    endpoint += `/${collectionUri.fragment}/members`;

    return Ajax.getResponse(
      endpoint,
      queryParams(collectionUri, vocabularyUri)
        .param("page", pageNumber.toString())
        .param("size", pageSize.toString())
        .signal(signal)
    )
      .then((response) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<CollectionMember>(
          response.data,
          MEMBER_CONTEXT
        ).then((pageContent) => createPage(response, pageContent))
      )
      .catch((error: ErrorData) => {
        asyncActionFailureWithMessage(error, action, dispatch);
        return EMPTY_PAGE;
      });
  };
}
