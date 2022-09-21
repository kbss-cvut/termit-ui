import Term from "../../model/Term";
import React from "react";
import { useDispatch } from "react-redux";
import { useI18n } from "../hook/useI18n";
// @ts-ignore
import { Col, Label, List, Row } from "reactstrap";
import { loadDefinitionRelatedTermsTargeting } from "../../action/AsyncTermActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermLink from "./TermLink";
import VocabularyNameBadge from "../vocabulary/VocabularyNameBadge";
import DefinitionRelatedTerms from "./DefinitionRelatedTerms";
import { ThunkDispatch } from "../../util/Types";

interface RelatedTermsListProps {
  term: Term;
  language: string;
}

const RelatedTermsList: React.FC<RelatedTermsListProps> = (props) => {
  const { term, language } = props;
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(
      loadDefinitionRelatedTermsTargeting(VocabularyUtils.create(term.iri))
    );
  }, [dispatch, term.iri, term.vocabulary]);
  const terms = React.useMemo(
    () => Term.consolidateRelatedAndRelatedMatch(term),
    [term]
  );
  return (
    <Row>
      <Col xl={2} md={4}>
        <Label className="attribute-label mb-3">
          {i18n("term.metadata.related.title")}
        </Label>
      </Col>
      <Col xl={10} md={8}>
        <List type="unstyled" id="term-metadata-related" className="mb-3">
          {terms.map((item) => (
            <li key={`${item.iri}`}>
              <TermLink term={item} language={language} />
              {term.vocabulary?.iri !== item.vocabulary?.iri && (
                <VocabularyNameBadge vocabulary={item.vocabulary} />
              )}
            </li>
          ))}
          <DefinitionRelatedTerms
            term={term}
            relatedTerms={terms}
            language={language}
          />
        </List>
      </Col>
    </Row>
  );
};

export default RelatedTermsList;
