/*
 * Asynchronous actions involve requests to the backend server REST API. As per recommendations in the Redux docs, this consists
 * of several synchronous sub-actions which inform the application of initiation of the request and its result.
 *
 * This file contains asynchronous actions related to term management in the frontend.
 */
import VocabularyUtils, { IRI } from "../util/VocabularyUtils";
import ActionType from "./ActionType";
import { GetStoreState, ThunkDispatch } from "../util/Types";
import * as SyncActions from "./SyncActions";
import {
  asyncActionFailure,
  asyncActionRequest,
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
  publishMessage,
  publishNotification,
} from "./SyncActions";
import Ajax, { content, param } from "../util/Ajax";
import JsonLdUtils from "../util/JsonLdUtils";
import Term from "../model/Term";
import { ErrorData } from "../model/ErrorInfo";
import Constants from "../util/Constants";
import TermOccurrence, {
  CONTEXT as OCCURRENCE_CONTEXT,
  TermOccurrenceData,
} from "../model/TermOccurrence";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import { getLocalized } from "../model/MultilingualString";
import { getShortLocale } from "../util/IntlUtil";
import Utils from "../util/Utils";
import { AxiosResponse } from "axios";
import { getApiPrefix } from "./ActionUtils";
import { AssetData } from "../model/Asset";

const ENDPOINT = `${Constants.API_PREFIX}/vocabularies/`;

export function createTerm(term: Term, vocabularyIri: IRI) {
  const action = {
    type: ActionType.CREATE_VOCABULARY_TERM,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const url = resolveTermCreationUrl(term, vocabularyIri);
    const data = Object.assign(term.toJsonLd(), {
      vocabulary: {
        iri: vocabularyIri.namespace + vocabularyIri.fragment,
      },
    });
    return Ajax.post(
      url,
      content(data)
        .contentType(Constants.JSON_LD_MIME_TYPE)
        .param("namespace", vocabularyIri.namespace)
    )
      .then((resp: AxiosResponse) => {
        const asyncSuccessAction = asyncActionSuccess(action);
        dispatch(asyncSuccessAction);
        dispatch(
          SyncActions.publishMessage(
            new Message(
              { messageId: "vocabulary.term.created.message" },
              MessageType.SUCCESS
            )
          )
        );
        dispatch(publishNotification({ source: asyncSuccessAction }));
        return resp.headers[Constants.Headers.LOCATION];
      })
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
        return undefined;
      });
  };
}

function resolveTermCreationUrl(term: Term, targetVocabularyIri: IRI) {
  let url = `${ENDPOINT}${targetVocabularyIri.fragment}/terms`;
  const parents = Utils.sanitizeArray(term.parentTerms);
  if (parents.length > 0) {
    // Use one of the parents, it does not matter which one
    url += `/${VocabularyUtils.create(parents[0].iri!).fragment}/subterms`;
  }
  return url;
}

export function loadDefinitionRelatedTermsTargeting(
  termNormalizedName: string,
  vocabularyIri: IRI
) {
  const action = { type: ActionType.LOAD_DEFINITION_RELATED_TERMS_TARGETING };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${getApiPrefix(getState())}/vocabularies/${
        vocabularyIri.fragment
      }/terms/${termNormalizedName}/def-related-target`,
      param("namespace", vocabularyIri.namespace)
    )
      .then((data: object[]) =>
        data.length !== 0
          ? JsonLdUtils.compactAndResolveReferencesAsArray<TermOccurrenceData>(
              data,
              OCCURRENCE_CONTEXT
            )
          : []
      )
      .then((data: TermOccurrenceData[]) =>
        dispatch(
          asyncActionSuccessWithPayload(
            action,
            data.map((d) => new TermOccurrence(d))
          )
        )
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function loadDefinitionRelatedTermsOf(
  termNormalizedName: string,
  vocabularyIri: IRI
) {
  const action = { type: ActionType.LOAD_DEFINITION_RELATED_TERMS_OF };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    dispatch(asyncActionRequest(action, true));
    return Ajax.get(
      `${getApiPrefix(getState())}/vocabularies/${
        vocabularyIri.fragment
      }/terms/${termNormalizedName}/def-related-of`,
      param("namespace", vocabularyIri.namespace)
    )
      .then((data: object[]) =>
        data.length !== 0
          ? JsonLdUtils.compactAndResolveReferencesAsArray<TermOccurrenceData>(
              data,
              OCCURRENCE_CONTEXT
            )
          : []
      )
      .then((data: TermOccurrenceData[]) =>
        dispatch(
          asyncActionSuccessWithPayload(
            action,
            data.map((d) => new TermOccurrence(d))
          )
        )
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return [];
      });
  };
}

export function setTermDefinitionSource(source: TermOccurrence, term: Term) {
  const termIri = VocabularyUtils.create(term.iri);
  const action = { type: ActionType.SET_TERM_DEFINITION_SOURCE };
  return (dispatch: ThunkDispatch, getState: GetStoreState) => {
    dispatch(asyncActionRequest(action));
    return Ajax.put(
      `${Constants.API_PREFIX}/terms/${termIri.fragment}/definition-source`,
      param("namespace", termIri.namespace).content(source.toJsonLd())
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .then(() =>
        dispatch(
          publishMessage(
            new Message(
              {
                messageId: "annotator.setTermDefinitionSource.success",
                values: {
                  term: getLocalized(
                    term.label,
                    getShortLocale(getState().intl.locale)
                  ),
                },
              },
              MessageType.SUCCESS
            )
          )
        )
      )
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        if (error.status === Constants.STATUS_CONFLICT) {
          dispatch(
            publishMessage(
              new Message(
                {
                  messageId: "annotator.setTermDefinitionSource.error.exists",
                  values: {
                    term: getLocalized(
                      term.label,
                      getShortLocale(getState().intl.locale)
                    ),
                  },
                },
                MessageType.ERROR
              )
            )
          );
        }
        return Promise.reject();
      });
  };
}

export function removeOccurrence(occurrence: TermOccurrence | AssetData) {
  const action = {
    type: ActionType.REMOVE_TERM_OCCURRENCE,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const OccurrenceIri = VocabularyUtils.create(occurrence.iri!);
    return Ajax.delete(
      Constants.API_PREFIX + "/occurrence/" + OccurrenceIri.fragment,
      param("namespace", OccurrenceIri.namespace)
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}

export function approveOccurrence(occurrence: TermOccurrence | AssetData) {
  const action = {
    type: ActionType.APPROVE_TERM_OCCURRENCE,
  };
  return (dispatch: ThunkDispatch) => {
    dispatch(asyncActionRequest(action));
    const OccurrenceIri = VocabularyUtils.create(occurrence.iri!);
    return Ajax.put(
      Constants.API_PREFIX + "/occurrence/" + OccurrenceIri.fragment,
      param("namespace", OccurrenceIri.namespace)
    )
      .then(() => dispatch(asyncActionSuccess(action)))
      .catch((error: ErrorData) => {
        dispatch(asyncActionFailure(action, error));
        return dispatch(
          SyncActions.publishMessage(new Message(error, MessageType.ERROR))
        );
      });
  };
}
