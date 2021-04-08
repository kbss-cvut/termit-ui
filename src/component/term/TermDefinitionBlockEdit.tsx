import * as React from "react";
import { TermData } from "../../model/Term";
import ValidationResult from "../../model/ValidationResult";
import { Button, Col, FormGroup, Label, Row } from "reactstrap";
import TextArea from "../misc/TextArea";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import CustomInput from "../misc/CustomInput";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";
import { renderValidationMessages } from "./forms/FormUtils";
import "./TermDefinitionBlock.scss";
import { useI18n } from "../hook/useI18n";

interface TermDefinitionBlockEditProps {
  term: TermData;
  language: string;
  definitionSelector?: () => void;
  getValidationResults?: (property: string) => ValidationResult[];
  onChange: (change: Partial<TermData>) => void;
  readOnly?: boolean;
}

export const TermDefinitionBlockEdit: React.FC<TermDefinitionBlockEditProps> = (
  props
) => {
  const { term, language, getValidationResults, onChange, readOnly } = props;
  const { i18n, locale } = useI18n();
  const onDefinitionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const change = {};
    change[language] = value;
    onChange({ definition: Object.assign({}, term.definition, change) });
  };
  const onSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const src = e.currentTarget.value;
    props.onChange({ sources: [src] });
  };
  const source = term.sources
    ? Utils.sanitizeArray(term.sources!).join()
    : undefined;
  const validationDefinition = getValidationResults!(
    VocabularyUtils.DEFINITION
  );
  const validationSource = getValidationResults!(VocabularyUtils.DC_SOURCE);

  return (
    <>
      <Row>
        <Col xs={12}>
          {props.definitionSelector ? (
            <FormGroup
              id="create-term-select-definition-group"
              style={{ marginBottom: 0 }}
            >
              <Label className="attribute-label definition">
                {i18n("term.metadata.definition.text")}
              </Label>
              <Button
                id="create-term-select-definition"
                color="muted"
                onClick={props.definitionSelector}
                size="sm"
                title={i18n("annotator.createTerm.selectDefinition.tooltip")}
                style={{ float: "right" }}
              >
                {i18n("annotator.createTerm.selectDefinition")}
              </Button>
            </FormGroup>
          ) : (
            <FormGroup style={{ marginBottom: 0 }}>
              <Label className="attribute-label definition">
                {i18n("term.metadata.definition.text")}
              </Label>
            </FormGroup>
          )}
          <TextArea
            name="edit-term-definition"
            value={getLocalizedOrDefault(term.definition, "", language)}
            invalid={validationDefinition.length > 0}
            readOnly={readOnly}
            invalidMessage={renderValidationMessages(
              locale,
              validationDefinition
            )}
            onChange={onDefinitionChange}
            rows={4}
            help={i18n("term.definition.help")}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <CustomInput
            name="edit-term-source"
            value={source}
            onChange={onSourceChange}
            label={i18n("term.metadata.source")}
            labelClass="definition"
            invalid={validationSource.length > 0}
            readOnly={readOnly}
            invalidMessage={renderValidationMessages(locale, validationSource)}
            help={i18n("term.source.help")}
          />
        </Col>
      </Row>
    </>
  );
};

TermDefinitionBlockEdit.defaultProps = {
  getValidationResults: () => [],
  readOnly: false,
};

export default TermDefinitionBlockEdit;
