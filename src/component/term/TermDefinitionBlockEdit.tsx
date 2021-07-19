import * as React from "react";
import { TermData } from "../../model/Term";
import ValidationResult from "../../model/ValidationResult";
import FormValidationResult from "../../model/form/ValidationResult";
import { Button, Col, FormGroup, Label, Row } from "reactstrap";
import TextArea from "../misc/TextArea";
import { getLocalizedOrDefault } from "../../model/MultilingualString";
import CustomInput from "../misc/CustomInput";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";
import "./TermDefinitionBlock.scss";
import { useI18n } from "../hook/useI18n";
import MultilingualIcon from "../misc/MultilingualIcon";

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
                <MultilingualIcon id="term-definition-multilingual" />
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
                <MultilingualIcon id="term-definition-multilingual" />
              </Label>
            </FormGroup>
          )}
          <TextArea
            name="edit-term-definition"
            value={getLocalizedOrDefault(term.definition, "", language)}
            readOnly={readOnly}
            validation={validationDefinition.map((v) =>
              FormValidationResult.fromOntoValidationResult(v, locale)
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
            readOnly={readOnly}
            validation={validationSource.map((v) =>
              FormValidationResult.fromOntoValidationResult(v, locale)
            )}
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
