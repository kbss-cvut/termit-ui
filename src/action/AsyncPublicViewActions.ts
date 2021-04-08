import { IRI } from "../util/VocabularyUtils";
import { ThunkDispatch } from "../util/Types";
import {
    loadTerm,
    loadTermByIri,
    loadTerms,
    loadVocabularies,
    loadVocabulary,
} from "./AsyncActions";
import Constants from "../util/Constants";
import FetchOptionsFunction from "../model/Functions";

export function loadPublicVocabularies() {
    return (dispatch: ThunkDispatch) =>
        dispatch(loadVocabularies(Constants.PUBLIC_API_PREFIX));
}

export function loadPublicVocabulary(iri: IRI) {
    return (dispatch: ThunkDispatch) =>
        dispatch(loadVocabulary(iri, false, Constants.PUBLIC_API_PREFIX));
}

export function loadPublicTerms(
    fetchOptions: FetchOptionsFunction,
    vocabularyIri: IRI
) {
    return (dispatch: ThunkDispatch) =>
        dispatch(
            loadTerms(fetchOptions, vocabularyIri, Constants.PUBLIC_API_PREFIX)
        );
}

export function loadPublicTerm(termFragment: string, vocabularyIri: IRI) {
    return (dispatch: ThunkDispatch) =>
        dispatch(
            loadTerm(termFragment, vocabularyIri, Constants.PUBLIC_API_PREFIX)
        );
}

export function loadPublicTermByIri(termIri: IRI) {
    return (dispatch: ThunkDispatch) =>
        dispatch(loadTermByIri(termIri, Constants.PUBLIC_API_PREFIX));
}
