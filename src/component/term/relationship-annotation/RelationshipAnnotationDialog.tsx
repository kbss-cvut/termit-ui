import React from "react";
import { ResourceRelationship } from "./RelationshipAnnotationButton";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";
import { FormattedMessage } from "react-intl";
import { RelationshipAnnotationView } from "./RelationshipAnnotationView";
import { useAppSelector } from "../../../util/Types";
import Utils from "../../../util/Utils";

interface RelationshipAnnotationDialogProps {
  relationship: ResourceRelationship;
  show: boolean;
  onClose: () => void;
}

export const RelationshipAnnotationDialog: React.FC<
  RelationshipAnnotationDialogProps
> = ({ relationship, show, onClose }) => {
  const { locale } = useI18n();
  const shortLocale = getShortLocale(locale);
  const annotations = useAppSelector((state) => state.relationshipAnnotations);
  const predicate = Utils.sanitizeArray(relationship.predicate);
  const value = relationship.object;
  const relevantAnnotations = annotations.filter(
    (ann) =>
      predicate.includes(ann.relationship.relation.iri) &&
      ann.relationship.value.iri === value.iri
  );
  return (
    <Modal isOpen={show} size="lg" toggle={onClose}>
      <ModalHeader toggle={onClose}>
        <FormattedMessage
          id={"term.metadata.relationshipAnnotation.dialog.title"}
          values={{
            relationship: `${getLocalized(
              relationship.subject.label,
              shortLocale
            )} - ${relationship.predicateLabel} - ${getLocalized(
              relationship.object.label,
              shortLocale
            )}`,
          }}
        />
      </ModalHeader>
      <ModalBody>
        <RelationshipAnnotationView
          relationshipAnnotations={relevantAnnotations}
        />
      </ModalBody>
    </Modal>
  );
};
