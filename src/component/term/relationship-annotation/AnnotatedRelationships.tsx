import React from "react";
import { useI18n } from "../../hook/useI18n";
import { useAppSelector } from "../../../util/Types";
import TermLink from "../TermLink";
import AssetLabel from "../../misc/AssetLabel";
import AnnotatedTermRelationship from "../../../model/meta/AnnotatedTermRelationship";
import { Col, Label, Row } from "reactstrap";
import Utils from "../../../util/Utils";

export const AnnotatedRelationships: React.FC = () => {
  const { i18n } = useI18n();
  const annotatedRelationships = useAppSelector(
    (state) => state.annotatedRelationships
  );
  if (annotatedRelationships.length === 0) {
    return (
      <div className="additional-metadata-container italics">
        {i18n("term.metadata.annotatedRelationships.empty")}
      </div>
    );
  }

  const groupedByAnnotationProperty = annotatedRelationships.reduce(
    (acc, rel) => {
      if (!acc[rel.annotationProperty.iri]) {
        acc[rel.annotationProperty.iri] = [];
      }
      acc[rel.annotationProperty.iri].push(rel);
      return acc;
    },
    {} as Record<string, AnnotatedTermRelationship[]>
  );

  return (
    <div className="additional-metadata-container">
      {Object.keys(groupedByAnnotationProperty).map((prop) => (
        <>
          <Row key={prop}>
            <Col>
              <Label className="attribute-label ml-3 mb-3">
                <AssetLabel iri={prop} />
              </Label>
            </Col>
          </Row>
          {groupedByAnnotationProperty[prop].map((rel) => (
            <Row
              key={Utils.hashCode(
                `${rel.subject.iri}-${rel.property.iri}-${rel.object.iri}`
              )}
              className="ml-3"
            >
              <Col xs={3}>
                <TermLink term={rel.subject} showVocabularyBadge={true} />
              </Col>
              <Col xs={3}>
                <AssetLabel iri={rel.property.iri} />
              </Col>
              <Col xs={3}>
                <TermLink term={rel.object} showVocabularyBadge={true} />
              </Col>
            </Row>
          ))}
        </>
      ))}
    </div>
  );
};
