import React from "react";
import { useI18n } from "../hook/useI18n";
import { Badge } from "reactstrap";

interface DraftBadgeProps {
  isDraft?: boolean;
}

const DraftBadge: React.FC<DraftBadgeProps> = ({ isDraft }) => {
  const { i18n } = useI18n();

  return (
    <Badge color="light" className="align-text-bottom">
      {i18n(
        isDraft
          ? "term.metadata.status.draft"
          : "term.metadata.status.confirmed"
      )}
    </Badge>
  );
};

DraftBadge.defaultProps = {
  isDraft: false,
};

export default DraftBadge;
