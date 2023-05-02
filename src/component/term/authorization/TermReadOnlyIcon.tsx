import React from "react";
import AssetReadOnlyIcon from "../../authorization/AssetReadOnlyIcon";
import { useI18n } from "../../hook/useI18n";
import Term from "../../../model/Term";
import AccessLevel from "../../../model/acl/AccessLevel";

const TermReadOnlyIcon: React.FC<{ term: Term; accessLevel?: AccessLevel }> = ({
  term,
  accessLevel,
}) => {
  const { i18n } = useI18n();
  return !term.isEditable() || accessLevel === AccessLevel.READ ? (
    <AssetReadOnlyIcon
      explanationId="auth.notEditable.message.readOnly"
      explanationValues={{ type: i18n("type.term").toLowerCase() }}
      id="vocabulary-read-only-icon"
      className="ml-1"
    />
  ) : null;
};

export default TermReadOnlyIcon;
