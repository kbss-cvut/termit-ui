import * as React from "react";
import Term, { createTermComparator, TermInfo } from "../../model/Term";
// @ts-ignore
import { Col, Label, List, Row } from "reactstrap";
import TermLink from "./TermLink";
import Utils from "../../util/Utils";
import VocabularyNameBadgeButton from "../vocabulary/VocabularyNameBadgeButton";
import { createTermNonTerminalStateMatcher } from "./TermTreeSelectHelper";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";

interface TermListProps {
  terms?: (Term | TermInfo)[];
  label: string;
  id: string;
  vocabularyIri?: string;
  language: string;

  addonBeforeRenderer?: (
    t: Term | TermInfo
  ) => React.JSX.Element | undefined | null; // An element to render before the term link
}

const TermList: React.FC<TermListProps> = (props) => {
  const { terms, label, id, language, vocabularyIri, addonBeforeRenderer } =
    props;
  const terminalStates = useSelector(
    (state: TermItState) => state.terminalStates
  );
  const terminalStateFilter = createTermNonTerminalStateMatcher(terminalStates);
  const toRender = Utils.sanitizeArray(terms).filter(terminalStateFilter);
  toRender.sort(createTermComparator(language));
  return (
    <Row>
      <Col xl={2} md={4}>
        <Label className="attribute-label mb-3">{label}</Label>
      </Col>
      <Col xl={10} md={8}>
        <List type="unstyled" id={id} className="mb-3">
          {toRender.map((item, index) => (
            <li key={`${item.iri}-${index}`}>
              {addonBeforeRenderer && addonBeforeRenderer(item)}
              <TermLink term={item} language={language} />
              {vocabularyIri !== item.vocabulary?.iri && (
                <VocabularyNameBadgeButton
                  vocabulary={item.vocabulary}
                  termIri={item.iri}
                  section={"terms-"}
                />
              )}
            </li>
          ))}
        </List>
      </Col>
    </Row>
  );
};

export default TermList;
