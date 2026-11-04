import React from "react";
import { useAppSelector } from "../../../util/Types";
import Utils from "../../../util/Utils";
import { useI18n } from "../../hook/useI18n";
import { getLanguages, getShortLocale } from "../../../util/IntlUtil";
// @ts-ignore
import { Col, Label, List, Row } from "reactstrap";
import {
  compactTranslations,
  getLocalized,
  PluralMultilingualString,
} from "../../../model/MultilingualString";
import {
  PropertyValueType,
  stringifyPropertyValue,
} from "../../../model/WithUnmappedProperties";
import { CustomAttributeValue } from "../../genericmetadata/CustomAttributesValues";
import RelationshipAnnotation from "../../../model/meta/RelationshipAnnotation";
import { ResourceRelationship } from "./RelationshipAnnotationButton";
import VocabularyUtils from "../../../util/VocabularyUtils";
import LanguageSelector from "../../multilingual/LanguageSelector";
import { CustomAttribute } from "../../../model/RdfsResource";

export function selectRelevantAndMultilingualCustomAttributeIris(
  customAttributes: CustomAttribute[],
  relationship: ResourceRelationship
) {
  const annotationAtts = customAttributes.filter((att) =>
    Utils.sanitizeArray(att.annotatedRelationships)
      .map((ar) => ar.iri)
      .includes(relationship.predicate)
  );
  const multilingualAttIris = annotationAtts
    .filter((att) => att.rangeIri === VocabularyUtils.RDF_LANGSTRING)
    .map((att) => att.iri);
  return { annotationAtts, multilingualAttIris };
}

export const RelationshipAnnotationView: React.FC<{
  relationshipAnnotations: RelationshipAnnotation[];
  relationship: ResourceRelationship;
  /**
   * The language in which multilingual custom attribute values should be displayed
   */
  language: string;
}> = ({ relationshipAnnotations, relationship, language }) => {
  const { locale } = useI18n();
  const lang = getShortLocale(locale);
  const [selectedLanguage, setSelectedLanguage] = React.useState(language);
  const customAttributes = useAppSelector((state) => state.customAttributes);
  const { annotationAtts, multilingualAttIris } =
    selectRelevantAndMultilingualCustomAttributeIris(
      customAttributes,
      relationship
    );
  const annotationObject = {};
  relationshipAnnotations
    .filter((ann) => multilingualAttIris.includes(ann.attribute.iri))
    .forEach((ann) => (annotationObject[ann.attribute.iri] = ann.value));
  const languages = getLanguages(multilingualAttIris, annotationObject);

  return (
    <>
      {multilingualAttIris.length > 0 && (
        <LanguageSelector
          languages={languages}
          language={selectedLanguage}
          onSelect={setSelectedLanguage}
        />
      )}
      {annotationAtts.map((att) => {
        const annotation = relationshipAnnotations.find(
          (ann) => ann.attribute.iri === att.iri
        );
        if (!annotation) {
          return null;
        }
        let value = annotation.value;
        if (multilingualAttIris.includes(att.iri)) {
          value = compactTranslations(value);
        }
        const valueToRender = Utils.sanitizeArray<
          PropertyValueType | PluralMultilingualString
        >(value);
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
                <CustomAttributeValue
                  attribute={att}
                  value={value[0]}
                  language={selectedLanguage}
                />
              ) : (
                <List type="unstyled" className="mb-3">
                  {valueToRender.map((val) => (
                    <li key={stringifyPropertyValue(val)}>
                      <CustomAttributeValue
                        attribute={att}
                        value={val}
                        language={selectedLanguage}
                      />
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
