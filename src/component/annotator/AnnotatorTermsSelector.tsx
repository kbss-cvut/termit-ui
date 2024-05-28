import React, { useRef } from "react";
import { TermData } from "../../model/Term";
import { useSelector } from "react-redux";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import TermItState from "../../model/TermItState";
import {
  commonTermTreeSelectProps,
  createTermNonTerminalStateMatcher,
  createVocabularyMatcher,
  processTermsForTreeSelect,
} from "../term/TermTreeSelectHelper";
import Utils from "../../util/Utils";
import {
  createTermsWithImportsOptionRenderer,
  createTermValueRenderer,
} from "../misc/treeselect/Renderers";
import { useI18n } from "../hook/useI18n";

interface AnnotatorTermsSelectorProps {
  term: TermData | null;
  onChange: (Term: TermData | null) => void;
  autoFocus?: boolean;
}

const AnnotatorTermsSelector: React.FC<AnnotatorTermsSelectorProps> = ({
  onChange,
  term,
  autoFocus = false,
}) => {
  const intl = useI18n();
  const treeSelect = useRef<IntelligentTreeSelect>(null);
  const { annotatorTerms, vocabulary, terminalStates } = useSelector(
    (state: TermItState) => state
  );
  React.useEffect(() => {
    if (autoFocus) {
      setTimeout(() => treeSelect.current.focus(), 100);
    }
  }, [autoFocus, treeSelect]);
  React.useEffect(() => {
    treeSelect.current.forceUpdate();
  }, [treeSelect, intl.locale]);
  const options = processTermsForTreeSelect(Utils.mapToArray(annotatorTerms), [
    createVocabularyMatcher(
      Utils.sanitizeArray(vocabulary.allImportedVocabularies).concat(
        vocabulary!.iri
      )
    ),
    createTermNonTerminalStateMatcher(terminalStates),
  ]);

  return (
    <IntelligentTreeSelect
      ref={treeSelect}
      className="mt-1 p-0"
      onChange={onChange}
      value={term}
      options={options}
      isMenuOpen={false}
      multi={false}
      optionRenderer={createTermsWithImportsOptionRenderer(vocabulary!.iri)}
      valueRenderer={createTermValueRenderer(vocabulary!.iri)}
      {...commonTermTreeSelectProps(intl)}
    />
  );
};

export default AnnotatorTermsSelector;
