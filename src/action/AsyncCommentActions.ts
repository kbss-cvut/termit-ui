import VocabularyUtils, { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
} from "./SyncActions";
import Ajax, { content, param, params } from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import Comment, {
  CommentData,
  CONTEXT as COMMENT_CONTEXT,
} from "../model/Comment";
import { ErrorData } from "../model/ErrorInfo";

export function loadTermComments(termIri: IRI) {
  const action = { type: ActionType.LOAD_COMMENTS };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${Constants.API_PREFIX}/terms/${termIri.fragment}/comments`,
      param("namespace", termIri.namespace)
    )
      .then((data: object) =>
        JsonLdUtils.compactAndResolveReferencesAsArray<CommentData>(
          data,
          COMMENT_CONTEXT
        )
      )
      .then((data: CommentData[]) => {
        dispatch(asyncActionSuccess(action));
        return data.map((d) => new Comment(d));
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function createTermComment(comment: Comment, termIri: IRI) {
  const action = { type: ActionType.CREATE_COMMENT };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.post(
      `${Constants.API_PREFIX}/terms/${termIri.fragment}/comments`,
      param("namespace", termIri.namespace).content(comment.toJsonLd())
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function reactToComment(commentIri: IRI, reactionType: string) {
  const action = { type: ActionType.REACT_TO_COMMENT };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.post(
      `${Constants.API_PREFIX}/comments/${commentIri.fragment}/reactions`,
      params({
        namespace: commentIri.namespace,
        type: reactionType,
      })
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function removeCommentReaction(commentIri: IRI) {
  const action = { type: ActionType.REMOVE_COMMENT_REACTION };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.delete(
      `${Constants.API_PREFIX}/comments/${commentIri.fragment}/reactions`,
      param("namespace", commentIri.namespace)
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function updateComment(comment: Comment) {
  const action = { type: ActionType.UPDATE_COMMENT };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const commentIri = VocabularyUtils.create(comment.iri!);
    return Ajax.put(
      `${Constants.API_PREFIX}/comments/${commentIri.fragment}`,
      content(comment.toJsonLd()).param("namespace", commentIri.namespace)
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

export function removeComment(comment: Comment) {
  const action = { type: ActionType.REMOVE_COMMENT, commentUri: comment.iri };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    const commentIri = VocabularyUtils.create(comment.iri!);
    return Ajax.delete(
      `${Constants.API_PREFIX}/comments/${commentIri.fragment}`,
      param("namespace", commentIri.namespace)
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}
