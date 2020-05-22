import {IRI} from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import {ThunkDispatch} from "../util/Types";
import * as SyncActions from "./SyncActions";
import {asyncActionFailure, asyncActionRequest, asyncActionSuccess} from "./SyncActions";
import Ajax, {param} from "../util/Ajax";
import Constants from "../util/Constants";
import {ErrorData} from "../model/ErrorInfo";
import Message from "../model/Message";
import MessageType from "../model/MessageType";


export function selectWorkspace(iri: IRI) {
    const action = {type: ActionType.SELECT_WORKSPACE};
    return (dispatch: ThunkDispatch) => {
        dispatch(asyncActionRequest(action));
        return Ajax.put(`${Constants.API_PREFIX}/workspaces/${iri.fragment}`, param("namespace", iri.namespace))
            .then(() => dispatch(asyncActionSuccess(action)))
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                dispatch(SyncActions.publishMessage(new Message(error, MessageType.ERROR)));
                return undefined;
            });
    }
}
