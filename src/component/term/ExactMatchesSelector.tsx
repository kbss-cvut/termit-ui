import * as React from "react";
import Term, { TermData } from "../../model/Term";
import { Label } from "reactstrap";
import Utils from "../../util/Utils";
import HelpIcon from "../misc/HelpIcon";
import { TermSelector } from "./TermSelector";
import { useI18n } from "../hook/useI18n";

/**
 * Filters out terms that are either in the current vocabulary or are in the
 * hiddenTermIris set.
 * @param terms The list of terms to filter.
 * @param currentVocabularyIri The IRI of the current vocabulary to exclude.
 * @param hiddenTermIris A set of IRIs to exclude from the results.
 * @returns A new array of terms that do not include the current vocabulary or
 * any terms in the hiddenTermIris set.
 */
function filterOutHiddenTerms(
  terms: Term[],
  currentVocabularyIri: string,
  hiddenTermIris?: Set<string>
) {
  const result: Term[] = [];
  for (const t of terms) {
    if (
      t.vocabulary?.iri === currentVocabularyIri ||
      hiddenTermIris?.has(t.iri!)
    ) {
      continue;
    }
    if (t.plainSubTerms) {
      t.plainSubTerms = t
        .subTerms!.filter(
          (st) =>
            st.vocabulary?.iri !== currentVocabularyIri &&
            !hiddenTermIris?.has(st.iri!)
        )
        .map((st) => st.iri!);
    }
    result.push(t);
  }
  return result;
}

const ExactMatchesSelector: React.FC<{
  id: string;
  termIri?: string;
  hiddenTermIris?: Set<string>;
  selected?: TermData[];
  vocabularyIri: string;
  onChange: (exactMatches: Term[]) => void;
}> = ({ id, termIri, hiddenTermIris, selected, vocabularyIri, onChange }) => {
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
        filterOutHiddenTerms(terms, vocabularyIri, hiddenTermIris)
      }
    />
  );
};

export default ExactMatchesSelector;
