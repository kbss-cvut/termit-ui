import { IRI } from "../util/VocabularyUtils";
import { TermFetchParams, ThunkDispatch } from "../util/Types";
import { loadTerm, loadTermByIri, loadTerms } from "./AsyncActions";
import Constants from "../util/Constants";

export function loadPublicTerms(
  fetchOptions: TermFetchParams<any>,
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
