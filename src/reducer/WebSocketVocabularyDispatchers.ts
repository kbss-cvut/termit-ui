import JsonLdUtils from "../util/JsonLdUtils";
import ValidationResult, {
  CONTEXT as VALIDATION_RESULT_CONTEXT,
} from "../model/ValidationResult";
import { asyncActionSuccessWithPayload } from "../action/SyncActions";
import { IMessage } from "react-stomp-hooks";
import { ThunkDispatch } from "../util/Types";
import ActionType from "../action/ActionType";

/**
 * When the vocabulary IRI from the messages matches the provided one, the validation results are loaded to the store
 * @param message the WS message
 * @param vocabularyIri iri to match
 * @return true when iri matched and validation was loaded, false otherwise
 */
export function vocabularyValidation(message: IMessage, vocabularyIri: string) {
  const { body } = message;
  const messageVocabularyIri = message.headers["vocabulary"];

  return async (dispatch: ThunkDispatch) => {
    message.ack();
    if (messageVocabularyIri !== vocabularyIri) {
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
          [vocabularyIri]: data,
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
