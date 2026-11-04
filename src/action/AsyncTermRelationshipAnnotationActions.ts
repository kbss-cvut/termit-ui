import VocabularyUtils, { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { GetStoreState, ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
} from "./SyncActions";
import Ajax, { content, param } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import RelationshipAnnotation, {
  CONTEXT as RELATIONSHIPS_ANNOTATION_CONTEXT,
} from "../model/meta/RelationshipAnnotation";
import { ErrorData } from "../model/ErrorInfo";
import AnnotatedTermRelationship, {
  CONTEXT as ANNOTATED_RELATIONSHIP_CONTEXT,
} from "../model/meta/AnnotatedTermRelationship";
import { pluralContext } from "../model/MultilingualString";

export function loadTermRelationshipAnnotations(termIri: IRI) {
  const action = { type: ActionType.LOAD_TERM_RELATIONSHIP_ANNOTATIONS };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${Constants.API_PREFIX}/terms/${termIri.fragment}/relationship-annotations`,
      param("namespace", termIri.namespace)
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<RelationshipAnnotation>(
          data,
          RELATIONSHIPS_ANNOTATION_CONTEXT
        )
      )
      .then((annotations) =>
        dispatch(asyncActionSuccessWithPayload(action, annotations))
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        throw error;
      });
  };
}

export function loadTermRelationshipsAnnotatedBy(termIri: IRI) {
  const action = { type: ActionType.LOAD_ANNOTATED_TERM_RELATIONSHIPS };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${Constants.API_PREFIX}/terms/${termIri.fragment}/annotated-relationships`,
      param("namespace", termIri.namespace)
    )
      .then((data) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<AnnotatedTermRelationship>(
          data,
          ANNOTATED_RELATIONSHIP_CONTEXT
        )
      )
      .then((annotations) =>
        dispatch(asyncActionSuccessWithPayload(action, annotations))
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        throw error;
      });
  };
}

export function updateTermRelationshipAnnotation(
  termIri: IRI,
  annotation: RelationshipAnnotation
) {
  const action = { type: ActionType.UPDATE_TERM_RELATIONSHIP_ANNOTATIONS };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.patch(
      `${Constants.API_PREFIX}/terms/${termIri.fragment}/relationship-annotations`,
      content(
        JsonLdUtils.toJsonLd(annotation, buildContext(getState, annotation))
      ).param("namespace", termIri.namespace)
    )
      .then(() => asyncActionSuccess(action))
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        throw error;
      });
  };
}

function buildContext(
  getState: GetStoreState,
  annotation: RelationshipAnnotation
) {
  const baseContext: any = { ...RELATIONSHIPS_ANNOTATION_CONTEXT };
  const multilingualCustomAtts = getState()
    .customAttributes.filter(
      (att) => att.rangeIri === VocabularyUtils.RDF_LANGSTRING
    )
    .map((att) => att.iri);
  if (multilingualCustomAtts.includes(annotation.attribute.iri)) {
    baseContext.value = pluralContext(VocabularyUtils.RDF_OBJECT);
  }
  return baseContext;
}
