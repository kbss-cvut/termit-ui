import Term from "../../../model/Term";
import classNames from "classnames";
import ResultItem from "./ResultItem";
import ImportedTermInfo from "../../term/ImportedTermInfo";
import UnusedTermInfo from "../../term/UnusedTermInfo";
import TermQualityBadge from "../../term/TermQualityBadge";
import TermLink from "../../term/TermLink";
import Vocabulary from "../../../model/Vocabulary";
import VocabularyLink from "../../vocabulary/VocabularyLink";
import VocabularyNameBadge from "../../vocabulary/VocabularyNameBadge";

interface TreeItem {
  depth: number;
}

interface OptionRendererParams<T> {
  data: T & TreeItem;
  key?: string;
  optionStyle: any;
  selectProps: any;
  isFocused: boolean;
  isDisabled: boolean;
  isSelected: boolean;
}

/**
 * Intelligent tree select option renderer which visualizes imported Terms by adding icon to them.
 *
 * @param currentVocabularyIri IRI of the current vocabulary, used to resolve whether term is imported
 */
export function createTermsWithImportsOptionRenderer(
  currentVocabularyIri?: string
) {
  return createTermsWithImportsOptionRendererAndUnusedTerms(
    [],
    currentVocabularyIri
  );
}

/**
 * Intelligent tree select option renderer which visualizes imported Terms by adding icon to them.
 *
 * @param unusedTerms List of identifiers of terms which are not used anywhere
 * @param currentVocabularyIri IRI of the current vocabulary, used to resolve whether term is imported
 */
export function createTermsWithImportsOptionRendererAndUnusedTerms(
  unusedTerms: string[],
  currentVocabularyIri?: string
) {
  return createTermsWithImportsOptionRendererAndUnusedTermsAndQualityBadge(
    unusedTerms,
    currentVocabularyIri,
    false
  );
}

/**
 * Intelligent tree select option renderer which visualizes imported Terms by adding icon to them.
 *
 * @param unusedTerms List of identifiers of terms which are not used anywhere
 * @param currentVocabularyIri IRI of the current vocabulary, used to resolve whether term is imported
 * @param qualityBadge Whether quality badge should be rendered or not
 */
export function createTermsWithImportsOptionRendererAndUnusedTermsAndQualityBadge(
  unusedTerms: string[],
  currentVocabularyIri?: string,
  qualityBadge?: boolean
) {
  return (params: OptionRendererParams<Term>) => {
    //Conversion between old and new API
    let option = params.data;
    let optionStyle = {
      ...params.optionStyle,
      marginLeft: `${option.depth * 16}px`,
    };

    const { valueKey, renderAsTree, labelKey, getOptionLabel, inputValue } =
      params.selectProps;

    const className = classNames("VirtualizedSelectOption", {
      // VirtualizedSelectFocusedOption: params.isFocused,
      VirtualizedSelectDisabledOption: params.isDisabled,
      VirtualizedSelectSelectedOption: params.isSelected,
    });

    const eventHandlers = params.isDisabled
      ? {}
      : {
          onClick: () => params.selectProps.onOptionSelect(params),
          onToggleClick: () => params.selectProps.onOptionToggle(option),
        };

    const addonBefore = (
      <span>
        {qualityBadge ? <TermQualityBadge term={option} /> : undefined}
        {!currentVocabularyIri ||
        currentVocabularyIri === option.vocabulary!.iri ? undefined : (
          <ImportedTermInfo term={option} />
        )}
        {unusedTerms.indexOf(option.iri) !== -1 ? (
          <>
            <UnusedTermInfo term={option} />
          </>
        ) : undefined}
      </span>
    );

    const addonAfter = (
      <span>
        {!currentVocabularyIri ||
        currentVocabularyIri === option.vocabulary!.iri ? undefined : (
          <VocabularyNameBadge vocabulary={option.vocabulary} />
        )}
      </span>
    );

    return (
      <ResultItem
        key={params.data[valueKey]}
        renderAsTree={renderAsTree}
        className={className}
        option={option}
        childrenKey="plainSubTerms"
        labelKey={labelKey}
        valueKey={valueKey}
        getOptionLabel={getOptionLabel}
        style={optionStyle}
        searchString={inputValue}
        addonBefore={addonBefore}
        addonAfter={addonAfter}
        displayInfoOnHover={false}
        {...eventHandlers}
      />
    );
  };
}

export function createTermValueRenderer(vocabularyIri: string) {
  return (label: string, option: Term) => (
    <>
      <TermLink term={option} />
      {vocabularyIri !== option.vocabulary?.iri ? (
        <VocabularyNameBadge vocabulary={option.vocabulary} />
      ) : null}
    </>
  );
}

export function createVocabularyValueRenderer() {
  return (label: string, option: Vocabulary) => (
    <VocabularyLink vocabulary={option} />
  );
}
