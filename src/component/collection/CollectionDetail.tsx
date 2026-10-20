import { FunctionComponent, useEffect, useMemo, useState } from "react";
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
import { getShortLocale } from "../../util/IntlUtil";
import LanguageSelector from "../multilingual/LanguageSelector";
import { selectVocabularyLanguages } from "../../store/StateSelectors";
import { CollectionMembersList } from "./CollectionMembersList";
import { OrderedCollectionIcon } from "./OrderedCollectionIcon";
import CopyIriIcon from "../misc/CopyIriIcon";

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
  const { locale } = useI18n();

  const [collectionDto, setCollectionDto] = useState<SkosCollectionDto | null>(
    null
  );
  const vocabulary = useAppSelector((state) => state.vocabulary);
  const languages = useAppSelector((state) =>
    selectVocabularyLanguages(state, state.vocabulary)
  );

  const [selectedLanguage, setSelectedLanguage] = useState(
    vocabulary.primaryLanguage ?? getShortLocale(locale)
  );

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

  return (
    <>
      <WindowTitle title={label} />
      <HeaderWithActions title={TitleWithIcon} />
      <LanguageSelector
        key="collection-language-selector"
        language={selectedLanguage}
        languages={languages}
        onSelect={setSelectedLanguage}
        primaryLanguage={vocabulary.primaryLanguage}
      />
      <CollectionMetadata
        collection={collectionDto}
        shortLocale={selectedLanguage}
      />
      <CollectionMembersList
        collection={collectionDto}
        shortLocale={selectedLanguage}
      />
    </>
  );
};

export default CollectionDetail;
