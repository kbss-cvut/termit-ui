import * as React from "react";
import Term from "../../model/Term";
import Utils from "../../util/Utils";
// @ts-ignore
import { Col, Label, List, Row } from "reactstrap";
import TermLink from "./TermLink";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import OutgoingLink from "../misc/OutgoingLink";
import { getLocalized } from "../../model/MultilingualString";
import { useI18n } from "../hook/useI18n";
import VocabularyNameBadge from "../vocabulary/VocabularyNameBadge";

interface ParentTermsListProps {
  parentTerms?: Term[] | Term;
  language: string;
}

const ParentTermsList: React.FC<ParentTermsListProps> = (props) => {
  const { parentTerms, language } = props;
  const { i18n } = useI18n();
  const workspace = useSelector((state: TermItState) => state.workspace)!;

  const parents = Utils.sanitizeArray(parentTerms);
  parents.sort(Utils.labelComparator);
  return (
    <Row>
      <Col xl={2} md={4}>
        <Label className="attribute-label mb-3">
          {i18n("term.metadata.parent")}
        </Label>
      </Col>
      <Col xl={10} md={8}>
        <List type="unstyled" id="term-metadata-parentterms" className="mb-3">
          {parents.map((item) => (
            <li key={item.iri}>
              {workspace.containsVocabulary(item.vocabulary!.iri!) ? (
                <>
                  <VocabularyNameBadge
                    className="mr-1 align-text-bottom"
                    vocabulary={item.vocabulary}
                  />
                  <TermLink term={item} language={language} />
                </>
              ) : (
                <OutgoingLink
                  label={
                    <>
                      <VocabularyNameBadge
                        className="mr-1 align-text-bottom"
                        vocabulary={item.vocabulary}
                      />
                      {getLocalized(item.label, language)}
                    </>
                  }
                  iri={item.iri}
                />
              )}
            </li>
          ))}
        </List>
      </Col>
    </Row>
  );
};

export default ParentTermsList;
