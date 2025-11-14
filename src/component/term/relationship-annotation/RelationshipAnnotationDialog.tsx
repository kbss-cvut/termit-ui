import React from "react";
import { ResourceRelationship } from "./RelationshipAnnotationButton";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { useI18n } from "../../hook/useI18n";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";
import { FormattedMessage } from "react-intl";

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
      <ModalBody></ModalBody>
    </Modal>
  );
};
