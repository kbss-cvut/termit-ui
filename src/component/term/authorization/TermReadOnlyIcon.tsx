import React from "react";
import Vocabulary from "../../../model/Vocabulary";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { isAssetEditable } from "../../../util/Authorization";
import AssetReadOnlyIcon from "../../authorization/AssetReadOnlyIcon";
import { useI18n } from "../../hook/useI18n";

const TermReadOnlyIcon: React.FC<{ vocabulary: Vocabulary }> = ({
  vocabulary,
}) => {
  const { i18n } = useI18n();
  const user = useSelector((state: TermItState) => state.user);
  return !isAssetEditable(vocabulary, user) ? (
    <AssetReadOnlyIcon
      explanationId="auth.notEditable.message.readOnly"
      explanationValues={{ type: i18n("type.term").toLowerCase() }}
      id="vocabulary-read-only-icon"
      className="ml-1"
    />
  ) : null;
};

export default TermReadOnlyIcon;
