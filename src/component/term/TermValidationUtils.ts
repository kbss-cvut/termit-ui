import Ajax, { params } from "../../util/Ajax";
import Constants from "../../util/Constants";
import { IRI } from "../../util/VocabularyUtils";
import { TermData } from "../../model/Term";
import { hasNonBlankValue } from "../../model/MultilingualString";

export function checkLabelUniqueness(
  vocabularyIri: IRI,
  prefLabel: string,
  language: string,
  onDuplicate: () => any,
  onUnique: () => any = () => undefined
) {
  const url =
    Constants.API_PREFIX + "/vocabularies/" + vocabularyIri.fragment + "/terms";
  Ajax.head(
    url,
    params({
      namespace: vocabularyIri.namespace,
      prefLabel,
      language,
    })
  )
    .then(onDuplicate)
    .catch(onUnique);
}

function labelInEachLanguageValid<T extends TermData>(
  data: T,
  labelExists: LabelExists,
  languages: string[]
): boolean {
  for (const lang of languages) {
    if (!hasNonBlankValue(data.label, lang) || labelExists[lang]) {
      return false;
    }
  }
  return true;
}

export function isTermValid<T extends TermData>(
  data: T,
  labelExists: LabelExists,
  vocabularyPrimaryLanguage: string
) {
  const languages = Object.keys(data.label);
  return (
    data.iri !== undefined &&
    data.iri.trim().length > 0 &&
    labelInEachLanguageValid(data, labelExists, languages) &&
    languages.includes(vocabularyPrimaryLanguage)
  );
}
export type LabelExists = { [language: string]: boolean };
