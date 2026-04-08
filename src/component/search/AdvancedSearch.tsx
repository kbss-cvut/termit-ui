import React, { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardBody } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import { ThunkDispatch } from "../../util/Types";
import TermItState from "../../model/TermItState";
import WindowTitle from "../misc/WindowTitle";
import SearchResult from "../../model/search/SearchResult";
import SearchParam, { MatchType } from "../../model/search/SearchParam";
import VocabularyUtils from "../../util/VocabularyUtils";
import Constants from "../../util/Constants";
import {
  executeAdvancedSearch,
  resetSearchFilter,
  updateSearchFilter,
} from "../../action/SearchActions";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { useDebouncedCallback } from "use-debounce";
import type { Language } from "../../util/IntlUtil";
import { getLanguageByShortCode, getShortLocale } from "../../util/IntlUtil";
import Utils from "../../util/Utils";
import {
  aggregateSearchParams,
  createSearchParam,
  sanitizeNoValue,
} from "./facet/FacetedSearchUtil";
import { RdfProperty } from "../../model/RdfsResource";
import { getCustomAttributes } from "../../action/AsyncActions";
import { mergeDuplicates } from "./label/SearchUtil";
import { createTermNonTerminalStateMatcher } from "../term/TermTreeSelectHelper";
import "./label/Search.scss";
import "../misc/CustomToggle.scss";
import AdvancedSearchInputCard from "./AdvancedSearchInputCard";
import AdvancedSearchFacets, {
  FACET_KEYS,
  FACET_PARAM_MAP,
  FacetKey,
  VisibleFacets,
} from "./AdvancedSearchFacets";
import AdvancedSearchResults from "./AdvancedSearchResults";
import BrowserStorage from "../../util/BrowserStorage";
import { SearchTarget } from "../../model/search/SearchTarget";

function mapIndexedLanguages(languages?: string[]): Language[] {
  return Utils.sanitizeArray(languages)
    .map(getLanguageByShortCode)
    .filter((l): l is Language => !!l);
}

