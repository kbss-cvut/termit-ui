import React from "react";
import AssetReadOnlyIcon from "../../authorization/AssetReadOnlyIcon";
import { useI18n } from "../../hook/useI18n";
import Term from "../../../model/Term";
import AccessLevel from "../../../model/acl/AccessLevel";
import Vocabulary from "../../../model/Vocabulary";

const TermReadOnlyIcon: React.FC<{ term: Term; vocabulary: Vocabulary }> = ({
  term,
  vocabulary,
}) => {
  const { i18n } = useI18n();
  return !term.isEditable() ||
    !vocabulary.isEditable() ||
    vocabulary.accessLevel === AccessLevel.READ ? (
    <AssetReadOnlyIcon
      explanationId="auth.notEditable.message.readOnly"
      explanationValues={{ type: i18n("type.term").toLowerCase() }}
      id="term-read-only-icon"
      className="ml-1"
    />
  ) : null;
};

export default TermReadOnlyIcon;
