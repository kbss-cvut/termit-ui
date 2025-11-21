import React from "react";
import { ResourceRelationship } from "./RelationshipAnnotationButton";
import { Button, Modal, ModalBody, ModalHeader } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";
import { RelationshipAnnotationView } from "./RelationshipAnnotationView";
import { useAppSelector } from "../../../util/Types";
import HeaderWithActions from "../../misc/HeaderWithActions";
import AccessLevel from "../../../model/acl/AccessLevel";
import IfVocabularyActionAuthorized from "../../vocabulary/authorization/IfVocabularyActionAuthorized";
import { RelationshipAnnotationEdit } from "./RelationshipAnnotationEdit";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";

interface RelationshipAnnotationDialogProps {
  relationship: ResourceRelationship;
  show: boolean;
  onClose: () => void;
}

export const RelationshipAnnotationDialog: React.FC<
  RelationshipAnnotationDialogProps
> = ({ relationship, show, onClose }) => {
  const { i18n, locale } = useI18n();
  const [edit, setEdit] = React.useState(false);
  React.useEffect(() => {
    setEdit(false);
  }, [show]);
  const shortLocale = getShortLocale(locale);
  const annotations = useAppSelector((state) => state.relationshipAnnotations);
  const vocabulary = useAppSelector((state) => state.vocabulary);
  const value = relationship.object;
  const relevantAnnotations = annotations.filter(
    (ann) =>
      relationship.predicate === ann.relationship.relation.iri &&
      ann.relationship.value.iri === value.iri
  );
  return (
    <Modal isOpen={show} size="lg" toggle={onClose}>
      <ModalHeader toggle={onClose}>
        {i18n("term.metadata.relationshipAnnotation")}
      </ModalHeader>
      <ModalBody>
        <PromiseTrackingMask area="relationship-annotations" />
        <HeaderWithActions
          title={`${getLocalized(relationship.subject.label, shortLocale)} - ${
            relationship.predicateLabel
          } - ${getLocalized(relationship.object.label, shortLocale)}`}
          actions={
            !edit ? (
              <IfVocabularyActionAuthorized
                vocabulary={vocabulary}
                requiredAccessLevel={AccessLevel.WRITE}
              >
                <Button
                  id="edit-relationship-annotations"
                  onClick={() => setEdit(!edit)}
                  size="sm"
                  color="primary"
                >
                  {i18n("edit")}
                </Button>
              </IfVocabularyActionAuthorized>
            ) : null
          }
        />
        {edit ? (
          <RelationshipAnnotationEdit
            relationship={relationship}
            relationshipAnnotations={relevantAnnotations}
            onCancel={() => setEdit(false)}
          />
        ) : (
          <RelationshipAnnotationView
            relationshipAnnotations={relevantAnnotations}
            relationship={relationship}
          />
        )}
      </ModalBody>
    </Modal>
  );
};
