/*
 * Asynchronous actions involve requests to the backend server REST API. As per recommendations in the Redux docs, this consists
 * of several synchronous sub-actions which inform the application of initiation of the request and its result.
 *
 * This file contains asynchronous actions related to term management in the frontend.
 */
import VocabularyUtils, {IRI} from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import {GetStoreState, ThunkDispatch} from "../util/Types";
import {
    asyncActionFailure,
    asyncActionRequest,
    asyncActionSuccess,
    asyncActionSuccessWithPayload,
    publishMessage
} from "./SyncActions";
import Ajax, {param, params} from "../util/Ajax";
import Term, {CONTEXT as TERM_CONTEXT, TermData} from "../model/Term";
import {ErrorData} from "../model/ErrorInfo";
import Constants from "../util/Constants";
import TermOccurrence from "../model/TermOccurrence";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import {getLocalized} from "../model/MultilingualString";
import {getShortLocale} from "../util/IntlUtil";
import TermStatus from "../model/TermStatus";
import FetchOptionsFunction from "../model/Functions";
import Utils from "../util/Utils";
import JsonLdUtils from "../util/JsonLdUtils";

export function setTermDefinitionSource(source: TermOccurrence, term: Term) {
    const termIri = VocabularyUtils.create(term.iri);
    const action = {type: ActionType.SET_TERM_DEFINITION_SOURCE};
    return (dispatch: ThunkDispatch, getState: GetStoreState) => {
        dispatch(asyncActionRequest(action));
        return Ajax.put(`${Constants.API_PREFIX}/terms/${termIri.fragment}/definition-source`,
            param("namespace", termIri.namespace).content(source.toJsonLd()))
            .then(() => dispatch(asyncActionSuccess(action)))
            .then(() => dispatch(publishMessage(new Message({
                messageId: "annotator.setTermDefinitionSource.success",
                values: {term: getLocalized(term.label, getShortLocale(getState().intl.locale))}
            }, MessageType.SUCCESS))))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                if (error.status === Constants.STATUS_CONFLICT) {
                    dispatch(publishMessage(new Message({
                        messageId: "annotator.setTermDefinitionSource.error.exists",
                        values: {term: getLocalized(term.label, getShortLocale(getState().intl.locale))}
                    }, MessageType.ERROR)));
                }
                return Promise.reject();
            });
    };
}

export function setTermStatus(termIri: IRI, status: TermStatus) {
    const action = {type: ActionType.SET_TERM_STATUS};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.put(`${Constants.API_PREFIX}/terms/${termIri.fragment}/status`,
            param("namespace", termIri.namespace).content(status).contentType(Constants.TEXT_MIME_TYPE))
            .then(() => dispatch(asyncActionSuccessWithPayload(action, status)))
            .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
    };
}

export function loadTermsFromWorkspace(fetchOptions: FetchOptionsFunction) {
    const action = {
        type: ActionType.FETCH_VOCABULARY_TERMS
    };
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        let url = `${Constants.API_PREFIX}/terms`;
        const parameters: any = {};
        if (fetchOptions.optionID) {
            const parentIri = VocabularyUtils.create(fetchOptions.optionID);
            url += `/${parentIri.fragment}/subterms`;
            parameters.namespace = parentIri.namespace;
        } else {
            parameters.searchString = fetchOptions.searchString;
            parameters.rootsOnly = !fetchOptions.searchString;
        }
        return Ajax.get(url,
            params(Object.assign(parameters, Utils.createPagingParams(fetchOptions.offset, fetchOptions.limit))))
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
