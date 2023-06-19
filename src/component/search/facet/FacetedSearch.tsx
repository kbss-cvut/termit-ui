import React from "react";
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

const FacetedSearch: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
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
  const [results, setResults] =
    React.useState<FacetedSearchResult[] | null>(null);
  React.useEffect(() => {
    const params: SearchParam[] = [];
    if (notationParam.value[0].trim().length > 0) {
      params.push(notationParam);
    }
    if (typeParam.value.length > 0) {
      params.push(typeParam);
    }
    if (params.length > 0) {
      trackPromise(
        dispatch(executeFacetedTermSearch(params)),
        "faceted-search"
      ).then((res) => setResults(res));
    }
  }, [notationParam, typeParam, dispatch]);
  // TODO
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
                onChange={setNotationParam}
              />
            </Col>
            <Col xs={4}>
              <TermTypeFacet value={typeParam} onChange={setTypeParam} />
            </Col>
          </Row>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          {results && <FacetedSearchResults results={results} />}
        </CardBody>
      </Card>
    </div>
  );
};

export default FacetedSearch;
