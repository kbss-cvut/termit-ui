import ActionType, {
    AsyncAction,
    AsyncActionSuccess,
    AsyncFailureAction,
    ExecuteQueryAction,
    MessageAction,
    NotificationAction,
    SelectingTermsAction,
    SwitchLanguageAction,
    UpdateLastModifiedAction,
} from "./ActionType";
import ErrorInfo, {ErrorData} from "../model/ErrorInfo";
import Message from "../model/Message";
import AsyncActionStatus from "./AsyncActionStatus";
import {saveLanguagePreference, setHtmlLanguage} from "../util/IntlUtil";
import Term, {TermData} from "../model/Term";
import {Action} from "redux";
import AppNotification from "../model/AppNotification";
import {Route} from "../util/Routes";

export function asyncActionRequest(a: Action, ignoreLoading: boolean = false): AsyncAction {
    return {...a, status: AsyncActionStatus.REQUEST, ignoreLoading};
}

export function asyncActionFailure(a: Action, error: ErrorData): AsyncFailureAction {
    return {...a, status: AsyncActionStatus.FAILURE, error: new ErrorInfo(a.type, error)};
}

export function asyncActionSuccessWithPayload<T>(a: Action, payload: T): AsyncActionSuccess<T> {
    return {...a, status: AsyncActionStatus.SUCCESS, payload};
}

export function asyncActionSuccess(a: Action): AsyncAction {
    return {...a, status: AsyncActionStatus.SUCCESS};
}

export function publishMessage(message: Message): MessageAction {
    return {
        type: ActionType.PUBLISH_MESSAGE,
        message
    };
}

export function dismissMessage(message: Message): MessageAction {
    return {
        type: ActionType.DISMISS_MESSAGE,
        message
    };
}

export function switchLanguage(language: string): SwitchLanguageAction {
    saveLanguagePreference(language);
    setHtmlLanguage(language);
    return {
        type: ActionType.SWITCH_LANGUAGE,
        language
    };
}

export function userLogout(): Action {
    return {
        type: ActionType.LOGOUT
    };
}

export function executeQuerySuccess(queryString: string, result: object): ExecuteQueryAction {
    return {
        type: ActionType.EXECUTE_QUERY,
        status: AsyncActionStatus.SUCCESS,
        queryResult: result,
        queryString
    };
}

export function selectVocabularyTerm(data: TermData | null): SelectingTermsAction {
    return {
        type: ActionType.SELECT_VOCABULARY_TERM,
        selectedTerms: data ? new Term(data) : data,
    };
}

export function fireFacetedSearchRequested() {
    return asyncActionRequest({type: ActionType.FACETED_SEARCH});
}

export function fireFacetedSearchFinished(data: any) {
    return asyncActionSuccessWithPayload({type: ActionType.FACETED_SEARCH}, data);
}

export function fireFacetedSearchFailed(error: any) {
    return asyncActionFailure({type: ActionType.FACETED_SEARCH}, error);
}

export function clearProperties() {
    return {
        type: ActionType.CLEAR_PROPERTIES
    };
}

export function publishNotification<T extends AppNotification>(notification: T): NotificationAction {
    return {
        type: ActionType.PUBLISH_NOTIFICATION,
        notification
    };
}

export function consumeNotification<T extends AppNotification>(notification: T): NotificationAction {
    return {
        type: ActionType.CONSUME_NOTIFICATION,
        notification
    };
}

export function clearResource() {
    return {
        type: ActionType.CLEAR_RESOURCE
    };
}

export function clearErrors() {
    return {
        type: ActionType.CLEAR_ERRORS
    };
}

export function updateLastModified(key: string, value: string): UpdateLastModifiedAction {
    return {
        type: ActionType.UPDATE_LAST_MODIFIED,
        key,
        value
    };
}

/**
 * Resets currently stored file content.
 */
export function clearFileContent() {
    return {type: ActionType.CLEAR_FILE_CONTENT};
}

export function toggleSidebar() {
    return {type: ActionType.TOGGLE_SIDEBAR};
}

export function changeView() {
    return {type: ActionType.DESKTOP_VIEW};
}

export function pushRoutingPayload(route: Route, payload: any) {
    return {type: ActionType.PUSH_ROUTING_PAYLOAD, routeName: route.name, payload};
}

export function popRoutingPayload(route: Route) {
    return {type: ActionType.POP_ROUTING_PAYLOAD, routeName: route.name};
}
