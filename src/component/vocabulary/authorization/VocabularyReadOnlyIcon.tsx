import React from "react";
import Vocabulary from "../../../model/Vocabulary";
import AssetReadOnlyIcon from "../../authorization/AssetReadOnlyIcon";
import { useI18n } from "../../hook/useI18n";
import AccessLevel from "../../../model/acl/AccessLevel";

const VocabularyReadOnlyIcon: React.FC<{ vocabulary: Vocabulary }> = ({
  vocabulary,
}) => {
  const { i18n } = useI18n();
  return !vocabulary.isEditable() ||
    vocabulary.accessLevel === AccessLevel.READ ? (
    <AssetReadOnlyIcon
      explanationId="auth.notEditable.message.readOnly"
      explanationValues={{ type: i18n("type.vocabulary").toLowerCase() }}
      id="vocabulary-read-only-icon"
      className="ml-1"
    />
  ) : null;
};

export default VocabularyReadOnlyIcon;
