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

function aggregateSearchParams(...params: SearchParam[]) {
  return params.filter((p) =>
    p.matchType === MatchType.IRI
      ? p.value.length > 0
      : p.value[0].trim().length > 0
  );
}

const FacetedSearch: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [notationParam, setNotationParam] = React.useState<SearchParam>({
    property: VocabularyUtils.SKOS_NOTATION,
    value: [""],
    matchType: MatchType.EXACT_MATCH,
  });
  const [typeParam, setTypeParam] = React.useState<SearchParam>({
    property: VocabularyUtils.RDF_TYPE,
    value: [],
    matchType: MatchType.IRI,
  });
  const [vocabularyParam, setVocabularyParam] = React.useState<SearchParam>({
    property: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
    value: [],
    matchType: MatchType.IRI,
  });
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
    const params = aggregateSearchParams(
      notationParam,
      typeParam,
      vocabularyParam
    );
    if (params.length === 0) {
      setPage(0);
      setResults(null);
      return;
    }
    runSearch(params);
  }, [notationParam, typeParam, vocabularyParam, runSearch]);

  return (
    <div id="faceted-search" className="relative">
      <WindowTitle title={i18n("search.tab.facets")} />
      <PromiseTrackingMask area="faceted-search" />
      <Card className="mb-0">
        <CardBody>
          <Row>
            <Col xs={4}>
              <TextFacet
                id="faceted-search-notation"
                label={i18n("term.metadata.notation.label")}
                value={notationParam}
                onChange={(v) => {
                  setNotationParam(v);
                  setPage(0);
                }}
              />
            </Col>
            <Col xs={4}>
              <TermTypeFacet
                value={typeParam}
                onChange={(v) => {
                  setTypeParam(v);
                  setPage(0);
                }}
              />
            </Col>
            <Col xs={4}>
              <VocabularyFacet
                value={vocabularyParam}
                onChange={(v) => {
                  setVocabularyParam(v);
                  setPage(0);
                }}
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
