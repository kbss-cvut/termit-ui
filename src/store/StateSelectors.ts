import VocabularyUtils from "../util/VocabularyUtils";
import Vocabulary, { VocabularyData } from "../model/Vocabulary";
import { CustomAttribute } from "../model/RdfsResource";

export function selectMultilingualCustomAttributeIris(state: {
  customAttributes: CustomAttribute[];
}) {
  return state.customAttributes
    .filter((att) => att.rangeIri === VocabularyUtils.RDF_LANGSTRING)
    .map((att) => att.iri);
}

/**
 * Retrieves the list of languages associated with a vocabulary, taking into account the multilingual custom attributes defined in the application state.
 *
 * @param state - The application state containing custom attribute definitions.
 * @param vocabulary - The vocabulary data to extract languages from; if omitted or null, languages are derived only from the multilingual custom attributes.
 * @return An array of language codes available for the specified vocabulary.
 */
export function selectVocabularyLanguages(
  state: { customAttributes: CustomAttribute[] },
  vocabulary?: VocabularyData | null
) {
  const multilingualCustomAttributes =
    selectMultilingualCustomAttributeIris(state);
  return Vocabulary.getLanguages(vocabulary, multilingualCustomAttributes);
}
