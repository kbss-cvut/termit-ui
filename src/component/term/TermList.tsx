import Term, { TermInfo } from "../../model/Term";
// @ts-ignore
import { Col, Label, List, Row } from "reactstrap";
import TermLink from "./TermLink";
import VocabularyNameBadge from "../vocabulary/VocabularyNameBadge";
import * as React from "react";

interface TermListProps {
  terms: (Term | TermInfo)[];
  label: string;
  id: string;
  vocabularyIri?: string;
  language: string;

  addonBeforeRenderer?: (t: Term | TermInfo) => JSX.Element | undefined | null; // An element to render before the term link
}

const TermList: React.FC<TermListProps> = (props) => {
  const { terms, label, id, language, vocabularyIri, addonBeforeRenderer } =
    props;
  return (
    <Row>
      <Col xl={2} md={4}>
        <Label className="attribute-label mb-3">{label}</Label>
      </Col>
      <Col xl={10} md={8}>
        <List type="unstyled" id={id} className="mb-3">
          {terms.map((item) => (
            <li key={item.iri}>
              {addonBeforeRenderer && addonBeforeRenderer(item)}
              <TermLink term={item} language={language} />
              {vocabularyIri !== item.vocabulary?.iri && (
                <VocabularyNameBadge vocabulary={item.vocabulary} />
              )}
            </li>
          ))}
        </List>
      </Col>
    </Row>
  );
};

export default TermList;
