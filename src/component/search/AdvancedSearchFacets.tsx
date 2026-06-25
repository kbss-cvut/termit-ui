import React from "react";
import { Card, CardBody, Col, Collapse, Row } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import VocabularyUtils from "../../util/VocabularyUtils";
import SearchParam, { MatchType } from "../../model/search/SearchParam";
import { RdfProperty } from "../../model/RdfsResource";
import { getLocalized } from "../../model/MultilingualString";
import { createSearchParam } from "./facet/FacetedSearchUtil";
import TextFacet from "./facet/TextFacet";
import TermTypeFacet from "./facet/TermTypeFacet";
import VocabularyFacet from "./facet/VocabularyFacet";
import TermStateFacet from "./facet/TermStateFacet";
import FacetToggle from "./facet/FacetToggle";
import { TermSelectorFacet } from "./facet/TermSelectorFacet";
import { CustomAttributeFacets } from "./facet/CustomAttributeFacets";

export const FACET_KEYS = [
  "vocabulary",
  "type",
  "state",
  "notation",
  "example",
  "relationshipAnnotation",
] as const;
export type FacetKey = (typeof FACET_KEYS)[number];
export type VisibleFacets = Record<FacetKey, boolean>;
export const FACET_PARAM_MAP: Record<FacetKey, string> = {
  vocabulary: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
  type: VocabularyUtils.RDF_TYPE,
  state: VocabularyUtils.HAS_TERM_STATE,
  notation: VocabularyUtils.SKOS_NOTATION,
  example: VocabularyUtils.SKOS_EXAMPLE,
  relationshipAnnotation: VocabularyUtils.AS_RELATIONSHIP,
};

interface AdvancedSearchFacetsProps {
  isOpen: boolean;
  facetParams: { [key: string]: SearchParam };
  visibleFacets: VisibleFacets;
  termAttributes: RdfProperty[];
  shortLocale: string;
  onFacetChange: (value: SearchParam, debounce?: boolean) => void;
  toggleFacet: (key: FacetKey) => void;
  onCustomAttributeToggle: (att: RdfProperty) => void;
}

const AdvancedSearchFacets: React.FC<AdvancedSearchFacetsProps> = ({
  isOpen,
  facetParams,
  visibleFacets,
  termAttributes,
  shortLocale,
  onFacetChange,
  toggleFacet,
  onCustomAttributeToggle,
}) => {
  const { i18n } = useI18n();

  return (
    <Collapse isOpen={isOpen}>
      <Card className="mb-3">
        <CardBody>
          {/* Facet toggle buttons */}
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
                const active = !!facetParams[att.iri];
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

          {/* Facet widgets */}
          <Row>
            {visibleFacets.vocabulary && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <VocabularyFacet
                  value={
                    facetParams[VocabularyUtils.IS_TERM_FROM_VOCABULARY] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
                        range: { iri: VocabularyUtils.VOCABULARY },
                      })
                    )
                  }
                  onChange={onFacetChange}
                />
              </Col>
            )}
            {visibleFacets.type && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <TermTypeFacet
                  value={
                    facetParams[VocabularyUtils.RDF_TYPE] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.RDF_TYPE,
                        range: { iri: VocabularyUtils.RDFS_RESOURCE },
                      })
                    )
                  }
                  onChange={onFacetChange}
                />
              </Col>
            )}
            {visibleFacets.state && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <TermStateFacet
                  value={
                    facetParams[VocabularyUtils.HAS_TERM_STATE] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.HAS_TERM_STATE,
                        range: { iri: VocabularyUtils.RDFS_RESOURCE },
                      })
                    )
                  }
                  onChange={onFacetChange}
                />
              </Col>
            )}
            {visibleFacets.notation && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <TextFacet
                  id="faceted-search-notation"
                  label={i18n("term.metadata.notation.label")}
                  value={
                    facetParams[VocabularyUtils.SKOS_NOTATION] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.SKOS_NOTATION,
                        range: { iri: VocabularyUtils.XSD_STRING },
                      }),
                      undefined,
                      MatchType.EXACT_MATCH
                    )
                  }
                  onChange={onFacetChange}
                />
              </Col>
            )}
            {visibleFacets.example && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <TextFacet
                  id="faceted-search-examples"
                  label={i18n("term.metadata.example.label")}
                  value={
                    facetParams[VocabularyUtils.SKOS_EXAMPLE] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.SKOS_EXAMPLE,
                        range: { iri: VocabularyUtils.XSD_STRING },
                      })
                    )
                  }
                  onChange={onFacetChange}
                />
              </Col>
            )}
            {visibleFacets.relationshipAnnotation && (
              <Col xl={4} md={6} xs={12} className="mb-3">
                <TermSelectorFacet
                  id="faceted-search-relationship-annotation"
                  label={i18n("search.faceted.relationshipAnnotation")}
                  value={
                    facetParams[VocabularyUtils.AS_RELATIONSHIP] ||
                    createSearchParam(
                      new RdfProperty({
                        iri: VocabularyUtils.AS_RELATIONSHIP,
                        range: { iri: VocabularyUtils.TERM },
                      })
                    )
                  }
                  onChange={onFacetChange}
                />
              </Col>
            )}
            <CustomAttributeFacets
              values={facetParams}
              onChange={onFacetChange}
              allowedIris={Object.keys(facetParams)}
              xl={4}
              md={6}
              xs={12}
            />
          </Row>
        </CardBody>
      </Card>
    </Collapse>
  );
};

export default AdvancedSearchFacets;
