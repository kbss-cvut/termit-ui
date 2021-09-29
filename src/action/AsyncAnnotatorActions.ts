import VocabularyUtils, { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { GetStoreState, ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccessWithPayload,
} from "./SyncActions";
import Constants from "../util/Constants";
import Ajax, { params } from "../util/Ajax";
import JsonLdUtils from "../util/JsonLdUtils";
import Term, { CONTEXT as TERM_CONTEXT, TermData } from "../model/Term";
import { ErrorData } from "../model/ErrorInfo";
import {
  isActionRequestPending,
  loadTermByIri as loadTermByIriBase,
} from "./AsyncActions";

export function loadAllTerms(
  vocabularyIri: IRI,
  includeImported: boolean = false
) {
  const action = {
    type: ActionType.ANNOTATOR_LOAD_TERMS,
  };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    if (isActionRequestPending(getState(), action)) {
      return Promise.resolve({});
    }
    dispatch(asyncActionRequest(action, true));
    const url = `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/terms`;
    return Ajax.get(
      url,
      params(
        Object.assign({
          includeImported,
          namespace: vocabularyIri.namespace,
        })
      )
    )
      .then((data: object[]) =>
        data.length !== 0
          ? JsonLdUtils.compactAndResolveReferencesAsArray<TermData>(
              data,
              TERM_CONTEXT
            )
          : []
      )
      .then((data: TermData[]) => {
        const terms = {};
        data.forEach((d) => (terms[d.iri!] = new Term(d)));
        return dispatch(asyncActionSuccessWithPayload(action, terms));
      })
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}

// Cache of pending term fetches, used to prevent repeated concurrent attempts at fetching the same term
const pendingTermFetches: { [key: string]: Promise<Term | null> } = {};

export function loadTermByIri(termIri: string) {
  const action = { type: ActionType.ANNOTATOR_LOAD_TERM };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    if (getState().annotatorTerms[termIri]) {
      return Promise.resolve(getState().annotatorTerms[termIri]);
    }
    if (pendingTermFetches[termIri] !== undefined) {
      return pendingTermFetches[termIri];
    }
    const promise = dispatch(
      loadTermByIriBase(VocabularyUtils.create(termIri))
    );
    pendingTermFetches[termIri] = promise;
    return promise.then((t) => {
      delete pendingTermFetches[termIri];
      if (t) {
        dispatch(asyncActionSuccessWithPayload(action, t));
      }
      return t;
    });
  };
}
