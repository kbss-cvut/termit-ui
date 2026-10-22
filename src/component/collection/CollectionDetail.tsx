import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SkosCollectionDto } from "../../model/Collection";
import { useDispatch } from "react-redux";
import { ThunkDispatch, useAppSelector } from "../../util/Types";
import { loadSkosCollection } from "../../action/AsyncCollectionActions";
import AsyncActionStatus from "../../action/AsyncActionStatus";
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

export interface CollectionDetailProps {}

const CollectionDetail: FunctionComponent<CollectionDetailProps> = () => {
  const collectionUri = useCollectionUri();
  const vocabularyUri = useVocabularyUri();
  const dispatch: ThunkDispatch = useDispatch();
  const { i18n, locale } = useI18n();

  const [collectionDto, setCollectionDto] = useState<SkosCollectionDto | null>(
    null
  );
  const vocabulary = useAppSelector((state) => state.vocabulary);
  const languages = useMemo(
    () =>
      collectionDto
        ? getLanguages(SkosCollectionDto.MULTILINGUAL_ATTRIBUTES, collectionDto)
        : [],
    [collectionDto]
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
    // TODO track promise
    dispatch(loadSkosCollection(collectionUri, vocabularyUri)).then(
      (result) => {
        if (
          result.status === AsyncActionStatus.SUCCESS &&
          "payload" in result
        ) {
          setCollectionDto(result.payload);
        }
      }
    );
  }, [collectionUri, dispatch, vocabularyUri]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const onEditOpen = useCallback(() => {
    if (collectionDto) {
      Routing.transitionTo(
        Routes.editVocabularyCollection,
        Routing.makeCollectionDetailParams(collectionDto)
      );
    }
  }, [collectionDto]);
  const onRemove = useCallback(() => {
    // TODO: collection removal action
  }, []);

  const label = collectionDto?.getLabel(selectedLanguage) ?? "";

  const TitleWithIcon = useMemo(() => {
    if (!collectionDto) {
      return null;
    }
    return (
      <>
        {collectionDto.isOrdered() && (
          <OrderedCollectionIcon id={"collection-header-title"} />
        )}
        {label}
        <CopyIriIcon url={collectionDto.iri} />
      </>
    );
  }, [collectionDto, label]);

  const actions = useMemo(() => {
    if (!collectionDto) {
      return null;
    }
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
  }, [collectionDto, vocabulary, onEditOpen, onRemove, i18n]);

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
    </>
  );
};

export default CollectionDetail;
