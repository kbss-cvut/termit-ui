import Ajax, { params } from "../../util/Ajax";
import Constants from "../../util/Constants";
import { IRI } from "../../util/VocabularyUtils";
import { TermData } from "../../model/Term";
import { getLocalized } from "../../model/MultilingualString";

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
  labelExists: LabelExists
): boolean {
  const languages = Object.keys(data.label);
  for (const lang of languages) {
    if (!isLabelValid(data, lang) || labelExists[lang]) {
      return false;
    }
  }
  return true;
}

export function isTermValid<T extends TermData>(
  data: T,
  labelExists: LabelExists
) {
  return (
    data.iri !== undefined &&
    data.iri.trim().length > 0 &&
    labelInEachLanguageValid(data, labelExists)
  );
}

export function isLabelValid<T extends TermData>(data: T, language: string) {
  const localizedLabel = getLocalized(data.label, language);
  return localizedLabel !== undefined && localizedLabel.trim().length > 0;
}

export type LabelExists = { [language: string]: boolean };
