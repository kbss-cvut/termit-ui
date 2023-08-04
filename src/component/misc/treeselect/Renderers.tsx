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
import TerminalTermStateIcon from "../../term/state/TerminalTermStateIcon";
import Utils from "../../../util/Utils";

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
  return createTermRenderer(
    [createImportedTermRenderer(currentVocabularyIri)],
    [createVocabularyBadgeRenderer(currentVocabularyIri)]
  );
}

/**
 * Intelligent tree select option renderer which visualizes imported Terms by adding icon to them.
 *
 * @param unusedTerms List of identifiers of terms which are not used anywhere
 * @param terminalStates List of identifiers of term states that are terminal
 * @param currentVocabularyIri IRI of the current vocabulary, used to resolve whether term is imported
 * @param qualityBadge Whether quality badge should be rendered or not
 */
export function createFullTermRenderer(
  unusedTerms: string[],
  terminalStates: string[],
  currentVocabularyIri?: string,
  qualityBadge?: boolean
) {
  const addonBeforeRenderers = [];
  if (qualityBadge) {
    addonBeforeRenderers.push(createQualityBadgeRenderer());
  }
  addonBeforeRenderers.push(createTerminalStateIconRenderer(terminalStates));
  addonBeforeRenderers.push(createImportedTermRenderer(currentVocabularyIri));
  addonBeforeRenderers.push(createUnusedTermInfoRenderer(unusedTerms));
  return createTermRenderer(addonBeforeRenderers, [
    createVocabularyBadgeRenderer(currentVocabularyIri),
  ]);
}

export function createTermRenderer(
  addonBeforeRenderers: Array<(t: Term & TreeItem) => JSX.Element | null>,
  addonAfterRenderers: Array<(t: Term & TreeItem) => JSX.Element | null>
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
      <span>{addonBeforeRenderers.map((r) => r(option))}</span>
    );

    const addonAfter = <span>{addonAfterRenderers.map((r) => r(option))}</span>;

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

function createQualityBadgeRenderer() {
  return (option: Term & TreeItem) => (
    <TermQualityBadge key="term-quality-addon" term={option} />
  );
}

function createImportedTermRenderer(currentVocabularyIri?: string) {
  return (option: Term & TreeItem) =>
    !currentVocabularyIri ||
    currentVocabularyIri === option.vocabulary!.iri ? null : (
      <ImportedTermInfo key="imported-term-addon" term={option} />
    );
}

function createUnusedTermInfoRenderer(unusedTerms: string[]) {
  return (option: Term & TreeItem) =>
    unusedTerms.indexOf(option.iri) !== -1 ? (
      <UnusedTermInfo key="unused-term-addon" term={option} />
    ) : null;
}

function createVocabularyBadgeRenderer(currentVocabularyIri?: string) {
  return (option: Term & TreeItem) =>
    !currentVocabularyIri ||
    currentVocabularyIri === option.vocabulary!.iri ? null : (
      <VocabularyNameBadge
        key="vocabulary-name-addon"
        vocabulary={option.vocabulary}
      />
    );
}

function createTerminalStateIconRenderer(terminalStates: string[]) {
  return (option: Term & TreeItem) =>
    option.state && terminalStates.indexOf(option.state.iri) !== -1 ? (
      <TerminalTermStateIcon
        key="terminal-state-icon"
        id={`terminal-state-icon-${Utils.hashCode(option.iri)}`}
      />
    ) : null;
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
