import { OptionRendererParams } from "../misc/treeselect/Renderers";
import {
  CollectionMemberData,
  isCollection,
  isOrderedCollection,
} from "../../model/Collection";
import classNames from "classnames";
import { useMemo } from "react";
import { CollectionIcon } from "./CollectionIcon";
import Utils from "../../util/Utils";
import ResultItem from "../misc/treeselect/ResultItem";

export const CollectionMemberSelectOption = (
  props: OptionRendererParams<CollectionMemberData> & {
    /**
     * Whether icon should be displayed for every collection.
     * When false, icon will be displayed only for ordered collections.
     */
    displayCollectionIcon?: boolean;
  }
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

  const displayCollectionIcon = props.displayCollectionIcon ?? true;

  const className = classNames("VirtualizedSelectOption", {
    VirtualizedSelectDisabledOption: props.isDisabled,
    VirtualizedSelectSelectedOption: props.isSelected,
    VirtualizedSelectFocusedOption: props.isFocused,
  });

  const addonBefore = useMemo(() => {
    const isOrdered = isOrderedCollection(props.data);
    const shouldDisplay = displayCollectionIcon || isOrdered;
    if (isCollection(props.data) && shouldDisplay) {
      return (
        <CollectionIcon
          id={
            "collection-member-collection-icon-" +
            Utils.hashCode(props.data.iri)
          }
          isOrdered={isOrdered}
        />
      );
    }
    return undefined;
  }, [displayCollectionIcon, props.data]);

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
