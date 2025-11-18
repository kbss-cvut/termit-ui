import React from "react";
import { ResourceRelationship } from "./RelationshipAnnotationButton";
import RelationshipAnnotation from "../../../model/meta/RelationshipAnnotation";
import { useAppSelector } from "../../../util/Types";
import Utils from "../../../util/Utils";
import { Button, ButtonToolbar, Col, Row } from "reactstrap";
import { CustomAttributeValueEdit } from "../../genericmetadata/CustomAttributeValueEdit";
import { PropertyValueType } from "../../../model/WithUnmappedProperties";
import { useI18n } from "../../hook/useI18n";

export const RelationshipAnnotationEdit: React.FC<{
  relationship: ResourceRelationship;
  relationshipAnnotations: RelationshipAnnotation[];
  onCancel: () => void;
}> = ({ relationship, relationshipAnnotations, onCancel }) => {
  const { i18n } = useI18n();
  const [state, setState] = React.useState<{
    [key: string]: PropertyValueType[];
  }>({});
  React.useEffect(() => {
    const initState = {};
    relationshipAnnotations.forEach((ann) => {
      initState[ann.attribute.iri] = ann.value;
    });
    setState(initState);
  }, [relationshipAnnotations, setState]);
  const customAttributes = useAppSelector((state) => state.customAttributes);
  const predicate = Utils.sanitizeArray(relationship.predicate);
  const annotationAtts = customAttributes.filter((att) =>
    Utils.sanitizeArray(att.annotatedRelationships).some((rel) =>
      predicate.includes(rel.iri)
    )
  );
  const onChange = (annotationProp: string, value: PropertyValueType[]) => {
    setState(Object.assign({}, state, { [annotationProp]: value }));
  };
  const onSave = () => {
    // TODO
  };

  return (
    <>
      {annotationAtts.map((att) => (
        <Row key={Utils.hashCode(att.iri)}>
          <Col xs={12}>
            <CustomAttributeValueEdit
              key={Utils.hashCode(att.iri)}
              attribute={att}
              values={state[att.iri] || []}
              onChange={(attribute, values) => onChange(attribute.iri, values)}
            />
          </Col>
        </Row>
      ))}
      <ButtonToolbar className="float-right">
        <Button
          id="relationship-annotation-edit-submit"
          color="success"
          size="sm"
          onClick={onSave}
        >
          {i18n("save")}
        </Button>
        <Button
          id="role-edit-cancel"
          color="outline-dark"
          size="sm"
          onClick={onCancel}
        >
          {i18n("cancel")}
        </Button>
      </ButtonToolbar>
    </>
  );
};
