import {IRI} from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import {ThunkDispatch} from "../util/Types";
import {asyncActionFailure, asyncActionRequest, asyncActionSuccess} from "./SyncActions";
import Ajax, {param} from "../util/Ajax";
import Constants from "../util/Constants";
import JsonLdUtils from "../util/JsonLdUtils";
import File, {FileData} from "../model/File";
import {CONTEXT as DOCUMENT_CONTEXT} from "../model/Document";
import {ErrorData} from "../model/ErrorInfo";

export function loadFileMetadata(fileIri: IRI) {
    const action = {type: ActionType.LOAD_FILE_METADATA};
    return (dispatch: ThunkDispatch) => {
        asyncActionRequest(action, true);
        return Ajax.get(`${Constants.API_PREFIX}/resources/${fileIri.fragment}`, param("namespace", fileIri.namespace))
            .then((data) => JsonLdUtils.compactAndResolveReferences<FileData>(data, DOCUMENT_CONTEXT))
            .then((data: FileData) => {
                dispatch(asyncActionSuccess(action));
                return new File(data);
            })
            .catch((error: ErrorData) => {
                dispatch(asyncActionFailure(action, error));
                return undefined;
            });
    };
}
