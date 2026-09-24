import React, { useState } from "react";
import { FormGroup } from "reactstrap";
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
import { ThunkDispatch, TreeSelectFetchOptionsParams } from "../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import {
  loadAllTerms,
  loadTerms,
  loadVocabulariesIfNotLoaded,
} from "../../action/AsyncActions";
import TermItState from "../../model/TermItState";
import TermListToggle from "./TermListToggle";
import { setTermsFlatList } from "../../action/SyncActions";
import { LargeTermValueList } from "./LargeTermValueList";
import VocabularyUtils from "../../util/VocabularyUtils";
import VocabulariesInfoIcon from "../misc/VocabulariesInfoIcon";
import Utils from "../../util/Utils";

export const MAX_SELECT_THRESHOLD = 20;

/**
 * Selector of terms (using the intelligent-tree-select component).
 *
 * This selector is used for selecting terms across all vocabularies.
 * @param id Component identifier
 * @param label Label to render for the selector
 * @param value Selected value
 * @param multi Whether multiple terms can be selected
 * @param fetchedTermsFilter Filter for terms fetched from the backend
 * @param onChange Handler for selection
 * @param suffix Suffix to render after the selector (but within the form group)
 * @param vocabularyIri IRI of the vocabulary the current term belongs to
 * @param forceFlatList Whether to force the selector to render in flat list mode
 * @param includeImported Whether terms from imported vocabularies should be included
 * @param disableScopeToggle Whether toggle for "show related" should be disabled
 */
export const TermSelector: React.FC<{
  id?: string;
  label?: React.ReactNode;
  value: string[] | TermInfo[] | TermData[];
  vocabularyIri?: string;
  suffix?: React.ReactNode;
  forceFlatList?: boolean;
  includeImported?: boolean;
  disableScopeToggle?: boolean;
  multi?: boolean;

  fetchedTermsFilter?: (terms: Term[]) => Term[];
  onChange: (selected: readonly Term[]) => void;
}> = ({
  id,
  label,
  value,
  forceFlatList,
  fetchedTermsFilter = (terms) => terms,
  onChange,
  suffix,
  vocabularyIri,
  includeImported = true,
  disableScopeToggle = false,
  multi = true,
}) => {
  const intl = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const terminalStates = useSelector(
    (state: TermItState) => state.terminalStates
  );
  const vocabularies = useSelector((state: TermItState) => state.vocabularies);
  const treeSelect = React.useRef<IntelligentTreeSelect<Term>>(null);

  React.useEffect(() => {
    dispatch(loadVocabulariesIfNotLoaded());
  }, [dispatch, vocabularies]);

  let flatList = useSelector((state: TermItState) => state.showTermsFlatList);
  if (forceFlatList) {
    flatList = true;
  }
  const handleFlatListToggle = () => {
    dispatch(setTermsFlatList(!flatList));
    treeSelect.current?.resetOptions();
  };

  const [limitToRelated, setLimitToRelated] = useState(!!vocabularyIri);

  const handleLimitToRelatedToggle = () => {
    setLimitToRelated(!limitToRelated);
    treeSelect.current?.resetOptions();
  };

  const selectedValues =
    value.length > 0
      ? typeof value[0] === "string"
        ? (value as string[])
        : resolveSelectedIris(value as TermInfo[])
      : (value as string[]);

  const selected = multi ? selectedValues : selectedValues.slice(0, 1);

  const handleChange = (newValue: readonly Term[] | Term | null) => {
    if (newValue === null) {
      onChange([]);
    } else if (Array.isArray(newValue)) {
      onChange(newValue);
    } else {
      onChange([newValue as Term]);
    }
  };

  const fetchOptions = async (
    fetchParams: TreeSelectFetchOptionsParams<TermData>
  ) => {
    const terms = await loadAndPrepareTerms(
      { ...fetchParams, flatList },
      (options) => {
        if (limitToRelated && vocabularyIri) {
          return dispatch(
            loadTerms(
              {
                ...options,
                flatList,
                includeImported: includeImported,
                includeRelated: true,
              },
              VocabularyUtils.create(vocabularyIri)
            )
          );
        }
        return dispatch(
          loadAllTerms(
            { ...options, flatList },
            resolveNamespaceForLoadAll(options)
          )
        );
      },
      {
        selectedIris: selected.length > MAX_SELECT_THRESHOLD ? [] : selected,
        terminalStates: terminalStates,
      }
    );
    return fetchedTermsFilter(terms);
  };

  const treeSelectProps = {
    ...commonTermTreeSelectProps(intl),
    renderAsTree: !flatList,
    controlShouldRenderValue: selected.length <= MAX_SELECT_THRESHOLD,
  };

  const currentVocab = vocabularyIri ? vocabularies[vocabularyIri] : undefined;
  const filteredVocabs = Utils.sanitizeArray(currentVocab?.relatedVocabularies)
    .map((asset) => vocabularies[asset.iri!])
    .filter(Boolean);

  return (
    <FormGroup id={id}>
      <div className="d-flex justify-content-between mb-2">
        {label}
        <div className="d-flex align-items-center">
          {vocabularyIri && !disableScopeToggle && (
            <>
              {limitToRelated && filteredVocabs.length > 0 && (
                <VocabulariesInfoIcon
                  id={id + "-related-info-icon"}
                  vocabularies={filteredVocabs}
                  labelKey="vocabulary.detail.related"
                  className="mr-2"
                />
              )}
              <TermListToggle
                id={id + "-limit-to-related"}
                onToggle={handleLimitToRelatedToggle}
                value={limitToRelated}
                labelOnKey="glossary.limitToRelated"
                labelOffKey="glossary.showAll"
                tooltipOnKey="glossary.limitToRelated.help"
                tooltipOffKey="glossary.showAll.help"
              />
            </>
          )}
          {!forceFlatList && (
            <div className={vocabularyIri ? "ml-2" : ""}>
              <TermListToggle
                id={id + "-show-flat-list"}
                onToggle={handleFlatListToggle}
                value={flatList}
                labelOnKey="glossary.showFlatList"
                labelOffKey="glossary.showTreeList"
                tooltipOnKey="glossary.showFlatList.help"
                tooltipOffKey="glossary.showTreeList.help"
              />
            </div>
          )}
        </div>
      </div>
      <IntelligentTreeSelect
        ref={treeSelect}
        onChange={handleChange}
        value={multi ? selected : selected[0]}
        fetchOptions={fetchOptions}
        fetchLimit={Constants.DEFAULT_TREE_SELECT_FETCH_SIZE}
        maxHeight={200}
        multi={multi}
        optionRenderer={createTermsWithImportsOptionRenderer(vocabularyIri)}
        valueRenderer={createTermValueRenderer(vocabularyIri)}
        {...treeSelectProps}
      />
      {suffix}
      {multi && selected.length > MAX_SELECT_THRESHOLD && (
        <LargeTermValueList value={value} onChange={onChange} />
      )}
    </FormGroup>
  );
};
