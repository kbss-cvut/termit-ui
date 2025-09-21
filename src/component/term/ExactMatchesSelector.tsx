import * as React from "react";
import Term, { TermData } from "../../model/Term";
import { Label } from "reactstrap";
import Utils from "../../util/Utils";
import HelpIcon from "../misc/HelpIcon";
import { TermSelector } from "./TermSelector";
import { useI18n } from "../hook/useI18n";

function filterOutTermsFromCurrentVocabulary(
  terms: Term[],
  currentVocabularyIri: string
) {
  const result = terms.filter(
    (t) => t.vocabulary!.iri !== currentVocabularyIri
  );
  result
    .filter((t) => t.plainSubTerms)
    .forEach(
      (t) =>
        (t.plainSubTerms = t
          .subTerms!.filter((st) => st.vocabulary?.iri !== currentVocabularyIri)
          .map((st) => st.iri))
    );
  return result;
}

const ExactMatchesSelector: React.FC<{
  id: string;
  termIri?: string;
  selected?: TermData[];
  vocabularyIri: string;
  onChange: (exactMatches: Term[]) => void;
}> = ({ id, termIri, selected, vocabularyIri, onChange }) => {
  const { i18n } = useI18n();

  const handleChange = (terms: readonly Term[]) => {
    onChange(terms.filter((t) => t.iri !== termIri));
  };

  return (
    <TermSelector
      id={id}
      label={
        <Label className="attribute-label">
          {i18n("term.metadata.exactMatches")}
          <HelpIcon
            id="exact-match-select"
            text={i18n("term.exactMatches.help")}
          />
        </Label>
      }
      value={Utils.sanitizeArray(selected)}
      vocabularyIri={vocabularyIri}
      onChange={handleChange}
      fetchedTermsFilter={(terms) =>
        filterOutTermsFromCurrentVocabulary(terms, vocabularyIri)
      }
    />
  );
};

export default ExactMatchesSelector;
