import React from "react";
import RdfsResource, {
  CreateRdfPropertyData,
  RdfProperty,
} from "../../../model/RdfsResource";
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
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { CustomAttributeRangeSelector } from "./CustomAttributeRangeSelector";
import HeaderWithActions from "../../misc/HeaderWithActions";
import Routes from "../../../util/Routes";
import Routing from "../../../util/Routing";
import { trackPromise } from "react-promise-tracker";
import { ThunkDispatch } from "../../../util/Types";
import {
  createCustomAttribute,
  updateCustomAttribute,
} from "../../../action/AsyncActions";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { useParams } from "react-router-dom";

function propertyWithLabelExists(
  label: string,
  language: string,
  properties: RdfsResource[],
  customAttributes: RdfProperty[]
) {
  return (
    customAttributes.some((p) => (p.label || {})[language] === label) ||
    properties.some((p) => (p.label || {})[language] === label)
  );
}

export const CustomAttributeEdit: React.FC = () => {
  const { i18n, formatMessage, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const { name } = useParams<{ name?: string }>();
  const [label, setLabel] = React.useState<MultilingualString>({});
  const [originalLabel, setOriginalLabel] = React.useState<MultilingualString>(
    {}
  );
  const [comment, setComment] = React.useState<MultilingualString>({});
  const [range, setRange] = React.useState<string>("");
  const [language, setLanguage] = React.useState(getShortLocale(locale));
  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );
  const properties = useSelector((state: TermItState) => state.properties);
  const editedAttribute = React.useMemo(
    () => customAttributes.find((p) => p.iri.endsWith("/" + name)),
    [customAttributes, name]
  );
  const editingMode = React.useMemo(() => name !== "create", [name]);
  React.useEffect(() => {
    if (editingMode) {
      if (editedAttribute) {
        setLabel(editedAttribute.label || {});
        setOriginalLabel(editedAttribute.label || {});
        setComment(editedAttribute.comment || {});
        setRange(editedAttribute.rangeIri || "");
      }
    }
  }, [editingMode, editedAttribute]);

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
  const labelValidation =
    (!editingMode || label[language] !== originalLabel[language]) &&
    propertyWithLabelExists(
      label[language],
      language,
      properties,
      customAttributes
    )
      ? ValidationResult.blocker(
          formatMessage(
            "administration.customization.customAttributes.labelExists",
            {
              label: label[language],
            }
          )
        )
      : undefined;
  const onCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newComment = { ...comment };
    newComment[language] = e.target.value;
    setComment(newComment);
  };
  const goToAdministration = () => {
    Routing.transitionTo(Routes.administration, {
      query: new Map<string, string>([
        ["activeTab", "administration.customization.title"],
      ]),
    });
  };

  const onSave = () => {
    let promise;
    if (editingMode) {
      const data = new RdfProperty({
        ...editedAttribute!,
        label,
        comment,
        range,
      });
      promise = dispatch(updateCustomAttribute(data));
    } else {
      promise = dispatch(
        createCustomAttribute(
          new CreateRdfPropertyData({
            label,
            comment,
            range,
          })
        )
      );
    }
    trackPromise(promise, "custom-attribute-edit").then(() => {
      goToAdministration();
    });
  };
  const onCancel = () => {
    goToAdministration();
  };

  return (
    <>
      <HeaderWithActions
        title={i18n(
          `administration.customization.customAttributes.${
            editingMode ? "update" : "add"
          }`
        )}
      />
      <PromiseTrackingMask area="custom-attribute-edit" />
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
                  disabled={editingMode}
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
