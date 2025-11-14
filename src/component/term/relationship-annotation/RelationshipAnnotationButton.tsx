import React from "react";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { ReactComponent as RelationshipIcon } from "../../../asset/icon/term-relationship-icon.svg";
import BadgeButton from "../../misc/BadgeButton";
import { useI18n } from "../../hook/useI18n";
import Utils from "../../../util/Utils";
import { HasIdentifier } from "../../../model/Asset";

export interface ResourceRelationship {
  subject: HasIdentifier;
  predicate: string | string[];
  object: HasIdentifier;
}

interface RelationshipAnnotationButtonProps {
  relationship: ResourceRelationship;
}

export const RelationshipAnnotationButton: React.FC<
  RelationshipAnnotationButtonProps
> = ({ relationship }) => {
  const { i18n } = useI18n();
  const [showDialog, setShowDialog] = React.useState(false);
  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );
  const predicate = Utils.sanitizeArray(relationship.predicate);
  const relevantAttributes = customAttributes.filter((attr) =>
    Utils.sanitizeArray(attr.annotatedRelationships).some((pred) =>
      predicate.includes(pred.iri)
    )
  );
  if (relevantAttributes.length === 0) {
    return null;
  }
  return (
    <BadgeButton
      color="outline-dark"
      onClick={() => setShowDialog(!showDialog)}
      className="ml-1 align-top"
      title={i18n("term.metadata.relationshipAnnotation.button.tooltip")}
      style={{ padding: "8px" }}
    >
      <RelationshipIcon />
    </BadgeButton>
  );
};
