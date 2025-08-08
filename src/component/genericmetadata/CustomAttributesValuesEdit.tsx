import React from "react";
import { PropertyValueType } from "../../model/WithUnmappedProperties";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { Col, Row } from "reactstrap";
import { CustomAttributeValueEdit } from "./CustomAttributeValueEdit";
import Utils from "src/util/Utils";

export const CustomAttributesValuesEdit: React.FC<{
  values: Map<string, PropertyValueType[]>;
  onChange: (property: string, value: PropertyValueType[]) => void;
}> = ({ values, onChange }) => {
  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );

  return (
    <>
      {customAttributes.map((att) => (
        <Row>
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
