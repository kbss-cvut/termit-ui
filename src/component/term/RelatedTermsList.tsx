import Term, { TermInfo } from "../../model/Term";
import React from "react";
import { useSelector } from "react-redux";
import TermItState, {
  DefinitionallyRelatedTerms,
} from "../../model/TermItState";
import TermList from "./TermList";
import { useI18n } from "../hook/useI18n";
import { Badge } from "reactstrap";

interface RelatedTermsListProps {
  term: Term;
  language: string;
}

const RelatedTermsList: React.FC<RelatedTermsListProps> = (props) => {
  const { term, language } = props;
  const { i18n } = useI18n();
  const definitionallyRelatedTerms = useSelector(
    (state: TermItState) => state.definitionallyRelatedTerms
  );
  const terms = Term.consolidateRelatedAndRelatedMatch(term);
  const badgeRenderer = (t: Term | TermInfo) => {
    if (isRelatedViaDefinition(t, definitionallyRelatedTerms)) {
      return (
        <Badge
          className="mr-1"
          color="secondary"
          title={i18n("term.metadata.related.definitionally.tooltip")}
        >
          {i18n("term.metadata.definition")}
        </Badge>
      );
    }
    return null;
  };
  return (
    <TermList
      id={"term-metadata-related"}
      terms={terms}
      language={language}
      label={i18n("term.metadata.related.title")}
      vocabularyIri={term.vocabulary?.iri}
      addonBeforeRenderer={badgeRenderer}
    />
  );
};

/**
 * Checks whether the specified related term is related (also) via definition.
 *
 * That is, it occurs in the definition of the current term or vice versa.
 */
function isRelatedViaDefinition(
  relatedTerm: Term | TermInfo,
  defRelatedTerms: DefinitionallyRelatedTerms
): boolean {
  const found = defRelatedTerms.targeting.find(
    (o) => o.term.iri === relatedTerm.iri
  );
  if (found) {
    return true;
  }
  return (
    defRelatedTerms.of.find((o) => o.target.source.iri === relatedTerm.iri) !==
    undefined
  );
}

export default RelatedTermsList;
