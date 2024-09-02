import JsonLdUtils from "../util/JsonLdUtils";
import ValidationResult, {
  CONTEXT as VALIDATION_RESULT_CONTEXT,
} from "../model/ValidationResult";
import { asyncActionSuccessWithPayload } from "../action/SyncActions";
import { IMessage } from "react-stomp-hooks";
import { GetStoreState, ThunkDispatch } from "../util/Types";
import ActionType from "../action/ActionType";
import TermItState from "../model/TermItState";

/**
 * Checks whether there are validation results present in the TermItState
 * @param vocabularyIri
 * @param state the {@link TermItState}
 * @returns true when validation is present, false otherwise
 */
function isValidationPresentFor(vocabularyIri: string, state: TermItState) {
  return !!state.validationResults[vocabularyIri];
}

/**
 * When the vocabulary IRI from the messages matches the provided one, the validation results are loaded to the store.
 * If the vocabulary IRI is null, then only existing validation results are updated in the store.
 * @param message the WS message
 * @param vocabularyIri iri to match
 * @return true when iri matched and validation was loaded, false otherwise
 */
export function vocabularyValidation(
  message: IMessage,
  vocabularyIri: string | null /* ensures that the parameter is explicit */
) {
  const { body } = message;
  const messageVocabularyIri = message.headers["vocabulary"];

  return async (dispatch: ThunkDispatch, getState: GetStoreState) => {
    message.ack();

    if (
      (!vocabularyIri && // vocabulary not specified and validation is not present, then we don't want to load a new one
        !isValidationPresentFor(messageVocabularyIri, getState())) ||
      (vocabularyIri && messageVocabularyIri !== vocabularyIri) // iri specified and it does not match
    ) {
      return false;
    }
    const json = JSON.parse(body);
    const data =
      await JsonLdUtils.compactAndResolveReferencesAsArray<ValidationResult>(
        json,
        VALIDATION_RESULT_CONTEXT
      ).then(consolidateResults);

    dispatch(
      asyncActionSuccessWithPayload(
        { type: ActionType.FETCH_VALIDATION_RESULTS },
        {
          [messageVocabularyIri]: data,
        }
      )
    );
    return true;
  };
}

function consolidateResults(validationResults: ValidationResult[]) {
  const consolidatedResults = {};
  validationResults.forEach((r) => {
    consolidatedResults![r.term.iri!] = consolidatedResults![r.term.iri!] || [];
    consolidatedResults![r.term.iri!].push(r);
  });
  return consolidatedResults;
}
