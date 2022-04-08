import * as React from "react";
import { Col, Row } from "reactstrap";
import Term from "../../model/Term";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import TermDefinitionSource from "./TermDefinitionSource";
import { useI18n } from "../hook/useI18n";
import "./TermDefinitionBlock.scss";
import MarkdownView from "../misc/MarkdownView";

export interface TermDefinitionBlockProps {
  term: Term;
  language: string;
  withDefinitionSource?: boolean;
}

export const TermDefinitionBlock: React.FC<TermDefinitionBlockProps> = (
  props
) => {
  const { term, language } = props;
  const { i18n } = useI18n();
  return (
    <>
      <hr
        className="definition-separator-text"
        data-content={i18n("term.metadata.definition")}
      />
      <Row>
        <Col xs={12}>
          <p id="term-metadata-definition" className="definition-text mb-1">
            <MarkdownView>
              {getLocalizedOrDefault(term.definition, "", language)}
            </MarkdownView>
          </p>
        </Col>
      </Row>
      <Row>
        <TermDefinitionSource
          term={term}
          language={language}
          withDefinitionSource={props.withDefinitionSource}
        />
      </Row>
      <hr className="definition-separator" />
    </>
  );
};

TermDefinitionBlock.defaultProps = {
  withDefinitionSource: false,
};

export default TermDefinitionBlock;
