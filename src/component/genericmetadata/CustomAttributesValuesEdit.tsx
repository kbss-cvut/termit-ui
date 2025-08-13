import React from "react";
import { PropertyValueType } from "../../model/WithUnmappedProperties";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { Col, Row } from "reactstrap";
import { CustomAttributeValueEdit } from "./CustomAttributeValueEdit";
import Utils from "src/util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";

export const CustomAttributesValuesEdit: React.FC<{
  assetType: "term" | "vocabulary";
  values: Map<string, PropertyValueType[]>;
  onChange: (property: string, value: PropertyValueType[]) => void;
}> = ({ assetType, values, onChange }) => {
  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );
  const filterDomain =
    assetType === "term" ? VocabularyUtils.TERM : VocabularyUtils.VOCABULARY;
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
            />
          </Col>
        </Row>
      ))}
    </>
  );
};
