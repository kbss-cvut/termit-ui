import React from "react";
import User from "../../../model/User";
import { useI18n } from "../../hook/useI18n";
import InfoIcon from "../../misc/InfoIcon";
import Utils from "../../../util/Utils";
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

export type UserStatus = "ACTIVE" | "DISABLED" | "LOCKED";

export function resolveStatusKey(user: User): UserStatus {
  if (user.isLocked()) {
    return "LOCKED";
  } else if (user.isDisabled()) {
    return "DISABLED";
  } else {
    return "ACTIVE";
  }
}

export function resolveStatus(user: User) {
  return STATUS_MAP[resolveStatusKey(user)];
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
    </>
  );
};

export default UserStatusInfo;
