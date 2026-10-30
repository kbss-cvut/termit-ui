import {
  CollectionMemberData,
  isCollection,
  SkosCollection,
} from "../../model/Collection";
import Constants from "../../util/Constants";
import { FetchOptionsFn, IntelligentTreeSelect } from "intelligent-tree-select";
import { FunctionComponent, useCallback } from "react";
import { useI18n } from "../hook/useI18n";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { loadAddCollectionMemberOptions } from "../../action/AsyncCollectionActions";
import Utils from "../../util/Utils";
import { getShortLocale } from "../../util/IntlUtil";
import { getLocalized } from "../../model/MultilingualString";
import { CollectionMemberSelectOption } from "./CollectionMemberSelectOption";

export interface NewCollectionMemberSelectProps {
  collection: SkosCollection;
  value: CollectionMemberData | null;
  setValue: (value: CollectionMemberData | null) => void;
}

/**
 * Select offering members that are not yet contained in the collection
 */
export const NewCollectionMemberSelect: FunctionComponent<
  NewCollectionMemberSelectProps
> = ({ collection, value, setValue }) => {
  const { locale } = useI18n();
  const shortLocale = getShortLocale(locale);
  const dispatch: ThunkDispatch = useDispatch();

  const fetchOptions: FetchOptionsFn<CollectionMemberData> = useCallback(
    (options) => {
      const pageRequest = Utils.createPagingParams(
        options.offset,
        options.limit
      );
      return dispatch(
        loadAddCollectionMemberOptions(
          collection,
          pageRequest,
          options.searchString
        )
      ).then((page) => page.pageContent);
    },
    [collection, dispatch]
  );

  const getOptionLabel = useCallback(
    (option: CollectionMemberData) => {
      if (isCollection(option)) {
        return getLocalized(option.title, shortLocale);
      }
      return getLocalized(option.label, shortLocale);
    },
    [shortLocale]
  );

  return (
    <IntelligentTreeSelect<CollectionMemberData, false, true>
      onChange={setValue}
      value={value}
      fetchOptions={fetchOptions}
      fetchLimit={Constants.DEFAULT_TREE_SELECT_FETCH_SIZE}
      optionRenderer={CollectionMemberSelectOption}
      maxHeight={200}
      multi={false}
      isClearable={true}
      renderAsTree={false}
      menuIsFloating={true}
      getOptionLabel={getOptionLabel}
      valueKey={"iri"}
    />
  );
};
