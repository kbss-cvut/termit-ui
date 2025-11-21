import React from "react";
import { ResourceRelationship } from "./RelationshipAnnotationButton";
import RelationshipAnnotation from "../../../model/meta/RelationshipAnnotation";
import { ThunkDispatch, useAppSelector } from "../../../util/Types";
import Utils from "../../../util/Utils";
import { Button, ButtonToolbar, Col, Row } from "reactstrap";
import { CustomAttributeValueEdit } from "../../genericmetadata/CustomAttributeValueEdit";
import { PropertyValueType } from "../../../model/WithUnmappedProperties";
import { useI18n } from "../../hook/useI18n";
import { useDispatch } from "react-redux";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {
  loadTermRelationshipAnnotations,
  updateTermRelationshipAnnotation,
} from "../../../action/AsyncTermRelationshipAnnotationActions";
import { trackPromise } from "react-promise-tracker";
import { publishSuccessMessage } from "../../../action/SyncActions";

export const RelationshipAnnotationEdit: React.FC<{
  relationship: ResourceRelationship;
  relationshipAnnotations: RelationshipAnnotation[];
  onCancel: () => void;
}> = ({ relationship, relationshipAnnotations, onCancel }) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
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
  const annotationAtts = customAttributes.filter((att) =>
    Utils.sanitizeArray(att.annotatedRelationships)
      .map((ar) => ar.iri)
      .includes(relationship.predicate)
  );
  const onChange = (annotationProp: string, value: PropertyValueType[]) => {
    setState(Object.assign({}, state, { [annotationProp]: value }));
  };
  const onSave = () => {
    const termIri = VocabularyUtils.create(relationship.subject.iri);
    trackPromise(
      Promise.all(
        Object.keys(state).map((annotationIri) => {
          const data: RelationshipAnnotation = {
            relationship: {
              subject: relationship.subject,
              relation: { iri: relationship.predicate },
              value: relationship.object,
            },
            attribute: { iri: annotationIri },
            value: state[annotationIri],
          };
          return dispatch(updateTermRelationshipAnnotation(termIri, data));
        })
      ),
      "relationship-annotations"
    ).then(() => {
      dispatch(loadTermRelationshipAnnotations(termIri));
      dispatch(
        publishSuccessMessage({
          messageId: "term.metadata.relationshipAnnotation.save.success",
        })
      );
    });
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
