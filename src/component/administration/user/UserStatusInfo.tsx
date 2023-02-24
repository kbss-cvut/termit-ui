import React from "react";
import User from "../../../model/User";
import { useI18n } from "../../hook/useI18n";
import InfoIcon from "../../misc/InfoIcon";
import Utils from "../../../util/Utils";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { Badge } from "reactstrap";
import { GoCheck, GoCircleSlash, GoIssueOpened } from "react-icons/go";

export const STATUS_MAP = {
  ACTIVE: {
    buttonTitle: "administration.users.status.action.disable.tooltip",
    buttonLabel: "administration.users.status.action.disable",
    statusLabel: "administration.users.status.active",
    help: "administration.users.status.active.help",
    icon: GoCheck,
  },
  DISABLED: {
    buttonTitle: "administration.users.status.action.enable.tooltip",
    buttonLabel: "administration.users.status.action.enable",
    statusLabel: "administration.users.status.disabled",
    help: "administration.users.status.disabled.help",
    icon: GoCircleSlash,
  },
  LOCKED: {
    buttonTitle: "administration.users.status.action.unlock.tooltip",
    buttonLabel: "administration.users.status.action.unlock",
    statusLabel: "administration.users.status.locked",
    help: "administration.users.status.locked.help",
    icon: GoIssueOpened,
  },
};

export function resolveStatus(user: User) {
  if (user.isLocked()) {
    return STATUS_MAP.LOCKED;
  } else if (user.isDisabled()) {
    return STATUS_MAP.DISABLED;
  } else {
    return STATUS_MAP.ACTIVE;
  }
}

const BADGE_TYPES = {};
BADGE_TYPES[VocabularyUtils.USER_ADMIN] = {
  className: "m-user-admin",
  text: "ADMIN",
  title: "administration.users.types.admin",
};

function renderUserTypeBadges(user: User, i18n: (id: string) => string) {
  return user.types
    .filter((t) => BADGE_TYPES.hasOwnProperty(t))
    .map((t) => {
      const badgeInfo = BADGE_TYPES[t];
      return (
        <Badge
          key={t}
          color="primary"
          className={`ml-2 mb-1 align-middle ${badgeInfo.className}`}
          pill={true}
          title={i18n(badgeInfo.title)}
        >
          {badgeInfo.text}
        </Badge>
      );
    });
}

const UserStatusInfo: React.FC<{ user: User }> = ({ user }) => {
  const { i18n } = useI18n();
  const status = resolveStatus(user);
  return (
    <>
      {i18n(status.statusLabel)}
      <InfoIcon
        id={`user-${Utils.hashCode(user.iri)}-status-info`}
        text={i18n(status.help)}
        className="ml-1"
      />
      {renderUserTypeBadges(user, i18n)}
    </>
  );
};

export default UserStatusInfo;
