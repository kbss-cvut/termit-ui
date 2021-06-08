import * as SyncActions from "./SyncActions";
import {asyncActionFailure, asyncActionRequest, asyncActionSuccess} from "./SyncActions";
import Ajax, {contentType,} from "../util/Ajax";
import {ThunkDispatch} from "../util/Types";
import Constants from "../util/Constants";
import {ErrorData} from "../model/ErrorInfo";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import {IRI} from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import {Action} from "redux";

export function importSkosIntoExistingVocabulary(vocabularyIri: IRI, data: File, rename: Boolean) {
    const action = {type: ActionType.IMPORT_SKOS};
    const formData = new FormData();
    formData.append("file", data, "thesaurus");
    formData.append("rename", rename.toString());
    formData.append("namespace", vocabularyIri.namespace!);
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.post(
            `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/import`,
            contentType(Constants.MULTIPART_FORM_DATA).formData(formData)
        )
            .then(response =>
                processSuccess(dispatch, action, data, response.data)
            )
            .catch(processError(dispatch, action));
    };
}

export function importSkosAsNewVocabulary(data: File, rename: Boolean) {
    const action = {type: ActionType.IMPORT_SKOS};
    const formData = new FormData();
    formData.append("file", data, "thesaurus");
    formData.append("rename", rename.toString());
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action, true));
        return Ajax.post(
            `${Constants.API_PREFIX}/vocabularies/import`,
            contentType(Constants.MULTIPART_FORM_DATA)
                .formData(formData)
        )
            .then(response =>
                processSuccess(dispatch, action, data, response.data)
            )
            .catch(processError(dispatch, action));
    };
}

const processSuccess = (dispatch: ThunkDispatch, action: Action, data: File, vocabularyIri: IRI) => {
    dispatch(asyncActionSuccess(action));
    return dispatch(
        SyncActions.publishMessage(
            new Message(
                {
                    messageId: "vocabulary.import.success",
                    values: {fileName: data.name},
                },
                MessageType.SUCCESS
            )
        )
    );
};

const processError = (dispatch: ThunkDispatch, action: Action) => (error: ErrorData) => {
    dispatch(asyncActionFailure(action, error));
    return dispatch(
        SyncActions.publishMessage(
            new Message(error, MessageType.ERROR)
        )
    );
};