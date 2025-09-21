import * as React from "react";
import Term, { TermInfo } from "../../model/Term";
import { Label } from "reactstrap";
import HelpIcon from "../misc/HelpIcon";
import DefinitionRelatedTermsEdit, {
  DefinitionRelatedChanges,
} from "./DefinitionRelatedTermsEdit";
import { useI18n } from "../hook/useI18n";
import { TermSelector } from "./TermSelector";

const RelatedTermsSelector: React.FC<{
  id: string;
  term: Term;
  vocabularyIri: string;
  selected: TermInfo[];
  onChange: (value: Term[]) => void;
  language: string;

  definitionRelatedChanges: DefinitionRelatedChanges;
  onDefinitionRelatedChange: (change: DefinitionRelatedChanges) => void;
}> = ({
  id,
  term,
  vocabularyIri,
  selected,
  onChange,
  language,
  definitionRelatedChanges,
  onDefinitionRelatedChange,
}) => {
  const { i18n } = useI18n();

  const handleChange = (terms: readonly Term[]) => {
    onChange(terms.filter((v) => v.iri !== term.iri));
  };

  return (
    <>
      <TermSelector
        id={id}
        label={
          <Label className="attribute-label">
            {i18n("term.metadata.related.title")}
            <HelpIcon
              id="related-term-select"
              text={i18n("term.metadata.related.help")}
            />
          </Label>
        }
        value={selected}
        onChange={handleChange}
        vocabularyIri={vocabularyIri}
        suffix={
          <DefinitionRelatedTermsEdit
            term={term}
            language={language}
            pending={definitionRelatedChanges}
            onChange={onDefinitionRelatedChange}
          />
        }
      />
    </>
  );
};

export default RelatedTermsSelector;
