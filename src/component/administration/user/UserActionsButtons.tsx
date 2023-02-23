import React from "react";
import User from "../../../model/User";
import { useI18n } from "../../hook/useI18n";
import Utils from "../../../util/Utils";
import { Button } from "reactstrap";
import { STATUS_MAP } from "./UserStatusInfo";

export interface UserActions {
  disable: (user: User) => void;
  enable: (user: User) => void;
  unlock: (user: User) => void;
  changeRole: (user: User) => void;
}

const UserActionsButtons: React.FC<
  UserActions & { user: User; currentUser: User }
> = ({ user, currentUser, ...actions }) => {
  const { i18n } = useI18n();
  if (user.iri === currentUser.iri) {
    return null;
  }
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
  return <>{buttons}</>;
};

export default UserActionsButtons;
