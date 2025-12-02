import React, { useState, useMemo } from "react";
import WindowTitle from "../../misc/WindowTitle";
import { useI18n } from "../../hook/useI18n";
import { Card, CardBody, Col, Row } from "reactstrap";
import SearchParam, { MatchType } from "../../../model/search/SearchParam";
import VocabularyUtils from "../../../util/VocabularyUtils";
import TextFacet from "./TextFacet";
import { FacetedSearchResult } from "../../../model/search/FacetedSearchResult";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import { executeFacetedTermSearch } from "../../../action/SearchActions";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import FacetedSearchResults from "./FacetedSearchResults";
import "./FacetedSearch.scss";
import "../label/Search.scss";
import TermTypeFacet from "./TermTypeFacet";
import VocabularyFacet from "./VocabularyFacet";
import SimplePagination from "../../dashboard/widget/lastcommented/SimplePagination";
import Constants from "../../../util/Constants";
import TermStateFacet from "./TermStateFacet";
import { useDebouncedCallback } from "use-debounce";
import { CustomAttributeFacets } from "./CustomAttributeFacets";
import { aggregateSearchParams, createSearchParam } from "./FacetedSearchUtil";
import { RdfProperty } from "../../../model/RdfsResource";
import "../../misc/CustomToggle.scss";
import TermItState from "../../../model/TermItState";
import { getCustomAttributes } from "../../../action/AsyncActions";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";
import Utils from "../../../util/Utils";
import FacetToggle from "./FacetToggle";
import { TermSelectorFacet } from "./TermSelectorFacet";

const RESULT_PAGE_SIZE = 10;

const FACET_KEYS = [
  "vocabulary",
  "type",
  "state",
  "notation",
  "example",
  "relationshipAnnotation",
] as const;
type FacetKey = (typeof FACET_KEYS)[number];
type VisibleFacets = Record<FacetKey, boolean>;
const FACET_PARAM_MAP: Record<FacetKey, string> = {
  vocabulary: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
  type: VocabularyUtils.RDF_TYPE,
  state: VocabularyUtils.HAS_TERM_STATE,
  notation: VocabularyUtils.SKOS_NOTATION,
  example: VocabularyUtils.SKOS_EXAMPLE,
  relationshipAnnotation: VocabularyUtils.AS_RELATIONSHIP,
};

