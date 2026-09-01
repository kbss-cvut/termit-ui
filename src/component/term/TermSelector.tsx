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
  loadVocabularies,
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
 * @param fetchedTermsFilter Filter for terms fetched from the backend
 * @param onChange Handler for selection
 * @param suffix Suffix to render after the selector (but within the form group)
 * @param vocabularyIri IRI of the vocabulary the current term belongs to
 * @param forceFlatList Whether to force the selector to render in flat list mode
 */
export const TermSelector: React.FC<{
  id?: string;
  label?: React.ReactNode;
  value: string[] | TermInfo[] | TermData[];
  vocabularyIri?: string;
  suffix?: React.ReactNode;
  forceFlatList?: boolean;

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
}) => {
  const intl = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const terminalStates = useSelector(
    (state: TermItState) => state.terminalStates
  );
  const vocabularies = useSelector((state: TermItState) => state.vocabularies);
  const treeSelect = React.useRef<IntelligentTreeSelect<Term>>(null);

  React.useEffect(() => {
    if (Object.keys(vocabularies).length === 0) {
      dispatch(loadVocabularies());
    }
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

  const selected =
    value.length > 0
      ? typeof value[0] === "string"
        ? (value as string[])
        : resolveSelectedIris(value as TermInfo[])
      : (value as string[]);

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
                includeImported: true,
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
          {vocabularyIri && (
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
        onChange={(v: readonly Term[]) => onChange(v)}
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
      {selected.length > MAX_SELECT_THRESHOLD && (
        <LargeTermValueList value={value} onChange={onChange} />
      )}
    </FormGroup>
  );
};
