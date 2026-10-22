import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  getShortLocale,
  removeTranslation,
} from "../../util/IntlUtil";
import ValidationResult from "../../model/form/ValidationResult";
import Message from "../../model/Message";
import MessageType from "../../model/MessageType";
import { publishMessage } from "../../action/SyncActions";
import { ThunkDispatch, useAppSelector } from "../../util/Types";
import "../misc/CustomToggle.scss";
import { TOGGLE_STYLE } from "../term/TermListToggle";
import ShowAdvancedAssetFields from "../asset/ShowAdvancedAssetFields";
import { loadIdentifier } from "../asset/CreateAssetUtils";
import { useDebouncedCallback } from "use-debounce";
import {
  createSkosCollection,
  loadSkosCollection,
  updateSkosCollection,
} from "../../action/AsyncCollectionActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import { useCollectionUri, useVocabularyUri } from "./CollectionUtils";
import { loadVocabulary } from "../../action/AsyncActions";
import { AsyncAction, AsyncFailureAction } from "../../action/ActionType";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";

export interface CollectionMetadataEditProps {}

interface CollectionMetadataEditState {
  iri: string;
  title: MultilingualString;
  description: MultilingualString;
  ordered: boolean;
}

const COLLECTION_LOAD_PROMISE_AREA = "collection-metadata-edit-promise-area";

const CollectionMetadataEdit: FunctionComponent<
  CollectionMetadataEditProps
> = () => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();

  const collectionUri = useCollectionUri();
  const vocabularyUri = useVocabularyUri();

  const [selectedLanguage, setSelectedLanguage] = useState(
    getShortLocale(locale)
  );

  const vocabulary = useAppSelector((state) => state.vocabulary);

  useEffect(() => {
    if (vocabulary?.iri !== vocabularyUri.toString()) {
      dispatch(loadVocabulary(vocabularyUri));
    }
  }, [dispatch, vocabulary?.iri, vocabularyUri]);

  const [collection, setCollection] = useState<SkosCollectionDto | null>(null);

  const loadCollection = useCallback(() => {
    if (!collectionUri) {
      return;
    }

    // TODO track promise
    trackPromise(
      dispatch(loadSkosCollection(collectionUri, vocabularyUri)),
      COLLECTION_LOAD_PROMISE_AREA
    ).then((result) => {
      if (result.status === AsyncActionStatus.SUCCESS && "payload" in result) {
        setCollection(result.payload);
      }
    });
  }, [collectionUri, dispatch, vocabularyUri]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const isNewCollection = collection == null;
  // the identifier is generated from the title until the user modifies it manually
  const generateIri = useRef(isNewCollection);

  const [data, setData] = useState<CollectionMetadataEditState>(() => ({
    iri: "",
    title: {},
    description: {},
    ordered: false,
  }));

  useEffect(() => {
    if (collection) {
      setData({
        iri: collection.iri,
        title: { ...collection.title },
        description: { ...collection.description },
        ordered: collection.isOrdered(),
      });
    }
  }, [collection]);

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
    resolveIdentifier(value);
  };

  const resolveIdentifier = (title: string) => {
    const isPrimaryLanguage =
      vocabulary.primaryLanguage == null ||
      selectedLanguage === vocabulary.primaryLanguage;
    if (!generateIri.current || !isPrimaryLanguage || title.trim() === "") {
      return;
    }
    loadIdentifier({
      name: title.trim(),
      contextIri: vocabulary.iri,
      assetType: "COLLECTION",
    }).then((response) => {
      if (generateIri.current) {
        setData((prev) => ({ ...prev, iri: response.data }));
      }
    });
  };

  const onIriChange = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      generateIri.current = false;
      setData((prev) => ({ ...prev, iri: value }));
    },
    Constants.INPUT_DEBOUNCE_WAIT_TIME
  );

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

    const collection = new SkosCollectionDto({
      iri: data.iri,
      title: data.title,
      description: data.description,
      vocabulary: { iri: vocabulary.iri },
      types: data.ordered ? [VocabularyUtils.SKOS_ORDERED_COLLECTION] : [],
    });

    let promise: Promise<AsyncAction | AsyncFailureAction>;

    if (isNewCollection) {
      promise = dispatch(createSkosCollection(collection));
    } else {
      promise = dispatch(updateSkosCollection(collection));
    }

    promise.then((result) => {
      if (result.status === AsyncActionStatus.SUCCESS) {
        Routing.transitionTo(
          Routes.vocabularyCollectionDetail,
          Routing.makeCollectionDetailParams(collection)
        );
      }
    });
  };

  const onCancel = () => {
    if (isNewCollection) {
      Routing.transitionToAsset(vocabulary);
    } else {
      Routing.transitionTo(
        Routes.vocabularyCollectionDetail,
        Routing.makeCollectionDetailParams(collection)
      );
    }
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
            <Row className={"mb-3"}>
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
                  disabled={!isNewCollection}
                />
                <FormText>{i18n("collection.ordered.toggle.help")}</FormText>
              </Col>
            </Row>
            <ShowAdvancedAssetFields>
              <Row>
                <Col xs={12}>
                  <CustomInput
                    name="edit-collection-iri"
                    label={i18n("asset.iri")}
                    help={i18n("collection.iri.help")}
                    onChange={onIriChange}
                    value={data.iri}
                    disabled={!isNewCollection}
                  />
                </Col>
              </Row>
            </ShowAdvancedAssetFields>
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
      <PromiseTrackingMask area={COLLECTION_LOAD_PROMISE_AREA} />
    </>
  );
};

export default CollectionMetadataEdit;
