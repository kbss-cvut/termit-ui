import * as React from "react";
import classNames from "classnames";
import User from "../../model/User";
import { Badge, Button } from "reactstrap";
import Utils from "../../util/Utils";
import { GoCheck, GoCircleSlash, GoIssueOpened } from "react-icons/go";
import InfoIcon from "../misc/InfoIcon";
import VocabularyUtils from "../../util/VocabularyUtils";
import UserRoles from "./UserRoles";
import { useI18n } from "../hook/useI18n";

const STATUS_MAP = {
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

function resolveStatus(user: User) {
  if (user.isLocked()) {
    return STATUS_MAP.LOCKED;
  } else if (user.isDisabled()) {
    return STATUS_MAP.DISABLED;
  } else {
    return STATUS_MAP.ACTIVE;
  }
}

function renderActionButtons(
  user: User,
  actions: UserActions,
  i18n: (id: string) => string
) {
  const buttons = [];
  if (user.isDisabled()) {
    const btnId = `user-${Utils.hashCode(user.iri)}-enable`;
    buttons.push(
      <Button
        id={btnId}
        key={btnId}
        size="sm"
        onClick={() => actions.enable(user)}
        title={i18n(STATUS_MAP.DISABLED.buttonTitle)}
        className="users-action-button"
        color="primary"
      >
        {i18n(STATUS_MAP.DISABLED.buttonLabel)}
      </Button>
    );
  } else {
    const btnId = `user-${Utils.hashCode(user.iri)}-disable`;
    buttons.push(
      <Button
        id={btnId}
        key={btnId}
        size="sm"
        onClick={() => actions.disable(user)}
        title={i18n(STATUS_MAP.ACTIVE.buttonTitle)}
        className="users-action-button"
        color="warning"
      >
        {i18n(STATUS_MAP.ACTIVE.buttonLabel)}
      </Button>
    );
  }
  if (user.isLocked()) {
    const btnId = `user-${Utils.hashCode(user.iri)}-unlock`;
    buttons.push(
      <Button
        id={btnId}
        key={btnId}
        size="sm"
        onClick={() => actions.unlock(user)}
        title={i18n(STATUS_MAP.LOCKED.buttonTitle)}
        className="users-action-button"
        color="primary"
      >
        {i18n(STATUS_MAP.LOCKED.buttonLabel)}
      </Button>
    );
  }
  const btnId2 = `user-${Utils.hashCode(user.iri)}-changerole`;
  buttons.push(
    <Button
      id={btnId2}
      key={btnId2}
      size="sm"
      onClick={() => actions.changeRole(user)}
      title={i18n("administration.users.action.changerole.tooltip")}
      className="users-action-button"
      color="primary"
    >
      {i18n("administration.users.action.changerole")}
    </Button>
  );
  return buttons;
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

export interface UserActions {
  disable: (user: User) => void;
  enable: (user: User) => void;
  unlock: (user: User) => void;
  changeRole: (user: User) => void;
}

interface UserRowProps {
  user: User;
  currentUser?: boolean; // Whether this row represents the currently logged in user
  actions: UserActions;
}

export const UserRow: React.FC<UserRowProps> = (props: UserRowProps) => {
  const { user } = props;
  const { i18n } = useI18n();
  const status = resolveStatus(user);
  const isCurrentUser = props.currentUser;
  return (
    <tr
      className={classNames({ italics: !user.isActive(), bold: isCurrentUser })}
      title={isCurrentUser ? i18n("administration.users.you") : undefined}
    >
      <td className="align-middle" title={i18n(status.statusLabel)}>
        {React.createElement(status.icon)}
      </td>
      <td className="align-middle">{user.fullName}</td>
      <td className="align-middle">{user.username}</td>
      <td className="m-user-status align-middle">
        {i18n(status.statusLabel)}
        <InfoIcon
          id={`user-${Utils.hashCode(user.iri)}-status-info`}
          text={i18n(status.help)}
        />
        {renderUserTypeBadges(user, i18n)}
      </td>
      <td className="align-middle">
        <UserRoles user={user} />
      </td>
      <td className="users-row-actions align-middle">
        {isCurrentUser ? null : renderActionButtons(user, props.actions, i18n)}
      </td>
    </tr>
  );
};

UserRow.defaultProps = {
  currentUser: false,
};

export default UserRow;
