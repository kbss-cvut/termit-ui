import {IRI} from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import {ThunkDispatch} from "../util/Types";
import {asyncActionFailure, asyncActionRequest, asyncActionSuccess} from "./SyncActions";
import Ajax, {param} from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import Comment, {CommentData, CONTEXT as COMMENT_CONTEXT} from "../model/Comment";
import {ErrorData} from "../model/ErrorInfo";

export function loadTermComments(termIri: IRI) {
    const action = {type: ActionType.LOAD_COMMENTS};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.get(`${Constants.API_PREFIX}/terms/${termIri.fragment}/comments`, param("namespace", termIri.namespace))
            .then((data: object) => JsonLdUtils.compactAndResolveReferencesAsArray<CommentData>(data, COMMENT_CONTEXT))
            .then((data: CommentData[]) => {
                dispatch(asyncActionSuccess(action));
                return data.map(d => new Comment(d));
            }).catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return [];
            });
    }
}

export function createTermComment(termIri: IRI, comment: Comment) {
    const action = {type: ActionType.CREATE_COMMENT};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.post(`${Constants.API_PREFIX}/terms/${termIri.fragment}/comments`,
            param("namespace", termIri.namespace).content(comment.toJsonLd()))
            .then(() => dispatch(asyncActionSuccess(action)))
            .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
    }
}
