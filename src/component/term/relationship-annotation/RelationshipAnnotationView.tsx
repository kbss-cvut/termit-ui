import React from "react";
import { useAppSelector } from "../../../util/Types";
import Utils from "../../../util/Utils";
import { useI18n } from "../../hook/useI18n";
import { getShortLocale } from "../../../util/IntlUtil";
// @ts-ignore
import { Col, Label, List, Row } from "reactstrap";
import { getLocalized } from "../../../model/MultilingualString";
import { stringifyPropertyValue } from "../../../model/WithUnmappedProperties";
import { CustomAttributeValue } from "../../genericmetadata/CustomAttributesValues";
import RelationshipAnnotation from "../../../model/meta/RelationshipAnnotation";
import { ResourceRelationship } from "./RelationshipAnnotationButton";

export const RelationshipAnnotationView: React.FC<{
  relationshipAnnotations: RelationshipAnnotation[];
  relationship: ResourceRelationship;
}> = ({ relationshipAnnotations, relationship }) => {
  const { locale } = useI18n();
  const lang = getShortLocale(locale);
  const customAttributes = useAppSelector((state) => state.customAttributes);
  const annotationAtts = customAttributes.filter((att) =>
    Utils.sanitizeArray(att.annotatedRelationships)
      .map((ar) => ar.iri)
      .includes(relationship.predicate)
  );

  return (
    <>
      {annotationAtts.map((att) => {
        const annotation: RelationshipAnnotation =
          relationshipAnnotations.find(
            (ann) => ann.attribute.iri === att.iri
          ) || ({} as RelationshipAnnotation);
        const value = Utils.sanitizeArray(annotation.value);
        return (
          <Row key={Utils.hashCode(att.iri)}>
            <Col md={4}>
              <Label
                className="attribute-label mb-3"
                title={getLocalized(att.comment, lang)}
              >
                {getLocalized(att.label, lang)}
              </Label>
            </Col>
            <Col md={8}>
              {value.length === 1 ? (
                <CustomAttributeValue attribute={att} value={value[0]} />
              ) : (
                <List type="unstyled" className="mb-3">
                  {value.map((val) => (
                    <li key={stringifyPropertyValue(val)}>
                      <CustomAttributeValue attribute={att} value={val} />
                    </li>
                  ))}
                </List>
              )}
            </Col>
          </Row>
        );
      })}
    </>
  );
};
