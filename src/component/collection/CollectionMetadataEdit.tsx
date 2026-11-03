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
  Label,
  Row,
} from "reactstrap";
import { useDispatch } from "react-redux";
import { CONTEXT, SkosCollection } from "../../model/Collection";
import MultilingualString, {
  getLocalizedOrDefault,
  hasNonBlankValue,
  isLanguageBlank,
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
import ShowAdvancedAssetFields from "../asset/ShowAdvancedAssetFields";
import { loadIdentifier } from "../asset/CreateAssetUtils";
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
import { useDebouncedCallback } from "use-debounce";
import CustomToggle from "../misc/CustomToggle";
import HelpIcon from "../misc/HelpIcon";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { PropertyValuesType } from "../../model/WithUnmappedProperties";
import UnmappedPropertiesEdit from "../genericmetadata/UnmappedPropertiesEdit";
import If from "../misc/If";
import { selectMultilingualCustomAttributeIris } from "../../store/StateSelectors";
import { cloneDeep } from "lodash";
import { getCustomAttributes } from "../../action/AsyncCustomizationActions";

export interface CollectionMetadataEditProps {}

interface CollectionMetadataEditState {
  iri: string;
  title: MultilingualString;
  description: MultilingualString;
  ordered: boolean;
  unmappedProperties: Map<string, PropertyValuesType>;
}

const COLLECTION_LOAD_PROMISE_AREA = "collection-metadata-edit-promise-area";

const IGNORED_ADDITIONAL_PROPERTIES = [
  ...Object.getOwnPropertyNames(CONTEXT).map((n) => CONTEXT[n]),
  VocabularyUtils.RDF_TYPE,
  VocabularyUtils.SKOS_MEMBER,
  VocabularyUtils.SKOS_MEMBER_LIST,
];

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
  const multilingualCustomAttributes = useAppSelector(
    selectMultilingualCustomAttributeIris
  );

  useEffect(() => {
    if (vocabulary?.iri !== vocabularyUri.toString()) {
      dispatch(loadVocabulary(vocabularyUri));
    }
  }, [dispatch, vocabulary?.iri, vocabularyUri]);

  const collection = useAppSelector((state) => state.selectedCollection);

  useEffect(() => {
    if (!collectionUri) {
      return;
    }

    trackPromise(
      dispatch(loadSkosCollection(collectionUri, vocabularyUri)),
      COLLECTION_LOAD_PROMISE_AREA
    );
  }, [collectionUri, dispatch, vocabularyUri]);

  const isNewCollection = collection == null;
  // the identifier is generated from the title until the user modifies it manually
  const generateIri = useRef(isNewCollection);

  const [data, setData] = useState<CollectionMetadataEditState>(() => ({
    iri: "",
    title: {},
    description: {},
    ordered: false,
    unmappedProperties: new Map(),
  }));

  useEffect(() => {
    if (collection) {
      setData({
        iri: collection.iri,
        title: { ...collection.title },
        description: { ...collection.description },
        ordered: collection.isOrdered(),
        unmappedProperties: cloneDeep(collection.unmappedProperties),
      });
      generateIri.current = false;
    }
  }, [collection]);

  useEffect(() => {
    dispatch(getCustomAttributes());
  }, [dispatch]);

  const languages = useMemo(() => {
    if (vocabulary.primaryLanguage != null) {
      return getLanguagesWithRequired(
        vocabulary.primaryLanguage,
        SkosCollection.MULTILINGUAL_ATTRIBUTES,
        data
      );
    }
    return getLanguages(SkosCollection.MULTILINGUAL_ATTRIBUTES, data);
  }, [data, vocabulary.primaryLanguage]);

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setData((prev) => ({
      ...prev,
      title: { ...prev.title, [selectedLanguage]: value },
    }));
    resolveIdentifier(value);
  };

  const resolveIdentifier = useDebouncedCallback((title: string) => {
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
        setData((prev) => ({ ...prev, iri: response }));
      }
    });
  }, Constants.INPUT_DEBOUNCE_WAIT_TIME);

  const onIriChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    generateIri.current = false;
    setData((prev) => ({ ...prev, iri: value }));
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

  const onUnmappedPropertiesChange = useCallback(
    (properties) =>
      setData((prev) => ({
        ...prev,
        unmappedProperties: cloneDeep(properties),
      })),
    []
  );

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
    const copy = cloneDeep(data);

    removeTranslation(SkosCollection.MULTILINGUAL_ATTRIBUTES, copy, lang);
    removeTranslation(
      multilingualCustomAttributes,
      copy.unmappedProperties,
      lang
    );

    setData(copy);
  };

  const titleValidation = hasNonBlankValue(data.title, selectedLanguage)
    ? []
    : [ValidationResult.BLOCKER];
  // invalid when any existing language is missing title
  const isInvalid = [...languages, selectedLanguage].some((lang) =>
    isLanguageBlank(lang, data.title)
  );

  const onSave = () => {
    if (isInvalid) {
      return;
    }

    const collection = new SkosCollection({
      iri: data.iri,
      title: data.title,
      description: data.description,
      vocabulary: { iri: vocabulary.iri },
      types: data.ordered ? [VocabularyUtils.SKOS_ORDERED_COLLECTION] : [],
    });
    collection.unmappedProperties = data.unmappedProperties;

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

  const IdentifierInput = useCallback(
    () => (
      <Row>
        <Col xs={12}>
          <CustomInput
            name="edit-collection-iri"
            label={i18n("asset.iri")}
            help={isNewCollection ? i18n("collection.iri.help") : undefined}
            onChange={onIriChange}
            value={data.iri}
            disabled={!isNewCollection}
          />
        </Col>
      </Row>
    ),
    [data.iri, i18n, isNewCollection]
  );

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
            <If expression={!isNewCollection}>
              <IdentifierInput />
            </If>
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
              <Col xs={12}>
                <CollectionTypeToggle
                  originalValue={collection?.isOrdered() ?? false}
                  value={data.ordered}
                  onToggle={onOrderedToggle}
                  isNewCollection={isNewCollection}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <UnmappedPropertiesEdit
                  assetType={"collection"}
                  properties={data.unmappedProperties}
                  onChange={onUnmappedPropertiesChange}
                  languages={languages}
                  language={selectedLanguage}
                  ignoredProperties={IGNORED_ADDITIONAL_PROPERTIES}
                />
              </Col>
            </Row>
            <If expression={isNewCollection}>
              <ShowAdvancedAssetFields>
                <IdentifierInput />
              </ShowAdvancedAssetFields>
            </If>
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

interface CollectionTypeToggleProps {
  originalValue: boolean;
  value: boolean;
  onToggle: () => void;
  isNewCollection: boolean;
}

const CollectionTypeToggle: FunctionComponent<CollectionTypeToggleProps> = ({
  originalValue,
  value,
  onToggle,
  isNewCollection,
}) => {
  const { i18n } = useI18n();
  const [pendingConfirm, setPendingConfirm] = useState<boolean>(false);

  const onConfirmChange = () => {
    setPendingConfirm(false);
    onToggle();
  };

  const onChangeAttempt = () => {
    if (isNewCollection || originalValue === !value) {
      // new collection or changing back to original value
      onToggle();
      return;
    }
    setPendingConfirm(true);
  };

  const descriptionKey = value
    ? "collection.ordered.toggle.dialog.description.toUnordered"
    : "collection.ordered.toggle.dialog.description.toOrdered";

  return (
    <>
      <CustomToggle
        id="edit-collection-ordered"
        on={i18n("collection.ordered")}
        off={i18n("collection.ordered")}
        onClick={onChangeAttempt}
        active={value}
      />
      <HelpIcon
        id="edit-collection-ordered-help"
        text={i18n("collection.ordered.toggle.description")}
        placement={"right"}
      />
      <ConfirmCancelDialog
        show={pendingConfirm}
        onClose={() => setPendingConfirm(false)}
        onConfirm={onConfirmChange}
        id={"skos-collection-metadata-edit-order-toggle-confirm-dialog"}
        title={i18n("collection.ordered.toggle.dialog.title")}
        confirmKey={"submit"}
      >
        <Label>{i18n(descriptionKey)}</Label>
      </ConfirmCancelDialog>
    </>
  );
};

export default CollectionMetadataEdit;
