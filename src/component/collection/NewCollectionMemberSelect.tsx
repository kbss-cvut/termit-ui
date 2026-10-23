import {
  CollectionMemberData,
  isCollection,
  isOrderedCollection,
  SkosCollectionDto,
} from "../../model/Collection";
import Constants from "../../util/Constants";
import { FetchOptionsFn, IntelligentTreeSelect } from "intelligent-tree-select";
import { FunctionComponent, useCallback, useMemo } from "react";
import { useI18n } from "../hook/useI18n";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { loadAddCollectionMemberOptions } from "../../action/AsyncCollectionActions";
import Utils from "../../util/Utils";
import { OptionRendererParams } from "../misc/treeselect/Renderers";
import { getShortLocale } from "../../util/IntlUtil";
import ResultItem from "../misc/treeselect/ResultItem";
import classNames from "classnames";
import { CollectionIcon } from "./CollectionIcon";
import { getLocalized } from "../../model/MultilingualString";

export interface NewCollectionMemberSelectProps {
  collection: SkosCollectionDto;
  value: CollectionMemberData | null;
  setValue: (value: CollectionMemberData | null) => void;
}

const CollectionMemberSelectOption = (
  props: OptionRendererParams<CollectionMemberData>
) => {
  const {
    valueKey,
    renderAsTree,
    labelKey,
    getOptionLabel,
    getOptionTitle,
    inputValue,
    isOptionExpanded,
    isOptionFetchingChild,
    childrenKey,
    onOptionSelect,
  } = props.selectProps;

  const className = classNames("VirtualizedSelectOption", {
    VirtualizedSelectDisabledOption: props.isDisabled,
    VirtualizedSelectSelectedOption: props.isSelected,
    VirtualizedSelectFocusedOption: props.isFocused,
  });

  const addonBefore = useMemo(() => {
    if (isCollection(props.data)) {
      return (
        <CollectionIcon
          id={
            "collection-member-collection-icon-" +
            Utils.hashCode(props.data.iri)
          }
          isOrdered={isOrderedCollection(props.data)}
        />
      );
    }
    return undefined;
  }, [props.data]);

  return (
    <ResultItem
      key={props.data[valueKey]}
      renderAsTree={renderAsTree}
      className={className}
      option={props.data}
      childrenKey={childrenKey}
      labelKey={labelKey}
      valueKey={valueKey}
      getOptionLabel={getOptionLabel}
      getOptionTitle={getOptionTitle}
      style={props.optionStyle}
      searchString={inputValue}
      addonBefore={addonBefore}
      displayInfoOnHover={false}
      isOptionExpanded={isOptionExpanded}
      isOptionFetchingChild={isOptionFetchingChild}
      onClick={() => onOptionSelect(props)}
    />
  );
};

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
