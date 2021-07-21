import * as React from "react";
import { Col, Row } from "reactstrap";
import Term from "../../model/Term";
import AttributeSectionContainer from "./../layout/AttributeSectionContainer";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import TermDefinitionSource from "./TermDefinitionSource";
import {useI18n} from "../hook/useI18n";

export interface TermDefinitionBlockProps {
  term: Term;
  language: string;
  withDefinitionSource?: boolean;
}

export const TermDefinitionBlock: React.FC<TermDefinitionBlockProps> = (
  props
) => {
  const { term, language } = props;
  const {i18n} = useI18n();
  return (
    <AttributeSectionContainer label={i18n("term.metadata.definition")}>
      <Row>
        <Col xs={12}>
          <p id="term-metadata-definition" className="lead mb-1">
            {getLocalizedOrDefault(term.definition, "", language)}
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
    </AttributeSectionContainer>
  );
};

TermDefinitionBlock.defaultProps = {
  withDefinitionSource: false,
};

export default TermDefinitionBlock;