const FacetedSearch: React.FC = () => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );
  const [page, setPage] = useState(0);
  const [params, setParams] = useState<{ [key: string]: SearchParam }>({});
  const [results, setResults] = React.useState<FacetedSearchResult[] | null>(
    null
  );
  const shortLocale = getShortLocale(locale);

  React.useEffect(() => {
    dispatch(getCustomAttributes());
  }, [dispatch]);

  // Filter custom attributes to those applying to terms
  const termAttributes = useMemo(
    () => customAttributes.filter((a) => a.domainIri === VocabularyUtils.TERM),
    [customAttributes]
  );

  const [visibleFacets, setVisibleFacets] = useState<VisibleFacets>({
    vocabulary: true,
    type: true,
    state: true,
    notation: true,
    example: true,
    relationshipAnnotation: true,
  });
  const toggleFacet = (key: FacetKey) => {
    setVisibleFacets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onChange = (value: SearchParam, debounce: boolean = false) => {
    const change: { [key: string]: SearchParam } = {};
    change[value.property as string] = value;
    setParams({ ...params, ...change });
    setPage(0);
    if (
      (value.matchType === MatchType.IRI ||
        (value.value.length > 0 && value.value[0].length === 0)) &&
      !debounce
    ) {
      runSearch({ ...params, ...change }, page);
    } else {
      debouncedSearch({ ...params, ...change }, page);
    }
  };
  const onPageChange = (page: number) => {
    setPage(page);
    runSearch(params, page);
  };
  const runSearch = React.useCallback(
    (params: { [key: string]: SearchParam }, page: number) => {
      const sp = aggregateSearchParams(params);
      if (sp.length === 0) {
        setPage(0);
        setResults(null);
        return;
      }
      trackPromise(
        dispatch(
          executeFacetedTermSearch(sp, {
            page,
            size: RESULT_PAGE_SIZE,
          })
        ),
        "faceted-search"
      ).then((res) => setResults(res));
    },
    [dispatch, setPage, setResults]
  );
  const debouncedSearch = useDebouncedCallback((params: {}, page: number) => {
    runSearch(params, page);
  }, Constants.SEARCH_DEBOUNCE_DELAY);

  const isParamActive = (p?: SearchParam): boolean => {
    if (!p || p.value.length === 0) return false;
    const v = p.value[0];
    if (typeof v === "string") {
      return p.matchType !== MatchType.IRI
        ? v.trim().length > 0
        : Utils.isUri(v.trim());
    }
    return v !== undefined;
  };

  // Effect to clear params when facets are hidden
  React.useEffect(() => {
    setParams((currentParams) => {
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
        runSearch(nextParams, 0);
        return nextParams;
      }
      return currentParams;
    });
  }, [visibleFacets, debouncedSearch, runSearch]);

  const onCustomAttributeToggle = (att: RdfProperty) => {
    const current = params[att.iri];
    const isOn = !!current;
    if (isOn) {
      const wasActive = isParamActive(current);
      const next = { ...params } as { [key: string]: SearchParam };
      delete next[att.iri];
      setParams(next);
      if (wasActive) {
        setPage(0);
        debouncedSearch.cancel();
        runSearch(next, 0);
      }
    } else {
      const next = {
        ...params,
        [att.iri]: createSearchParam(att),
      } as { [key: string]: SearchParam };
      setParams(next);
      setPage(0);
    }
  };

  return (
    <div id="faceted-search" className="relative">
      <WindowTitle title={i18n("search.tab.facets")} />
      <PromiseTrackingMask area="faceted-search" />
      <Card className="mb-0">
        <CardBody>
          <Row className="mb-3">
            <Col xs={12} className="d-flex align-items-start flex-wrap">
              <FacetToggle
                active={visibleFacets.vocabulary}
                label={i18n("type.vocabulary")}
                onClick={() => toggleFacet("vocabulary")}
              />
              <FacetToggle
                active={visibleFacets.type}
                label={i18n("term.metadata.types")}
                onClick={() => toggleFacet("type")}
              />
              <FacetToggle
                active={visibleFacets.state}
                label={i18n("term.metadata.status")}
                onClick={() => toggleFacet("state")}
              />
              <FacetToggle
                active={visibleFacets.notation}
                label={i18n("term.metadata.notation.label")}
                onClick={() => toggleFacet("notation")}
              />
              <FacetToggle
                active={visibleFacets.example}
                label={i18n("term.metadata.example.label")}
                onClick={() => toggleFacet("example")}
              />
              <FacetToggle
                active={visibleFacets.relationshipAnnotation}
                label={i18n("search.faceted.relationshipAnnotation")}
                onClick={() => toggleFacet("relationshipAnnotation")}
              />
              <div className="w-100" />
              {termAttributes.map((att) => {
                const active = !!params[att.iri];
                const label = getLocalized(att.label, shortLocale);
                return (
                  <FacetToggle
                    key={att.iri}
                    active={active}
                    label={label}
                    onClick={() => onCustomAttributeToggle(att)}
                  />
                );
              })}
            </Col>
          </Row>
          <Row>
            {visibleFacets.vocabulary && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <VocabularyFacet
                  value={
                    params[VocabularyUtils.IS_TERM_FROM_VOCABULARY] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
                        range: { iri: VocabularyUtils.VOCABULARY },
                      })
                    )
                  }
                  onChange={onChange}
                />
              </Col>
            )}
            {visibleFacets.type && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <TermTypeFacet
                  value={
                    params[VocabularyUtils.RDF_TYPE] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.RDF_TYPE,
                        range: { iri: VocabularyUtils.RDFS_RESOURCE },
                      })
                    )
                  }
                  onChange={onChange}
                />
              </Col>
            )}
            {visibleFacets.state && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <TermStateFacet
                  value={
                    params[VocabularyUtils.HAS_TERM_STATE] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.HAS_TERM_STATE,
                        range: { iri: VocabularyUtils.RDFS_RESOURCE },
                      })
                    )
                  }
                  onChange={onChange}
                />
              </Col>
            )}
            {visibleFacets.notation && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <TextFacet
                  id="faceted-search-notation"
                  label={i18n("term.metadata.notation.label")}
                  value={
                    params[VocabularyUtils.SKOS_NOTATION] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.SKOS_NOTATION,
                        range: { iri: VocabularyUtils.XSD_STRING },
                      }),
                      undefined,
                      MatchType.EXACT_MATCH
                    )
                  }
                  onChange={onChange}
                />
              </Col>
            )}
            {visibleFacets.example && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <TextFacet
                  id="faceted-search-examples"
                  label={i18n("term.metadata.example.label")}
                  value={
                    params[VocabularyUtils.SKOS_EXAMPLE] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.SKOS_EXAMPLE,
                        range: { iri: VocabularyUtils.XSD_STRING },
                      })
                    )
                  }
                  onChange={onChange}
                />
              </Col>
            )}
            {visibleFacets.relationshipAnnotation && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <TermSelectorFacet
                  id="faceted-search-relationship-annotation"
                  label={i18n("search.faceted.relationshipAnnotation")}
                  value={
                    params[VocabularyUtils.AS_RELATIONSHIP] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.AS_RELATIONSHIP,
                        range: { iri: VocabularyUtils.TERM },
                      })
                    )
                  }
                  onChange={onChange}
                />
              </Col>
            )}
            <CustomAttributeFacets
              values={params}
              onChange={onChange}
              allowedIris={Object.keys(params)}
              xl={4}
              md={6}
              xs={12}
            />
          </Row>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          {results && <FacetedSearchResults results={results} />}
          {results && (
            <SimplePagination
              page={page}
              setPage={onPageChange}
              pageSize={RESULT_PAGE_SIZE}
              itemCount={results.length === 0 ? 0 : RESULT_PAGE_SIZE}
              className="mt-3"
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default FacetedSearch;
