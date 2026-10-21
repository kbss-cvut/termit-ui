import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { SkosCollectionDto } from "../../model/Collection";
import { useLocation, useParams } from "react-router-dom";
import Utils from "../../util/Utils";
import { IRIImpl } from "../../util/VocabularyUtils";
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
import { CollectionMetadataEdit } from "./CollectionMetadataEdit";
import { Button } from "reactstrap";
import { GoPencil } from "react-icons/go";
import { FaTrashAlt } from "react-icons/fa";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";

export interface CollectionDetailProps {}

function useCollectionUri(): IRIImpl {
  const { collectionName } = useParams<{
    collectionName: string;
  }>();
  const location = useLocation();
  const collectionNamespace = Utils.extractQueryParam(
    location.search,
    "collectionNamespace"
  );
  return useMemo(
    () => new IRIImpl(collectionName, collectionNamespace),
    [collectionName, collectionNamespace]
  );
}

function useVocabularyUri(): IRIImpl {
  const { name } = useParams<{
    name: string; // vocabulary fragment
  }>();
  const location = useLocation();
  const namespace = Utils.extractQueryParam(location.search, "namespace");
  return useMemo(() => new IRIImpl(name, namespace), [name, namespace]);
}

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
  const [isEditActive, setIsEditActive] = useState(false);

  useEffect(() => {
    if (vocabulary?.iri !== vocabularyUri.toString()) {
      dispatch(loadVocabulary(vocabularyUri));
    }
  }, [dispatch, vocabulary?.iri, vocabularyUri]);

  useEffect(() => {
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
    setIsEditActive(false);
  }, [collectionUri]);

  const onEditOpen = useCallback(() => setIsEditActive(true), []);
  const onEditClose = useCallback(() => setIsEditActive(false), []);
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
      !isEditActive && (
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
        </IfVocabularyActionAuthorized>
      ),
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
  }, [collectionDto, isEditActive, vocabulary, onEditOpen, onRemove, i18n]);

  return (
    <>
      <WindowTitle title={label} />
      <HeaderWithActions title={TitleWithIcon} actions={actions} />
      {isEditActive && collectionDto ? (
        <CollectionMetadataEdit
          collection={collectionDto}
          vocabulary={vocabulary}
          initialShortLocale={selectedLanguage}
          onCloseEdit={onEditClose}
        />
      ) : (
        <>
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
      )}
    </>
  );
};

export default CollectionDetail;
