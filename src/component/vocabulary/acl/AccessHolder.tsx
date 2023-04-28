import React from "react";
import { AccessControlRecordData } from "../../../model/acl/AccessControlList";
import { useI18n } from "../../hook/useI18n";
import Utils from "../../../util/Utils";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { Badge } from "reactstrap";
import { getLocalized } from "../../../model/MultilingualString";

const AccessHolder: React.FC<{ record: AccessControlRecordData }> = ({
  record,
}) => {
  const { i18n, locale } = useI18n();
  const types = Utils.sanitizeArray(record.types);
  let badgeText: string;
  if (types.indexOf(VocabularyUtils.USER_ACCESS_RECORD) !== -1) {
    badgeText = i18n("type.user");
  } else if (types.indexOf(VocabularyUtils.USERGROUP_ACCESS_RECORD) !== -1) {
    badgeText = i18n("type.usergroup");
  } else {
    badgeText = i18n("type.userrole");
  }

  return (
    <>
      <Badge className="acl-holder-type-badge mr-1 align-text-bottom">
        {badgeText}
      </Badge>
      {getLocalized(record.holder.label, locale)}
    </>
  );
};

export default AccessHolder;
