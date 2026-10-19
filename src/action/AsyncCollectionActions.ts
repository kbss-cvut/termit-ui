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
