import React, { useState } from "react";
import WindowTitle from "../../misc/WindowTitle";
import { useI18n } from "../../hook/useI18n";
import { Card, CardBody, Col, Row } from "reactstrap";
import SearchParam, { MatchType } from "../../../model/search/SearchParam";
import VocabularyUtils from "../../../util/VocabularyUtils";
import TextFacet from "./TextFacet";
import { FacetedSearchResult } from "../../../model/search/FacetedSearchResult";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
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

function aggregateSearchParams(params: { [key: string]: SearchParam }) {
  return Object.entries(params)
    .map((e) => e[1])
    .filter((p) =>
      p.matchType === MatchType.IRI
        ? p.value.length > 0
        : p.value[0].trim().length > 0
    );
}

const INITIAL_STATE = {};
INITIAL_STATE[VocabularyUtils.SKOS_NOTATION] = {
  property: VocabularyUtils.SKOS_NOTATION,
  value: [""],
  matchType: MatchType.EXACT_MATCH,
};
INITIAL_STATE[VocabularyUtils.RDF_TYPE] = {
  property: VocabularyUtils.RDF_TYPE,
  value: [],
  matchType: MatchType.IRI,
};
INITIAL_STATE[VocabularyUtils.TERM_STATE] = {
  property: VocabularyUtils.TERM_STATE,
  value: [],
  matchType: MatchType.IRI,
};
INITIAL_STATE[VocabularyUtils.IS_TERM_FROM_VOCABULARY] = {
  property: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
  value: [],
  matchType: MatchType.IRI,
};

const FacetedSearch: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [params, setParams] = useState(INITIAL_STATE);
  const onChange = (value: SearchParam) => {
    const change = {};
    change[value.property] = value;
    setParams({ ...params, ...change });
    setPage(0);
  };
  const [results, setResults] =
    React.useState<FacetedSearchResult[] | null>(null);
  const runSearch = React.useCallback(
    (params: SearchParam[]) => {
      trackPromise(
        dispatch(
          executeFacetedTermSearch(params, {
            page,
            size: Constants.DEFAULT_PAGE_SIZE,
          })
        ),
        "faceted-search"
      ).then((res) => setResults(res));
    },
    [page, dispatch, setResults]
  );
  React.useEffect(() => {
    const sp = aggregateSearchParams(params);
    if (sp.length === 0) {
      setPage(0);
      setResults(null);
      return;
    }
    runSearch(sp);
  }, [params, runSearch]);

  return (
    <div id="faceted-search" className="relative">
      <WindowTitle title={i18n("search.tab.facets")} />
      <PromiseTrackingMask area="faceted-search" />
      <Card className="mb-0">
        <CardBody>
          <Row>
            <Col xl={3} xs={6}>
              <TextFacet
                id="faceted-search-notation"
                label={i18n("term.metadata.notation.label")}
                value={params[VocabularyUtils.SKOS_NOTATION]}
                onChange={onChange}
              />
            </Col>
            <Col xl={3} xs={6}>
              <VocabularyFacet
                value={params[VocabularyUtils.IS_TERM_FROM_VOCABULARY]}
                onChange={onChange}
              />
            </Col>
            <Col xl={3} xs={6}>
              <TermTypeFacet
                value={params[VocabularyUtils.RDF_TYPE]}
                onChange={onChange}
              />
            </Col>
            <Col xl={3} xs={6}>
              <TermStateFacet
                value={params[VocabularyUtils.TERM_STATE]}
                onChange={onChange}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          {results && <FacetedSearchResults results={results} />}
          {results && (
            <SimplePagination
              page={page}
              setPage={setPage}
              pageSize={Constants.LAST_COMMENTED_ASSET_LIMIT}
              itemCount={
                results.length === 0 ? 0 : Constants.LAST_COMMENTED_ASSET_LIMIT
              }
              className="mt-3"
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default FacetedSearch;
