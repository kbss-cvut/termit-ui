import { FunctionComponent, useCallback, useMemo } from "react";
import { FetchOptionsFn, IntelligentTreeSelect } from "intelligent-tree-select";
import { useDispatch } from "react-redux";
import { loadSkosCollections } from "../../action/AsyncCollectionActions";
import { SkosCollectionDtoData } from "../../model/Collection";
import Constants from "../../util/Constants";
import { getShortLocale } from "../../util/IntlUtil";
import { ThunkDispatch } from "../../util/Types";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";
import { useI18n } from "../hook/useI18n";
import Vocabulary from "../../model/Vocabulary";
import { EMPTY_PAGE } from "../../model/ResultPage";
import { CollectionMemberSelectOption } from "./CollectionMemberSelectOption";
import { getLocalized } from "../../model/MultilingualString";

export interface CollectionSelectProps {
  vocabulary: Vocabulary;
  value: SkosCollectionDtoData | null;
  setValue: (value: SkosCollectionDtoData | null) => void;
  /// collections that will not be offered by the select
  exclude?: SkosCollectionDtoData[];
  emptyText?: string;
}

/**
 * Select offering SKOS collections of the specified vocabulary
 */
export const CollectionSelect: FunctionComponent<CollectionSelectProps> = ({
  vocabulary,
  value,
  setValue,
  exclude,
}) => {
  const { locale } = useI18n();
  const shortLocale = getShortLocale(locale);
  const dispatch: ThunkDispatch = useDispatch();

  const fetchOptions: FetchOptionsFn<SkosCollectionDtoData> = useCallback(
    (options) => {
      const { page, size } = Utils.createPagingParams(
        options.offset,
        options.limit
      );
      return dispatch(
        loadSkosCollections(
          VocabularyUtils.create(vocabulary.iri),
          options.searchString ?? "",
          shortLocale,
          {
            page: page ?? 0,
            size: size ?? Constants.DEFAULT_TREE_SELECT_FETCH_SIZE,
          }
        )
      ).then((result) =>
        "payload" in result
          ? result.payload.pageContent
          : EMPTY_PAGE.pageContent
      );
    },
    [dispatch, shortLocale, vocabulary.iri]
  );

  // Excluded collections are hidden here instead of being removed from the fetched pages,
  // the tree select stops loading further pages once it receives a page that is not full.
  const excludedIris = useMemo(
    () => new Set(exclude?.map((collection) => collection.iri)),
    [exclude]
  );
  const filterOption = useCallback(
    (option) => !excludedIris.has(option.data.iri),
    [excludedIris]
  );

  const getOptionLabel = useCallback(
    (option: SkosCollectionDtoData) => getLocalized(option.title, locale),
    [locale]
  );

  return (
    <IntelligentTreeSelect<SkosCollectionDtoData, false, true>
      key={vocabulary.iri}
      onChange={setValue}
      value={value}
      fetchOptions={fetchOptions}
      fetchLimit={Constants.DEFAULT_TREE_SELECT_FETCH_SIZE}
      // filterOption is passed to the underlying react-select, but missing in the tree select types
      {...{ filterOption }}
      maxHeight={200}
      multi={false}
      isClearable={true}
      renderAsTree={false}
      menuIsFloating={true}
      optionRenderer={(props) => (
        <CollectionMemberSelectOption
          {...props}
          displayCollectionIcon={false}
        />
      )}
      getOptionLabel={getOptionLabel}
      valueKey={"iri"}
    />
  );
};
