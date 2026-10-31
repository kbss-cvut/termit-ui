import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SkosCollectionDto } from "../../model/Collection";
import { useDispatch } from "react-redux";
import { ThunkDispatch, useAppSelector } from "../../util/Types";
import { loadSkosCollection } from "../../action/AsyncCollectionActions";
import { loadVocabulary } from "../../action/AsyncActions";
import { CollectionMetadata } from "./CollectionMetadata";
import WindowTitle from "../misc/WindowTitle";
import { useI18n } from "../hook/useI18n";
import HeaderWithActions from "../misc/HeaderWithActions";
import { getLanguages, getShortLocale } from "../../util/IntlUtil";
import LanguageSelector from "../multilingual/LanguageSelector";
import { OrderedCollectionIcon } from "./OrderedCollectionIcon";
import CopyIriIcon from "../misc/CopyIriIcon";
import { Button } from "reactstrap";
import { GoPencil } from "react-icons/go";
import { FaTrashAlt } from "react-icons/fa";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";
import { useCollectionUri, useVocabularyUri } from "./CollectionUtils";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import {
  RemoveCollectionDialog,
  RemoveCollectionDialogHandle,
} from "./RemoveCollectionDialog";

export interface CollectionDetailProps {}

const COLLECTION_LOAD_PROMISE_AREA =
  "collection-detail-collection-load-promise-area";

const CollectionDetail: FunctionComponent<CollectionDetailProps> = () => {
  const collectionUri = useCollectionUri();
  const vocabularyUri = useVocabularyUri();
  const dispatch: ThunkDispatch = useDispatch();
  const { i18n, locale } = useI18n();

  if (!collectionUri || !vocabularyUri) {
    throw new Error(
      "Invalid routing, failed to load collection and vocabulary"
    );
  }

  const collectionDto = useAppSelector((state) => state.selectedCollection);
  const vocabulary = useAppSelector((state) => state.vocabulary);
  const languages = useMemo(
    () =>
      collectionDto
        ? getLanguages(SkosCollectionDto.MULTILINGUAL_ATTRIBUTES, collectionDto)
        : [getShortLocale(locale)],
    [collectionDto, locale]
  );

  const [selectedLanguage, setSelectedLanguage] = useState(
    vocabulary.primaryLanguage ?? getShortLocale(locale)
  );

  useEffect(() => {
    if (vocabulary?.iri !== vocabularyUri.toString()) {
      dispatch(loadVocabulary(vocabularyUri));
    }
  }, [dispatch, vocabulary?.iri, vocabularyUri]);

  const loadCollection = useCallback(() => {
    trackPromise(
      dispatch(loadSkosCollection(collectionUri, vocabularyUri)),
      COLLECTION_LOAD_PROMISE_AREA
    );
  }, [collectionUri, dispatch, vocabularyUri]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const removeDialogRef = useRef<RemoveCollectionDialogHandle>(null);

  const onEditOpen = useCallback(() => {
    if (collectionDto) {
      Routing.transitionTo(
        Routes.editVocabularyCollection,
        Routing.makeCollectionDetailParams(collectionDto)
      );
    }
  }, [collectionDto]);
  const onRemove = useCallback(() => {
    if (collectionDto) {
      removeDialogRef.current?.remove(collectionDto);
    }
  }, [collectionDto]);

  const label = collectionDto?.getLabel(selectedLanguage) ?? "";

  const TitleWithIcon = useMemo(() => {
    return (
      <>
        {collectionDto?.isOrdered() && (
          <OrderedCollectionIcon id={"collection-header-title"} />
        )}
        {label}
        {collectionDto && <CopyIriIcon url={collectionDto.iri} />}
      </>
    );
  }, [collectionDto, label]);

  const actions = useMemo(() => {
    return [
      <IfVocabularyActionAuthorized
        key="collection-detail-edit"
        vocabulary={vocabulary}
        requiredAccessLevel={AccessLevel.WRITE}
      >
        <Button
          id="collection-detail-edit"
          size="sm"
          color="primary"
          onClick={onEditOpen}
          title={i18n("edit")}
        >
          <GoPencil />
          &nbsp;{i18n("edit")}
        </Button>
      </IfVocabularyActionAuthorized>,
      <IfVocabularyActionAuthorized
        key="collection-detail-remove"
        vocabulary={vocabulary}
        requiredAccessLevel={AccessLevel.WRITE}
      >
        <Button
          id="collection-detail-remove"
          size="sm"
          color="outline-danger"
          title={i18n("asset.remove.tooltip")}
          onClick={onRemove}
        >
          <FaTrashAlt />
          &nbsp;{i18n("remove")}
        </Button>
      </IfVocabularyActionAuthorized>,
    ];
  }, [vocabulary, onEditOpen, onRemove, i18n]);

  return (
    <>
      <WindowTitle title={label} />
      <HeaderWithActions title={TitleWithIcon} actions={actions} />
      <LanguageSelector
        key="collection-language-selector"
        language={selectedLanguage}
        languages={languages}
        onSelect={setSelectedLanguage}
        primaryLanguage={vocabulary.primaryLanguage}
      />
      <CollectionMetadata
        collection={collectionDto}
        vocabulary={vocabulary}
        shortLocale={selectedLanguage}
      />
      <RemoveCollectionDialog ref={removeDialogRef} vocabulary={vocabulary} />
      <PromiseTrackingMask area={COLLECTION_LOAD_PROMISE_AREA} />
    </>
  );
};

export default CollectionDetail;
