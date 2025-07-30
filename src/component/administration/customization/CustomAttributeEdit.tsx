import React from "react";
import RdfsResource, { RdfProperty } from "../../../model/RdfsResource";
import { useI18n } from "../../hook/useI18n";
import MultilingualString, {
  getLocalizedOrDefault,
  isBlank,
} from "../../../model/MultilingualString";
import { getLanguages, getShortLocale } from "../../../util/IntlUtil";
import EditLanguageSelector from "../../multilingual/EditLanguageSelector";
import {
  Button,
  ButtonToolbar,
  Card,
  CardBody,
  Col,
  Form,
  Row,
} from "reactstrap";
import CustomInput from "../../misc/CustomInput";
import MultilingualIcon from "../../misc/MultilingualIcon";
import ValidationResult from "../../../model/form/ValidationResult";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { CustomAttributeRangeSelector } from "./CustomAttributeRangeSelector";
import HeaderWithActions from "../../misc/HeaderWithActions";

function propertyWithLabelExists(
  label: string,
  language: string,
  properties: RdfsResource[],
  customProperties: RdfProperty[]
) {
  return (
    customProperties.some((p) => (p.label || {})[language] === label) ||
    properties.some((p) => (p.label || {})[language] === label)
  );
}

export const CustomAttributeEdit: React.FC<{ attribute?: RdfProperty }> = ({
  attribute,
}) => {
  const { i18n, formatMessage, locale } = useI18n();
  const [label, setLabel] = React.useState<MultilingualString>(
    attribute?.label || {}
  );
  const [comment, setComment] = React.useState<MultilingualString>(
    attribute?.comment || {}
  );
  const [range, setRange] = React.useState(attribute?.range || "");
  const [language, setLanguage] = React.useState(getShortLocale(locale));
  const customAttributes = useSelector(
    (state: TermItState) => state.customProperties
  );
  const properties = useSelector((state: TermItState) => state.properties);

  const onRemoveTranslation = (lang: string) => {
    const newLabel = { ...label };
    delete newLabel[lang];
    const newComment = { ...comment };
    delete newComment[lang];
    setLabel(newLabel);
    setComment(newComment);
  };
  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = { ...label };
    newLabel[language] = e.target.value;
    setLabel(newLabel);
  };
  const labelValidation = propertyWithLabelExists(
    label[language],
    language,
    properties,
    customAttributes
  )
    ? ValidationResult.blocker(
        formatMessage(
          "administration.customization.customProperties.labelExists",
          {
            label,
          }
        )
      )
    : undefined;
  const onCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComment = { ...comment };
    newComment[language] = e.target.value;
    setComment(newComment);
  };

  const onSave = () => {};
  const onCancel = () => {};

  return (
    <>
      <HeaderWithActions
        title={i18n("administration.customization.customProperties.add")}
      />
      <EditLanguageSelector
        language={language}
        existingLanguages={getLanguages(["label", "comment"], {
          label,
          comment,
        })}
        onSelect={setLanguage}
        onRemove={onRemoveTranslation}
      />
      <Card id="custom-attribute-edit">
        <CardBody>
          <Form>
            <Row>
              <Col xs={12}>
                <CustomInput
                  name="custom-attribute-edit-label"
                  label={
                    <>
                      {i18n("properties.edit.new.label")}
                      <MultilingualIcon id="custom-attribute-edit-label-multilingual" />
                    </>
                  }
                  hint={i18n("required")}
                  onChange={onLabelChange}
                  autoFocus={true}
                  validation={labelValidation}
                  value={getLocalizedOrDefault(label, "", language)}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <CustomInput
                  name="custom-attribute-edit-comment"
                  label={
                    <>
                      {i18n("properties.edit.new.comment")}
                      <MultilingualIcon id="custom-attribute-edit-comment-multilingual" />
                    </>
                  }
                  onChange={onCommentChange}
                  value={getLocalizedOrDefault(comment, "", language)}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <CustomAttributeRangeSelector
                  onChange={setRange}
                  value={range}
                />
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <ButtonToolbar className="d-flex justify-content-center mt-4">
                  <Button
                    id="custom-attribute-edit-submit"
                    color="success"
                    onClick={onSave}
                    size="sm"
                    disabled={isBlank(label)}
                  >
                    {i18n("save")}
                  </Button>
                  <Button
                    id="custom-attribute-edit-cancel"
                    color="outline-dark"
                    size="sm"
                    onClick={onCancel}
                  >
                    {i18n("cancel")}
                  </Button>
                </ButtonToolbar>
              </Col>
            </Row>
          </Form>
        </CardBody>
      </Card>
    </>
  );
};
