import VocabularyUtils, { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { GetStoreState, ThunkDispatch } from "../util/Types";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
} from "./SyncActions";
import Constants from "../util/Constants";
import Ajax, { content, params } from "../util/Ajax";
import JsonLdUtils from "../util/JsonLdUtils";
import Term, { CONTEXT as TERM_CONTEXT, TermData } from "../model/Term";
import { ErrorData } from "../model/ErrorInfo";
import {
  isActionRequestPending,
  loadTermByIri as loadTermByIriBase,
} from "./AsyncActions";
import TermOccurrence from "../model/TermOccurrence";

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
const pendingTermFetches: {
  [key: string]: {
    promise: Promise<Term | null>;
    abortController: AbortController;
  };
} = {};

export function loadTermByIri(
  termIri: string,
  abortController: AbortController = new AbortController()
) {
  const action = { type: ActionType.ANNOTATOR_LOAD_TERM };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    abortController.signal.throwIfAborted();
    if (getState().annotatorTerms[termIri]) {
      return Promise.resolve(getState().annotatorTerms[termIri]);
    }
    if (
      pendingTermFetches[termIri] !== undefined &&
      !pendingTermFetches[termIri].abortController.signal.aborted
    ) {
      return pendingTermFetches[termIri].promise;
    }
    const promise = dispatch(
      loadTermByIriBase(VocabularyUtils.create(termIri), abortController)
    );
    pendingTermFetches[termIri] = { promise, abortController };
    return promise
      .then((t) => {
        abortController.signal.throwIfAborted();
        if (t) {
          // No hierarchy for on-demand loaded terms in annotator. We cannot load children anyway
          t.subTerms = [];
          dispatch(asyncActionSuccessWithPayload(action, t));
        }
        return t;
      })
      .finally(() => {
        delete pendingTermFetches[termIri];
      });
  };
}

export function saveOccurrence(occurrence: TermOccurrence) {
  const action = { type: ActionType.CREATE_TERM_OCCURRENCE };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.put(
      `${Constants.API_PREFIX}/occurrence`,
      content(occurrence.toJsonLd())
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => dispatch(asyncActionFailure(action, error)));
  };
}
