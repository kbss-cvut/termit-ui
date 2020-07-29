/*
 * Asynchronous actions involve requests to the backend server REST API. As per recommendations in the Redux docs, this consists
 * of several synchronous sub-actions which inform the application of initiation of the request and its result.
 *
 * This file contains asynchronous actions related to term management in the frontend.
 */
import VocabularyUtils from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import {ThunkDispatch} from "../util/Types";
import {asyncActionFailure, asyncActionRequest, asyncActionSuccess, publishMessage} from "./SyncActions";
import Ajax, {param} from "../util/Ajax";
import Term from "../model/Term";
import {ErrorData} from "../model/ErrorInfo";
import Constants from "../util/Constants";
import TermOccurrence from "../model/TermOccurrence";
import Message from "../model/Message";
import MessageType from "../model/MessageType";

export function setTermDefinitionSource(source: TermOccurrence, term: Term) {
    const termIri = VocabularyUtils.create(term.iri);
    const action = {type: ActionType.SET_TERM_DEFINITION_SOURCE};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.put(`${Constants.API_PREFIX}/terms/${termIri.fragment}/definition-source`,
            param("namespace", termIri.namespace).content(source.toJsonLd()))
            .then(() => dispatch(asyncActionSuccess(action)))
            .then(() => dispatch(publishMessage(new Message({
                messageId: "annotator.setTermDefinitionSource.success",
                values: {term: term.label}
            }, MessageType.SUCCESS))))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                if (error.status === Constants.STATUS_CONFLICT) {
                    dispatch(publishMessage(new Message({
                        messageId: "annotator.setTermDefinitionSource.error.exists",
                        values: {term: term.label}
                    }, MessageType.ERROR)));
                }
                return Promise.reject();
            });
    };
}
