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

export const TermSelector: React.FC<{
  id?: string;
  label?: React.ReactNode;
  value: string[] | TermInfo[] | TermData[];
  vocabularyIri?: string;

  fetchedTermsFilter?: (terms: Term[]) => Term[];
  onChange: (selected: Term[]) => void;
}> = ({
  id,
  label,
  value,
  fetchedTermsFilter = (terms) => terms,
  onChange,
  vocabularyIri,
}) => {
  const intl = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const terminalStates = useSelector(
    (state: TermItState) => state.terminalStates
  );

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
        dispatch(loadAllTerms(options, resolveNamespaceForLoadAll(options))),
      {
        selectedIris: selected,
        terminalStates: terminalStates,
      }
    );
    return fetchedTermsFilter(terms);
  };

  return (
    <FormGroup id={id}>
      {label}
      <>
        <IntelligentTreeSelect
          onChange={(v: Term[] | Term | null) =>
            onChange(Utils.sanitizeArray(v))
          }
          value={selected}
          fetchOptions={fetchOptions}
          fetchLimit={Constants.DEFAULT_PAGE_SIZE}
          maxHeight={200}
          multi={true}
          optionRenderer={createTermsWithImportsOptionRenderer(vocabularyIri)}
          valueRenderer={createTermValueRenderer(vocabularyIri)}
          {...commonTermTreeSelectProps(intl)}
        />
      </>
    </FormGroup>
  );
};
