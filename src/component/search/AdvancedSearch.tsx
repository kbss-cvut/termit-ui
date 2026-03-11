import React, { useState, useMemo, useCallback } from "react";
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
import { executeAdvancedSearch } from "../../action/SearchActions";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { useDebouncedCallback } from "use-debounce";
import { getLanguageByShortCode, getShortLocale } from "../../util/IntlUtil";
import Utils from "../../util/Utils";
import {
  aggregateSearchParams,
  createSearchParam,
} from "./facet/FacetedSearchUtil";
import { RdfProperty } from "../../model/RdfsResource";
import { getCustomAttributes } from "../../action/AsyncActions";
import { mergeDuplicates } from "./label/SearchResults";
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
import AdvancedSearchResults, {
  RESULT_PAGE_SIZE,
} from "./AdvancedSearchResults";

import type { Language } from "../../util/IntlUtil";

export enum SearchTarget {
  TERMS = "TERMS",
  VOCABULARIES = "VOCABULARIES",
  BOTH = "BOTH",
}

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

  // Read initial search query from Redux (populated by NavbarSearch)
  const reduxSearchQuery = useSelector(
    (state: TermItState) => state.searchQuery
  );

  // Search state - initialized from Redux if navigated from navbar
  const [searchString, setSearchString] = useState(
    reduxSearchQuery.searchQuery
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    reduxSearchQuery.language || ""
  );
  const [searchTarget, setSearchTarget] = useState<SearchTarget>(
    SearchTarget.BOTH
  );
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [results, setResults] = useState<SearchResult[] | null>(null);

  // Faceted search params (for advanced mode)
  const [facetParams, setFacetParams] = useState<{
    [key: string]: SearchParam;
  }>({});
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
            size: RESULT_PAGE_SIZE,
          })
        ),
        "unified-search"
      ).then((res) => {
        setResults(res);
      });
    },
    [dispatch, advancedOpen]
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

  // On mount, run search if a query was passed from the navbar
  React.useEffect(() => {
    if (searchString.trim().length > 0) {
      runSearch(searchString, selectedLanguage, searchTarget, facetParams, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchString(val);
    setPage(0);
    debouncedSearch(val, selectedLanguage, searchTarget, facetParams, 0);
  };

  const onSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      debouncedSearch.cancel();
      setPage(0);
      runSearch(searchString, selectedLanguage, searchTarget, facetParams, 0);
    }
  };

  const onLanguageChange = (langCode: string) => {
    setSelectedLanguage(langCode);
    setPage(0);
    debouncedSearch.cancel();
    runSearch(searchString, langCode, searchTarget, facetParams, 0);
  };

  const onTargetChange = (target: SearchTarget) => {
    setSearchTarget(target);
    setPage(0);
    // Clear facet params when switching - facets only apply to terms
    if (target === SearchTarget.VOCABULARIES) {
      setFacetParams({});
      setAdvancedOpen(false);
    }
    debouncedSearch.cancel();
    runSearch(searchString, selectedLanguage, target, {}, 0);
  };

  const resetSearch = () => {
    setSearchString("");
    setSelectedLanguage("");
    setPage(0);
    setResults(null);
    setFacetParams({});
    debouncedSearch.cancel();
  };

  const onPageChange = (newPage: number) => {
    setPage(newPage);
    debouncedSearch.cancel();
    runSearch(
      searchString,
      selectedLanguage,
      searchTarget,
      facetParams,
      newPage
    );
  };

  // Facet change handler for advanced mode
  const onFacetChange = (value: SearchParam, debounce: boolean = false) => {
    const change: { [key: string]: SearchParam } = {};
    change[value.property as string] = value;
    const newParams = { ...facetParams, ...change };
    setFacetParams(newParams);
    setPage(0);
    if (
      (value.matchType === MatchType.IRI ||
        (value.value.length > 0 && value.value[0].length === 0)) &&
      !debounce
    ) {
      runSearch(searchString, selectedLanguage, searchTarget, newParams, 0);
    } else {
      debouncedSearch(
        searchString,
        selectedLanguage,
        searchTarget,
        newParams,
        0
      );
    }
  };

  // Clear facet params when facets are toggled off
  React.useEffect(() => {
    setFacetParams((currentParams) => {
      let changed = false;
      const nextParams = { ...currentParams };
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
        runSearch(searchString, selectedLanguage, searchTarget, nextParams, 0);
        return nextParams;
      }
      return currentParams;
    });
  }, [
    visibleFacets,
    debouncedSearch,
    runSearch,
    searchString,
    selectedLanguage,
    searchTarget,
  ]);

  const onCustomAttributeToggle = (att: RdfProperty) => {
    const current = facetParams[att.iri];
    const isOn = !!current;
    if (isOn) {
      const next = { ...facetParams };
      delete next[att.iri];
      setFacetParams(next);
      setPage(0);
      debouncedSearch.cancel();
      runSearch(searchString, selectedLanguage, searchTarget, next, 0);
    } else {
      const next = {
        ...facetParams,
        [att.iri]: createSearchParam(att),
      };
      setFacetParams(next);
      setPage(0);
    }
  };

  const toggleAdvanced = () => {
    const willBeOpen = !advancedOpen;
    setAdvancedOpen(willBeOpen);
    if (!willBeOpen) {
      // Closing advanced: clear facet params and re-run
      setFacetParams({});
      setPage(0);
      debouncedSearch.cancel();
      runSearch(searchString, selectedLanguage, searchTarget, {}, 0);
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
  const canShowAdvanced = searchTarget !== SearchTarget.VOCABULARIES;

  return (
    <div id="unified-search" className="relative">
      <WindowTitle title={i18n("search.title")} />
      <PromiseTrackingMask area="unified-search" />

      <Card className="mb-3">
        <CardBody>
          <AdvancedSearchInputCard
            searchString={searchString}
            selectedLanguage={selectedLanguage}
            searchTarget={searchTarget}
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
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default AdvancedSearch;
