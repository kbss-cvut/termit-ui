import React, { useMemo, useRef } from "react";
import Term from "../../model/Term";
import { useDispatch, useSelector } from "react-redux";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import "intelligent-tree-select/lib/styles.css";
import TermItState from "../../model/TermItState";
import {
  commonTermTreeSelectProps,
  createTermNonTerminalStateMatcher,
  processTermsForTreeSelect,
} from "../term/TermTreeSelectHelper";
import Utils from "../../util/Utils";
import {
  createTermsWithImportsOptionRenderer,
  createTermValueRenderer,
} from "../misc/treeselect/Renderers";
import { useI18n } from "../hook/useI18n";
import { Terms } from "../term/Terms";
import { ThunkDispatch } from "../../util/Types";
import { consumeNotification } from "../../action/SyncActions";

interface AnnotatorTermsSelectorProps {
  term: Term | null;
  onChange: (term: Term | null) => void;
  autoFocus?: boolean;
}

const AnnotatorTermsSelector: React.FC<AnnotatorTermsSelectorProps> = ({
  onChange,
  term,
  autoFocus = false,
}) => {
  const intl = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const treeSelect = useRef<IntelligentTreeSelect<Term, false, false>>(null);
  const { annotatorTerms, vocabulary, terminalStates, notifications } =
    useSelector((state: TermItState) => state);

  const options = useMemo(
    () =>
      processTermsForTreeSelect(
        Utils.mapToArray(annotatorTerms),
        [createTermNonTerminalStateMatcher(terminalStates)],
        { flattenAncestors: true }
      ),
    [annotatorTerms, terminalStates]
  );

  React.useEffect(() => {
    const notification = notifications.find((n) =>
      Terms.isNotificationRelevant(n)
    );
    if (notification) {
      treeSelect.current?.resetOptions();
      dispatch(consumeNotification(notification));
    }
  }, [notifications, treeSelect, dispatch]);

  React.useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        if (treeSelect.current !== null) {
          treeSelect.current.focus();
        }
      }, 100);
    }
  }, [autoFocus, treeSelect]);

  React.useEffect(() => {
    treeSelect.current?.forceUpdate();
  }, [treeSelect, intl.locale]);

  return (
    <IntelligentTreeSelect
      ref={treeSelect}
      className="mt-1 p-0"
      onChange={onChange}
      value={term}
      options={options}
      isMenuOpen={false}
      multi={false}
      isClearable={false}
      optionRenderer={createTermsWithImportsOptionRenderer(vocabulary!.iri)}
      valueRenderer={createTermValueRenderer(vocabulary!.iri)}
      {...commonTermTreeSelectProps(intl)}
    />
  );
};

export default AnnotatorTermsSelector;
