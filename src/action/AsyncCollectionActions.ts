import { IRI } from "../util/VocabularyUtils";
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
  CONTEXT,
  SkosCollectionDto,
  SkosCollectionDtoData,
} from "../model/Collection";
import { ErrorData } from "../model/ErrorInfo";
import { ResultPage } from "../model/ResultPage";

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
    ).then((response) => {
      return JsonLdUtils.compactAndResolveReferencesAsArray<SkosCollectionDtoData>(
        response.data,
        CONTEXT
      )
        .then((data) => data.map((d) => new SkosCollectionDto(d)))
        .then((pageContent) => ({
          totalCount: Number(
            response.headers[Constants.Headers.X_TOTAL_COUNT] ?? 0
          ),
          pageContent,
        }));
    });
  };
}
