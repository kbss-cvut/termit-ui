import * as React from "react";
import User, { EMPTY_USER } from "../../../model/User";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import {
  changeRole,
  disableUser,
  enableUser,
  loadUsers,
  unlockUser,
} from "../../../action/AsyncUserActions";
import "./Users.scss";
import TermItState from "../../../model/TermItState";
import PasswordReset from "./PasswordReset";
import { Link } from "react-router-dom";
import Routes from "../../../util/Routes";
import { GoPlus } from "react-icons/go";
import { UserRoleData } from "src/model/UserRole";
import UserRolesEdit from "./UserRolesEdit";
import UsersTable from "./UsersTable";
import PanelWithActions from "../../misc/PanelWithActions";
import { useI18n } from "../../hook/useI18n";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";

const Users: React.FC = () => {
  const { i18n } = useI18n();
  const [userToUnlock, setUserToUnlock] = React.useState(EMPTY_USER);
  const [editedUser, setEditedUser] = React.useState(EMPTY_USER);
  const users = useSelector((state: TermItState) => state.users);
  const currentUser = useSelector((state: TermItState) => state.user);
  const dispatch: ThunkDispatch = useDispatch();
  const onDisableUser = (user: User) => {
    trackPromise(dispatch(disableUser(user)), "users").then(() =>
      dispatch(loadUsers())
    );
  };
  const onEnableUser = (user: User) => {
    trackPromise(dispatch(enableUser(user)), "users").then(() =>
      dispatch(loadUsers())
    );
  };
  const onUnlockUserSubmit = (newPassword: string) => {
    trackPromise(dispatch(unlockUser(userToUnlock, newPassword)), "users").then(
      () => {
        setUserToUnlock(EMPTY_USER);
        dispatch(loadUsers());
      }
    );
  };
  const onUserRoleSubmit = (role: UserRoleData) => {
    trackPromise(dispatch(changeRole(editedUser, role)), "users").then(() => {
      setEditedUser(EMPTY_USER);
      dispatch(loadUsers());
    });
  };

  return (
    <>
      <PanelWithActions
        id="users"
        title={i18n("administration.users")}
        actions={
          <Link
            id="administration-users-create"
            to={Routes.createNewUser.path}
            title={i18n("administration.users.create.tooltip")}
            className="btn btn-primary btn-sm users-action-button"
          >
            <GoPlus />
            &nbsp;{i18n("administration.users.create")}
          </Link>
        }
      >
        <PromiseTrackingMask area="users" />
        <PasswordReset
          open={userToUnlock !== EMPTY_USER}
          user={userToUnlock}
          onSubmit={onUnlockUserSubmit}
          onCancel={() => setUserToUnlock(EMPTY_USER)}
        />
        <UserRolesEdit
          open={editedUser !== EMPTY_USER}
          user={editedUser}
          onSubmit={onUserRoleSubmit}
          onCancel={() => setEditedUser(EMPTY_USER)}
        />
        <UsersTable
          users={users}
          currentUser={currentUser}
          disable={onDisableUser}
          enable={onEnableUser}
          unlock={(user) => setUserToUnlock(user)}
          changeRole={(user) => setEditedUser(user)}
        />
      </PanelWithActions>
    </>
  );
};

export default Users;
