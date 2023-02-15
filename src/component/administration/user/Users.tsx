import * as React from "react";
import { injectIntl } from "react-intl";
import User, { EMPTY_USER } from "../../../model/User";
import withI18n, { HasI18n } from "../../hoc/withI18n";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import {
  changeRole,
  disableUser,
  enableUser,
  loadUsers,
  unlockUser,
} from "../../../action/AsyncUserActions";
import { Card, CardBody } from "reactstrap";
import "./Users.scss";
import TermItState from "../../../model/TermItState";
import PasswordReset from "./PasswordReset";
import { Link } from "react-router-dom";
import Routes from "../../../util/Routes";
import HeaderWithActions from "../../misc/HeaderWithActions";
import { GoPlus } from "react-icons/go";
import { UserRoleData } from "src/model/UserRole";
import UserRolesEdit from "./UserRolesEdit";
import UsersTable from "./UsersTable";

interface UsersProps extends HasI18n {
  currentUser: User;
  loadUsers: () => Promise<User[]>;
  disableUser: (user: User) => Promise<any>;
  enableUser: (user: User) => Promise<any>;
  unlockUser: (user: User, newPassword: string) => Promise<any>;
  changeRole: (user: User, role: UserRoleData) => Promise<any>;
}

interface UsersState {
  users: User[];
  displayUnlock: boolean;
  userToUnlock: User;
  displayRoleEdit: boolean;
  userToEdit: User;
}

export class Users extends React.Component<UsersProps, UsersState> {
  constructor(props: UsersProps) {
    super(props);
    this.state = {
      users: [],
      displayUnlock: false,
      userToUnlock: EMPTY_USER,
      displayRoleEdit: false,
      userToEdit: EMPTY_USER,
    };
  }

  public componentDidMount(): void {
    this.loadUsers();
  }

  private loadUsers() {
    this.props.loadUsers().then((data) => this.setState({ users: data }));
  }

  public disableUser = (user: User) => {
    this.props.disableUser(user).then(() => this.loadUsers());
  };

  public enableUser = (user: User) => {
    this.props.enableUser(user).then(() => this.loadUsers());
  };

  public onUnlockUser = (user: User) => {
    this.setState({ displayUnlock: true, userToUnlock: user });
  };

  public onCloseUnlock = () => {
    this.setState({ displayUnlock: false, userToUnlock: EMPTY_USER });
  };

  public unlockUser = (newPassword: string) => {
    this.props.unlockUser(this.state.userToUnlock, newPassword).then(() => {
      this.onCloseUnlock();
      this.loadUsers();
    });
  };

  public onChangeRole = (user: User) => {
    this.setState({ displayRoleEdit: true, userToEdit: user });
  };

  public onCloseRolesEdit = () => {
    this.setState({ displayRoleEdit: false, userToEdit: EMPTY_USER });
  };

  public changeRole = (role: UserRoleData) => {
    this.props.changeRole(this.state.userToEdit, role).then(() => {
      this.onCloseRolesEdit();
      this.loadUsers();
    });
  };

  public render() {
    const i18n = this.props.i18n;
    return (
      <>
        <HeaderWithActions
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
        />
        <Card id="users">
          <CardBody>
            <PasswordReset
              open={this.state.displayUnlock}
              user={this.state.userToUnlock}
              onSubmit={this.unlockUser}
              onCancel={this.onCloseUnlock}
            />
            <UserRolesEdit
              open={this.state.displayRoleEdit}
              user={this.state.userToEdit}
              onSubmit={this.changeRole}
              onCancel={this.onCloseRolesEdit}
            />
            <UsersTable
              users={this.state.users}
              currentUser={this.props.currentUser}
              disable={this.disableUser}
              enable={this.enableUser}
              unlock={this.onUnlockUser}
              changeRole={this.onChangeRole}
            />
          </CardBody>
        </Card>
      </>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return { currentUser: state.user };
  },
  (dispatch: ThunkDispatch) => {
    return {
      loadUsers: () => dispatch(loadUsers()),
      disableUser: (user: User) => dispatch(disableUser(user)),
      changeRole: (user: User, role: UserRoleData) =>
        dispatch(changeRole(user, role)),
      enableUser: (user: User) => dispatch(enableUser(user)),
      unlockUser: (user: User, newPassword: string) =>
        dispatch(unlockUser(user, newPassword)),
    };
  }
)(injectIntl(withI18n(Users)));