const AdvancedSearch: React.FC = () => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const shortLocale = getShortLocale(locale);

  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );
  const indexedLanguages = mapIndexedLanguages(
    useSelector((state: TermItState) => state.configuration.indexedLanguages)
  );
  const terminalStates = useSelector(
    (state: TermItState) => state.terminalStates
  );

  // Read search query from Redux
  const { searchString, language, target, facetParams } = useSelector(
    (state: TermItState) => state.searchQuery
  );

  const [advancedOpen, setAdvancedOpen] = useState(
    Object.keys(facetParams).length > 0
  );
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<SearchResult[] | null>(null);

  const [visibleFacets, setVisibleFacets] = useState<VisibleFacets>({
    vocabulary: true,
    type: true,
    state: true,
    notation: true,
    example: true,
    relationshipAnnotation: true,
  });

  React.useEffect(() => {
    dispatch(getCustomAttributes());
  }, [dispatch]);

  const termAttributes = useMemo(
    () => customAttributes.filter((a) => a.domainIri === VocabularyUtils.TERM),
    [customAttributes]
  );

  const pageSize = useMemo(() => {
    return Math.min(
      Number(BrowserStorage.get(Constants.STORAGE_TABLE_PAGE_SIZE_KEY)) || 20,
      Constants.MAX_PAGE_SIZE
    );
  }, []);

  const toggleFacet = (key: FacetKey) => {
    setVisibleFacets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Build the rdf:type filter param for the given search target
  const buildTypeParam = (target: SearchTarget): SearchParam[] => {
    if (target === SearchTarget.TERMS) {
      return [
        {
          property: VocabularyUtils.RDF_TYPE,
          matchType: MatchType.IRI,
          value: [VocabularyUtils.TERM],
        },
      ];
    }
    if (target === SearchTarget.VOCABULARIES) {
      return [
        {
          property: VocabularyUtils.RDF_TYPE,
          matchType: MatchType.IRI,
          value: [VocabularyUtils.VOCABULARY],
        },
      ];
    }
    return [];
  };

  // Run the search via the advanced endpoint
  const runSearch = useCallback(
    (
      query: string,
      lang: string,
      target: SearchTarget,
      params: { [key: string]: SearchParam },
      pageNo: number
    ) => {
      const facetParams = advancedOpen ? aggregateSearchParams(params) : [];
      const searchParams = [...facetParams, ...buildTypeParam(target)];
      const hasQuery = query.trim().length > 0;
      const hasFacets = facetParams.length > 0;
      if (!hasQuery && !hasFacets) {
        setResults(null);
        return;
      }
      trackPromise(
        dispatch(
          executeAdvancedSearch(query, lang, searchParams, {
            page: pageNo,
            size: pageSize,
          })
        ),
        "unified-search"
      ).then((res) => {
        setResults(res);
      });
    },
    [dispatch, advancedOpen, pageSize]
  );

  const debouncedSearch = useDebouncedCallback(
    (
      query: string,
      lang: string,
      target: SearchTarget,
      params: { [key: string]: SearchParam },
      pageNo: number
    ) => {
      runSearch(query, lang, target, params, pageNo);
    },
    Constants.SEARCH_DEBOUNCE_DELAY
  );

  // On mount, run search if a query was passed from the navbar or was in store
  React.useEffect(() => {
    if (searchString.trim().length > 0 || Object.keys(facetParams).length > 0) {
      runSearch(searchString, language, target, facetParams, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    dispatch(updateSearchFilter({ searchString: val }));
    setPage(0);
    debouncedSearch(val, language, target, facetParams, 0);
  };

  const onSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      debouncedSearch.cancel();
      setPage(0);
      runSearch(searchString, language, target, facetParams, 0);
    }
  };

  const onLanguageChange = (langCode: string) => {
    dispatch(updateSearchFilter({ language: langCode }));
    setPage(0);
    debouncedSearch.cancel();
    runSearch(searchString, langCode, target, facetParams, 0);
  };

  const onTargetChange = (target: SearchTarget) => {
    dispatch(updateSearchFilter({ target }));
    setPage(0);
    let fp = facetParams;
    // Clear facet params when switching - facets only apply to terms
    if (target === SearchTarget.VOCABULARIES) {
      dispatch(updateSearchFilter({ facetParams: {} }));
      setAdvancedOpen(false);
      fp = {};
    }
    debouncedSearch.cancel();
    runSearch(searchString, language, target, fp, 0);
  };

  const resetSearch = () => {
    dispatch(resetSearchFilter());
    setPage(0);
    setResults(null);
    debouncedSearch.cancel();
  };

  const onPageChange = (newPage: number) => {
    setPage(newPage);
    debouncedSearch.cancel();
    runSearch(searchString, language, target, facetParams, newPage);
  };

  // Facet change handler for advanced mode
  const onFacetChange = (value: SearchParam, debounce: boolean = false) => {
    const change: { [key: string]: SearchParam } = {};
    change[value.property] = sanitizeNoValue(
      value,
      facetParams[value.property]
    );
    const newParams = { ...facetParams, ...change };
    dispatch(updateSearchFilter({ facetParams: newParams }));
    setPage(0);
    if (
      (value.matchType === MatchType.IRI ||
        (value.value.length > 0 && value.value[0].length === 0)) &&
      !debounce
    ) {
      runSearch(searchString, language, target, newParams, 0);
    } else {
      debouncedSearch(searchString, language, target, newParams, 0);
    }
  };

  // Clear facet params when facets are toggled off
  React.useEffect(() => {
    let changed = false;
    const nextParams = { ...facetParams };
    FACET_KEYS.forEach((k) => {
      if (!visibleFacets[k]) {
        const iri = FACET_PARAM_MAP[k];
        if (nextParams[iri]) {
          delete nextParams[iri];
          changed = true;
        }
      }
    });
    if (changed) {
      setPage(0);
      debouncedSearch.cancel();
      runSearch(searchString, language, target, nextParams, 0);
      dispatch(updateSearchFilter({ facetParams: nextParams }));
    }
  }, [
    visibleFacets,
    debouncedSearch,
    runSearch,
    searchString,
    language,
    target,
  ]);

  const onCustomAttributeToggle = (att: RdfProperty) => {
    const current = facetParams[att.iri];
    const isOn = !!current;
    if (isOn) {
      const next = { ...facetParams };
      delete next[att.iri];
      dispatch(updateSearchFilter({ facetParams: next }));
      setPage(0);
      debouncedSearch.cancel();
      runSearch(searchString, language, target, next, 0);
    } else {
      const next = {
        ...facetParams,
        [att.iri]: createSearchParam(att),
      };
      dispatch(updateSearchFilter({ facetParams: next }));
      setPage(0);
    }
  };

  const toggleAdvanced = () => {
    const willBeOpen = !advancedOpen;
    setAdvancedOpen(willBeOpen);
    if (!willBeOpen) {
      // Closing advanced: clear facet params and re-run
      dispatch(updateSearchFilter({ facetParams: {} }));
      setPage(0);
      debouncedSearch.cancel();
      runSearch(searchString, language, target, {}, 0);
    }
  };

  // Merge duplicates and sort results for display
  const finalResults = useMemo(() => {
    if (!results) return null;
    return mergeDuplicates(
      results,
      createTermNonTerminalStateMatcher(terminalStates)
    );
  }, [results, terminalStates]);

  // Can show advanced only for terms or both
  const canShowAdvanced = target !== SearchTarget.VOCABULARIES;

  return (
    <div id="unified-search" className="relative">
      <WindowTitle title={i18n("search.title")} />
      <PromiseTrackingMask area="unified-search" />

      <Card className="mb-3">
        <CardBody>
          <AdvancedSearchInputCard
            searchString={searchString}
            selectedLanguage={language}
            searchTarget={target}
            advancedOpen={advancedOpen}
            canShowAdvanced={canShowAdvanced}
            indexedLanguages={indexedLanguages}
            onSearchInputChange={onSearchInputChange}
            onSearchKeyPress={onSearchKeyPress}
            onLanguageChange={onLanguageChange}
            onTargetChange={onTargetChange}
            resetSearch={resetSearch}
            toggleAdvanced={toggleAdvanced}
          />
        </CardBody>
      </Card>

      {canShowAdvanced && (
        <AdvancedSearchFacets
          isOpen={advancedOpen}
          facetParams={facetParams}
          visibleFacets={visibleFacets}
          termAttributes={termAttributes}
          shortLocale={shortLocale}
          onFacetChange={onFacetChange}
          toggleFacet={toggleFacet}
          onCustomAttributeToggle={onCustomAttributeToggle}
        />
      )}

      <AdvancedSearchResults
        results={results}
        finalResults={finalResults}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default AdvancedSearch;
