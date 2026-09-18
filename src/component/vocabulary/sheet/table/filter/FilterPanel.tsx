import React from "react";
import { Collapse, Card, CardBody, Row, Col, Button } from "reactstrap";
import { useI18n } from "../../../../hook/useI18n";
import SearchParam, {
  MatchType,
} from "../../../../../model/search/SearchParam";
import TermTypeFacet from "../../../../search/facet/TermTypeFacet";
import { TermSelectorFacet } from "../../../../search/facet/TermSelectorFacet";
import TermStateFacet from "../../../../search/facet/TermStateFacet";
import TextFacet from "../../../../search/facet/TextFacet";
import VocabularyUtils from "../../../../../util/VocabularyUtils";
import { SKOS } from "../../../../../util/Namespaces";
import "./FilterPanel.scss";

export interface FilterPanelProps {
  isOpen: boolean;
  facetParams: { [key: string]: SearchParam };
  onFacetChange: (value: SearchParam) => void;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  isOpen,
  facetParams,
  onFacetChange,
  onClearFilters,
}) => {
  const { i18n } = useI18n();

  return (
    <Collapse isOpen={isOpen} className="vocabulary-sheet-view-filter-panel">
      <Card className="mb-3 shadow-sm">
        <CardBody>
          <Row className="align-items-end">
            {/* Label */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TextFacet
                id="table-filter-label"
                label={i18n("glossary.table.column.label")}
                value={
                  facetParams[SKOS.namespace + "prefLabel"] || {
                    property: SKOS.namespace + "prefLabel",
                    matchType: MatchType.SUBSTRING,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>
            {/* Type */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TermTypeFacet
                value={
                  facetParams[VocabularyUtils.RDF_TYPE] || {
                    property: VocabularyUtils.RDF_TYPE,
                    matchType: MatchType.IRI,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>
            {/* Exact Matches */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TermSelectorFacet
                id="table-filter-exact-matches"
                label={i18n("term.metadata.exactMatches")}
                value={
                  facetParams[SKOS.namespace + "exactMatch"] || {
                    property: SKOS.namespace + "exactMatch",
                    matchType: MatchType.IRI,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>
            {/* Parent Terms */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TermSelectorFacet
                id="table-filter-parent-terms"
                label={i18n("term.metadata.parent")}
                value={
                  facetParams[SKOS.namespace + "broader"] || {
                    property: SKOS.namespace + "broader",
                    matchType: MatchType.IRI,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>
            {/* Sub terms */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TermSelectorFacet
                id="table-filter-sub-terms"
                label={i18n("term.metadata.subTerms")}
                value={
                  facetParams[SKOS.namespace + "narrower"] || {
                    property: SKOS.namespace + "narrower",
                    matchType: MatchType.IRI,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>
            {/* Related Terms */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TermSelectorFacet
                id="table-filter-related-terms"
                label={i18n("term.metadata.related.title")}
                value={
                  facetParams[SKOS.namespace + "related"] || {
                    property: SKOS.namespace + "related",
                    matchType: MatchType.IRI,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>
            {/* Notation */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TextFacet
                id="table-filter-notation"
                label={i18n("term.metadata.notation.label")}
                value={
                  facetParams[VocabularyUtils.SKOS_NOTATION] || {
                    property: VocabularyUtils.SKOS_NOTATION,
                    matchType: MatchType.EXACT_MATCH,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>
            {/* Scope Note */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TextFacet
                id="table-filter-scope-note"
                label={i18n("term.metadata.comment")}
                value={
                  facetParams[SKOS.namespace + "scopeNote"] || {
                    property: SKOS.namespace + "scopeNote",
                    matchType: MatchType.SUBSTRING,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>

            {/* Example */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TextFacet
                id="table-filter-example"
                label={i18n("term.metadata.example.label")}
                value={
                  facetParams[VocabularyUtils.SKOS_EXAMPLE] || {
                    property: VocabularyUtils.SKOS_EXAMPLE,
                    matchType: MatchType.SUBSTRING,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>

            {/* Alt Labels */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TextFacet
                id="table-filter-alt-labels"
                label={i18n("term.metadata.altLabels.label")}
                value={
                  facetParams[SKOS.namespace + "altLabel"] || {
                    property: SKOS.namespace + "altLabel",
                    matchType: MatchType.SUBSTRING,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>

            {/* Hidden Labels */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TextFacet
                id="table-filter-hidden-labels"
                label={i18n("term.metadata.hiddenLabels.label")}
                value={
                  facetParams[SKOS.namespace + "hiddenLabel"] || {
                    property: SKOS.namespace + "hiddenLabel",
                    matchType: MatchType.SUBSTRING,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>

            {/* State */}
            <Col xl={4} md={6} xs={12} className="d-flex flex-column mb-3">
              <TermStateFacet
                value={
                  facetParams[VocabularyUtils.HAS_TERM_STATE] || {
                    property: VocabularyUtils.HAS_TERM_STATE,
                    matchType: MatchType.IRI,
                    value: [],
                  }
                }
                onChange={onFacetChange}
              />
            </Col>
          </Row>
          <div className="d-flex justify-content-end mb-2">
            <Button
              size="sm"
              color="secondary"
              outline
              onClick={onClearFilters}
            >
              {i18n("glossary.table.filters.clear")}
            </Button>
          </div>
        </CardBody>
      </Card>
    </Collapse>
  );
};
