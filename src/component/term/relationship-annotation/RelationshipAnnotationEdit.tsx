import React from "react";
import { ResourceRelationship } from "./RelationshipAnnotationButton";
import RelationshipAnnotation from "../../../model/meta/RelationshipAnnotation";
import { ThunkDispatch, useAppSelector } from "../../../util/Types";
import Utils from "../../../util/Utils";
import { Button, ButtonToolbar, Col, Row } from "reactstrap";
import { CustomAttributeValueEdit } from "../../genericmetadata/CustomAttributeValueEdit";
import { PropertyValuesType } from "../../../model/WithUnmappedProperties";
import { useI18n } from "../../hook/useI18n";
import { useDispatch } from "react-redux";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {
  loadTermRelationshipAnnotations,
  updateTermRelationshipAnnotation,
} from "../../../action/AsyncTermRelationshipAnnotationActions";
import { trackPromise } from "react-promise-tracker";
import { publishSuccessMessage } from "../../../action/SyncActions";
import { getLanguages } from "../../../util/IntlUtil";
import EditLanguageSelector from "../../multilingual/EditLanguageSelector";
import { compactTranslations } from "../../../model/MultilingualString";
import { selectRelevantAndMultilingualCustomAttributeIris } from "./RelationshipAnnotationView";

export const RelationshipAnnotationEdit: React.FC<{
  relationship: ResourceRelationship;
  relationshipAnnotations: RelationshipAnnotation[];
  onCancel: () => void;
  onClose: () => void;
  /**
   * The language in which multilingual custom attribute values should be modified
   */
  language: string;
}> = ({
  relationship,
  relationshipAnnotations,
  onCancel,
  onClose,
  language,
}) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const customAttributes = useAppSelector((state) => state.customAttributes);
  const { annotationAtts, multilingualAttIris } =
    selectRelevantAndMultilingualCustomAttributeIris(
      customAttributes,
      relationship
    );
  const [state, setState] = React.useState<{
    [key: string]: PropertyValuesType;
  }>(() => {
    const initState = {};
    relationshipAnnotations.forEach((ann) => {
      initState[ann.attribute.iri] = multilingualAttIris.includes(
        ann.attribute.iri
      )
        ? compactTranslations(ann.value)
        : ann.value;
    });
    return initState;
  });
  const [selectedLanguage, setSelectedLanguage] = React.useState(language);

  const languages = getLanguages(multilingualAttIris, state);

  const onChange = (annotationProp: string, value: PropertyValuesType) => {
    setState(Object.assign({}, state, { [annotationProp]: value }));
  };
  const onRemoveTranslation = (lang: string) => {
    setState((state) => {
      const newState = { ...state };
      Object.values(newState).forEach((value) => {
        if (value[lang]) {
          delete value[lang];
        }
      });
      return newState;
    });
  };
  const onSave = () => {
    const termIri = VocabularyUtils.create(relationship.subject.iri);
    trackPromise(
      Promise.all(
        Object.keys(state).map((annotationIri) => {
          const data: RelationshipAnnotation = {
            relationship: {
              subject: { iri: relationship.subject.iri },
              relation: { iri: relationship.predicate },
              value: { iri: relationship.object.iri },
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
      onClose();
    });
  };

  return (
    <>
      {multilingualAttIris.length > 0 && (
        <EditLanguageSelector
          existingLanguages={languages}
          language={selectedLanguage}
          onSelect={setSelectedLanguage}
          onRemove={onRemoveTranslation}
        />
      )}
      {annotationAtts.map((att) => (
        <Row key={Utils.hashCode(att.iri)}>
          <Col xs={12}>
            <CustomAttributeValueEdit
              key={Utils.hashCode(att.iri)}
              attribute={att}
              values={state[att.iri] || []}
              onChange={(attribute, values) => onChange(attribute.iri, values)}
              language={selectedLanguage}
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
