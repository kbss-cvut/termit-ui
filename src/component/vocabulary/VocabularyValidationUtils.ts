import {
  hasNonBlankValue,
  MultilingualString,
} from "../../model/MultilingualString";
import { VocabularyData } from "../../model/Vocabulary";

function isLabelInEachLanguageNotBlank(label: MultilingualString): boolean {
  return Object.keys(label).every((lang) => hasNonBlankValue(label, lang));
}

export function isVocabularyValid<T extends VocabularyData>(
  vocabularyData: T
): boolean {
  return (
    isLabelInEachLanguageNotBlank(vocabularyData.label) &&
    !!vocabularyData.primaryLanguage &&
    hasNonBlankValue(vocabularyData.label, vocabularyData.primaryLanguage)
  );
}
