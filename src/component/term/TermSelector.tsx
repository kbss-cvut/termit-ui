import React from "react";
import { FormGroup } from "reactstrap";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import Term, { TermData, TermInfo } from "src/model/Term";
import {
  commonTermTreeSelectProps,
  loadAndPrepareTerms,
  resolveNamespaceForLoadAll,
  resolveSelectedIris,
} from "./TermTreeSelectHelper";
import Constants from "../../util/Constants";
import {
  createTermsWithImportsOptionRenderer,
  createTermValueRenderer,
} from "../misc/treeselect/Renderers";
import { useI18n } from "../hook/useI18n";
import Utils from "src/util/Utils";
import { ThunkDispatch, TreeSelectFetchOptionsParams } from "../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import { loadAllTerms } from "../../action/AsyncActions";
import TermItState from "../../model/TermItState";
import ShowFlatListToggle from "./state/ShowFlatListToggle";
import { setTermsFlatList } from "src/action/SyncActions";

/**
 * Selector of terms (using the intelligent-tree-select component).
 *
 * This selector is used for selecting terms across all vocabularies.
 * @param id Component identifier
 * @param label Label to render for the selector
 * @param value Selected value
 * @param fetchedTermsFilter Filter for terms fetched from the backend
 * @param onChange Handler for selection
 * @param suffix Suffix to render after the selector (but within the form group)
 * @param vocabularyIri IRI of the vocabulary the current term belongs to
 */
export const TermSelector: React.FC<{
  id?: string;
  label?: React.ReactNode;
  value: string[] | TermInfo[] | TermData[];
  vocabularyIri?: string;
  suffix?: React.ReactNode;

  fetchedTermsFilter?: (terms: Term[]) => Term[];
  onChange: (selected: Term[]) => void;
}> = ({
  id,
  label,
  value,
  fetchedTermsFilter = (terms) => terms,
  onChange,
  suffix,
  vocabularyIri,
}) => {
  const intl = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const terminalStates = useSelector(
    (state: TermItState) => state.terminalStates
  );
  const treeSelect = React.useRef<IntelligentTreeSelect>(null);

  const flatList = useSelector((state: TermItState) => state.showTermsFlatList);
  const handleFlatListToggle = React.useCallback(() => {
    dispatch(setTermsFlatList(!flatList));
    treeSelect.current?.resetOptions();
  }, [dispatch, flatList]);

  const selected =
    value.length > 0
      ? typeof value[0] === "string"
        ? (value as string[])
        : resolveSelectedIris(value as TermInfo[])
      : (value as string[]);
  const fetchOptions = async (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    const terms = await loadAndPrepareTerms(
      fetchOptions,
      (options) =>
        dispatch(
          loadAllTerms(
            { ...options, flatList },
            resolveNamespaceForLoadAll(options)
          )
        ),
      {
        selectedIris: selected,
        terminalStates: terminalStates,
      }
    );
    return fetchedTermsFilter(terms);
  };

  const treeSelectProps = {
    ...commonTermTreeSelectProps(intl),
    renderAsTree: !flatList,
  };

  return (
    <FormGroup id={id}>
      <div className="d-flex justify-content-between">
        {label}
        <ShowFlatListToggle
          id={id + "-show-flat-list"}
          onToggle={handleFlatListToggle}
          value={flatList}
        />
      </div>
      <IntelligentTreeSelect
        ref={treeSelect}
        onChange={(v: Term[] | Term | null) => onChange(Utils.sanitizeArray(v))}
        value={selected}
        fetchOptions={fetchOptions}
        fetchLimit={Constants.DEFAULT_PAGE_SIZE}
        maxHeight={200}
        multi={true}
        optionRenderer={createTermsWithImportsOptionRenderer(vocabularyIri)}
        valueRenderer={createTermValueRenderer(vocabularyIri)}
        {...treeSelectProps}
      />
      {suffix}
    </FormGroup>
  );
};
