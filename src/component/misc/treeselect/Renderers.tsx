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

interface TreeOption {
  disabled: boolean;
  className: string;
}

interface OptionRendererParams<T> {
  focusedOption?: T & TreeOption;
  focusOption: (option: T & TreeOption) => void;
  key?: string;
  labelKey: string;
  getOptionLabel: (option: T & TreeOption) => string;
  valueKey: string;
  option: T & TreeOption;
  selectValue: (option: T & TreeOption) => void;
  optionStyle: any;
  renderAsTree: boolean;
  valueArray: T & TreeOption[];
  toggleOption: (option: T & TreeOption) => void;
  searchString: string;
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
    const {
      option,
      focusedOption,
      optionStyle,
      selectValue,
      focusOption,
      toggleOption,
      valueArray,
    } = { ...params };
    const className = classNames(
      "VirtualizedSelectOption",
      {
        VirtualizedSelectFocusedOption: option === focusedOption,
        VirtualizedSelectDisabledOption: option.disabled,
        VirtualizedSelectSelectedOption:
          valueArray && valueArray.indexOf(option) >= 0,
      },
      option.className
    );

    const eventHandlers = option.disabled
      ? {}
      : {
          onClick: () => selectValue(option),
          onMouseEnter: () => focusOption(option),
          onToggleClick: () => toggleOption(option),
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
        key={params.key}
        renderAsTree={params.renderAsTree}
        className={className}
        option={option}
        childrenKey="plainSubTerms"
        labelKey={params.labelKey}
        valueKey={params.valueKey}
        getOptionLabel={params.getOptionLabel}
        style={optionStyle}
        searchString={params.searchString}
        addonBefore={addonBefore}
        addonAfter={addonAfter}
        displayInfoOnHover={false}
        {...eventHandlers}
      />
    );
  };
}

export function createTermValueRenderer(vocabularyIri: string) {
  return (option: Term) => (
    <>
      <TermLink term={option} />
      {vocabularyIri !== option.vocabulary?.iri ? (
        <VocabularyNameBadge vocabulary={option.vocabulary} />
      ) : null}
    </>
  );
}

export function createVocabularyValueRenderer() {
  return (option: Vocabulary) => <VocabularyLink vocabulary={option} />;
}
