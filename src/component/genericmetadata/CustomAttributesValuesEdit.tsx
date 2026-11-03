import React from "react";
import { PropertyValuesType } from "../../model/WithUnmappedProperties";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { Col, Row } from "reactstrap";
import { CustomAttributeValueEdit } from "./CustomAttributeValueEdit";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";

export enum CustomAttributeAssetType {
  TERM = "term",
  VOCABULARY = "vocabulary",
  COLLECTION = "collection",
}

export type CustomAttributeAssetTypeValue = `${CustomAttributeAssetType}`;

const ASSET_TO_DOMAIN_MAP = {
  [CustomAttributeAssetType.TERM]: VocabularyUtils.TERM,
  [CustomAttributeAssetType.VOCABULARY]: VocabularyUtils.VOCABULARY,
  [CustomAttributeAssetType.COLLECTION]: VocabularyUtils.SKOS_COLLECTION,
};

export const CustomAttributesValuesEdit: React.FC<{
  assetType: CustomAttributeAssetType | CustomAttributeAssetTypeValue;
  values: Map<string, PropertyValuesType>;
  onChange: (property: string, value: PropertyValuesType) => void;
  language: string;
}> = ({ assetType, values, onChange, language }) => {
  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );
  const filterDomain = ASSET_TO_DOMAIN_MAP[assetType];
  const actualAttributes = React.useMemo(
    () => customAttributes.filter((att) => att.domainIri === filterDomain),
    [customAttributes, filterDomain]
  );

  return (
    <>
      {actualAttributes.map((att) => (
        <Row key={Utils.hashCode(att.iri)}>
          <Col xs={12}>
            <CustomAttributeValueEdit
              key={Utils.hashCode(att.iri)}
              attribute={att}
              values={values.get(att.iri) || []}
              onChange={(attribute, values) => onChange(attribute.iri, values)}
              language={language}
            />
          </Col>
        </Row>
      ))}
    </>
  );
};
