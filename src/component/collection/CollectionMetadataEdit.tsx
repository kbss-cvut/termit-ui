import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Button,
  ButtonToolbar,
  Card,
  CardBody,
  Col,
  Form,
  FormText,
  Label,
  Row,
} from "reactstrap";
import Toggle from "react-bootstrap-toggle";
import { useDispatch } from "react-redux";
import { SkosCollectionDto } from "../../model/Collection";
import Vocabulary from "../../model/Vocabulary";
import MultilingualString, {
  getLocalizedOrDefault,
  hasNonBlankValue,
} from "../../model/MultilingualString";
import { useI18n } from "../hook/useI18n";
import EditLanguageSelector from "../multilingual/EditLanguageSelector";
import CustomInput from "../misc/CustomInput";
import MarkdownEditor from "../misc/MarkdownEditor";
import MultilingualIcon from "../misc/MultilingualIcon";
import Constants from "../../util/Constants";
import {
  getLanguages,
  getLanguagesWithRequired,
  removeTranslation,
} from "../../util/IntlUtil";
import ValidationResult from "../../model/form/ValidationResult";
import Message from "../../model/Message";
import MessageType from "../../model/MessageType";
import { publishMessage } from "../../action/SyncActions";
import { ThunkDispatch } from "../../util/Types";
import "../misc/CustomToggle.scss";
import { TOGGLE_STYLE } from "../term/TermListToggle";

export interface CollectionMetadataEditProps {
  collection?: SkosCollectionDto;
  vocabulary: Vocabulary;
  initialShortLocale: string;
  onCloseEdit: () => void;
}

interface CollectionMetadataEditState {
  title: MultilingualString;
  description: MultilingualString;
  ordered: boolean;
}

export const CollectionMetadataEdit: FunctionComponent<
  CollectionMetadataEditProps
> = ({ collection, vocabulary, initialShortLocale, onCloseEdit }) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [selectedLanguage, setSelectedLanguage] = useState(initialShortLocale);

  const [data, setData] = useState<CollectionMetadataEditState>(() =>
    collection
      ? {
          title: { ...collection.title },
          description: { ...collection.description },
          ordered: collection.isOrdered(),
        }
      : { title: {}, description: {}, ordered: false }
  );

  const languages = useMemo(() => {
    if (vocabulary.primaryLanguage != null) {
      return getLanguagesWithRequired(
        vocabulary.primaryLanguage,
        SkosCollectionDto.MULTILINGUAL_ATTRIBUTES,
        data
      );
    }
    return getLanguages(SkosCollectionDto.MULTILINGUAL_ATTRIBUTES, data);
  }, [data, vocabulary.primaryLanguage]);

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setData((prev) => ({
      ...prev,
      title: { ...prev.title, [selectedLanguage]: value },
    }));
  };

  const onDescriptionChange = useCallback(
    (value: string) => {
      setData((prev) => ({
        ...prev,
        description: { ...prev.description, [selectedLanguage]: value },
      }));
    },
    [selectedLanguage]
  );

  const onOrderedToggle = () => {
    setData((prev) => ({ ...prev, ordered: !prev.ordered }));
  };

  const onRemoveTranslation = (lang: string) => {
    if (lang === vocabulary.primaryLanguage) {
      dispatch(
        publishMessage(
          new Message(
            {
              messageId:
                "asset.modify.error.cannotRemoveVocabularyPrimaryLanguage",
            },
            MessageType.ERROR
          )
        )
      );
      setSelectedLanguage(selectedLanguage);
      return;
    }
    const copy = {
      ...data,
      title: { ...data.title },
      description: { ...data.description },
    };
    removeTranslation(SkosCollectionDto.MULTILINGUAL_ATTRIBUTES, copy, lang);
    setData(copy);
  };

  const titleValidation = hasNonBlankValue(data.title, selectedLanguage)
    ? []
    : [ValidationResult.BLOCKER];
  const isInvalid = !hasNonBlankValue(data.title, vocabulary.primaryLanguage);

  const onSave = () => {
    if (isInvalid) {
      return;
    }
    // save(
    //   new SkosCollectionDto({
    //     ...collection,
    //     title: data.title,
    //     description: data.description,
    //   })
    // );
  };

  return (
    <>
      <EditLanguageSelector
        key="collection-edit-language-selector"
        language={selectedLanguage}
        existingLanguages={languages}
        requiredLanguage={vocabulary.primaryLanguage}
        onSelect={setSelectedLanguage}
        onRemove={onRemoveTranslation}
      />
      <Card id="edit-collection">
        <CardBody>
          <Form>
            <Row>
              <Col xs={12}>
                <CustomInput
                  name="edit-collection-title"
                  value={getLocalizedOrDefault(
                    data.title,
                    "",
                    selectedLanguage
                  )}
                  onChange={onTitleChange}
                  label={
                    <>
                      {i18n("asset.label")}
                      <MultilingualIcon id="edit-collection-title-multilingual" />
                    </>
                  }
                  validation={titleValidation}
                  hint={i18n("required")}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <MarkdownEditor
                  name="edit-collection-description"
                  label={i18n("collection.description")}
                  value={getLocalizedOrDefault(
                    data.description,
                    "",
                    selectedLanguage
                  )}
                  onChange={onDescriptionChange}
                  renderMarkdownHint={true}
                  maxHeight={Constants.MARKDOWN_EDITOR_HEIGHT}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12} className={"d-flex flex-column"}>
                <Label className={"attribute-label mb-1"}>
                  {i18n("collection.ordered.toggle.description")}
                </Label>
                <Toggle
                  id="edit-collection-ordered"
                  onClick={onOrderedToggle}
                  on={i18n("collection.ordered")}
                  off={i18n("collection.ordered")}
                  onstyle="primary"
                  offstyle="secondary"
                  size="sm"
                  onClassName="toggle-custom"
                  offClassName="toggle-custom"
                  handleClassName="toggle-handle-custom"
                  style={TOGGLE_STYLE}
                  active={data.ordered}
                  recalculateOnResize={true}
                  disabled={collection != null}
                />
                <FormText>{i18n("collection.ordered.toggle.help")}</FormText>
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <ButtonToolbar className="d-flex justify-content-center mt-4">
                  <Button
                    id="edit-collection-submit"
                    color="success"
                    disabled={isInvalid}
                    size="sm"
                    onClick={onSave}
                  >
                    {i18n("save")}
                  </Button>
                  <Button
                    id="edit-collection-cancel"
                    color="outline-dark"
                    size="sm"
                    onClick={onCloseEdit}
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
