import * as React from "react";
import {injectIntl} from "react-intl";
import User, {EMPTY_USER} from "../../model/User";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {changeRole, disableUser, enableUser, loadUsers, unlockUser} from "../../action/AsyncUserActions";
import {Card, CardBody, Table} from "reactstrap";
import UserRow from "./UserRow";
import "./Users.scss";
import TermItState from "../../model/TermItState";
import PasswordReset from "./PasswordReset";
import {Link} from "react-router-dom";
import Routes from "../../util/Routes";
import HeaderWithActions from "../misc/HeaderWithActions";
import {GoPlus} from "react-icons/go";
import {UserRoleData} from "src/model/UserRole";
import UserRolesEdit from "./UserRolesEdit";

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
            userToEdit: EMPTY_USER
        };
    }

    public componentDidMount(): void {
        this.loadUsers();
    }

    private loadUsers() {
        this.props.loadUsers().then(data => this.setState({users: data}));
    }

    public disableUser = (user: User) => {
        this.props.disableUser(user).then(() => this.loadUsers());
    };

    public enableUser = (user: User) => {
        this.props.enableUser(user).then(() => this.loadUsers());
    };

    public onUnlockUser = (user: User) => {
        this.setState({displayUnlock: true, userToUnlock: user});
    };

    public onCloseUnlock = () => {
        this.setState({displayUnlock: false, userToUnlock: EMPTY_USER});
    };

    public unlockUser = (newPassword: string) => {
        this.props.unlockUser(this.state.userToUnlock, newPassword).then(() => {
            this.onCloseUnlock();
            this.loadUsers();
        });
    };

    public onChangeRole = (user: User) => {
        this.setState({displayRoleEdit: true, userToEdit: user});
    };

    public onCloseRolesEdit = () => {
        this.setState({displayRoleEdit: false, userToEdit: EMPTY_USER});
    };

    public changeRole = (role: UserRoleData) => {
        this.props.changeRole(this.state.userToEdit, role).then(() => {
            this.onCloseRolesEdit();
            this.loadUsers();
        });
    };

    public render() {
        const i18n = this.props.i18n;
        const actions = {
            disable: this.disableUser,
            enable: this.enableUser,
            unlock: this.onUnlockUser,
            changeRole: this.onChangeRole
        };
        return (
            <>
                <HeaderWithActions
                    title={i18n("administration.users")}
                    actions={
                        <Link
                            id="administration-users-create"
                            to={Routes.createNewUser.path}
                            title={i18n("administration.users.create.tooltip")}
                            className="btn btn-primary btn-sm users-action-button">
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
                        <Table striped={true}>
                            <thead>
                                <tr>
                                    <th>&nbsp;</th>
                                    <th>{i18n("administration.users.name")}</th>
                                    <th>{i18n("administration.users.username")}</th>
                                    <th>{i18n("administration.users.status")}</th>
                                    <th>{i18n("administration.users.role")}</th>
                                    <th className="text-center users-row-actions">{i18n("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.users.map(u => (
                                    <UserRow
                                        key={u.iri}
                                        user={u}
                                        currentUser={u.iri === this.props.currentUser.iri}
                                        actions={actions}
                                    />
                                ))}
                            </tbody>
                        </Table>
                    </CardBody>
                </Card>
            </>
        );
    }
}

export default connect(
    (state: TermItState) => {
        return {currentUser: state.user};
    },
    (dispatch: ThunkDispatch) => {
        return {
            loadUsers: () => dispatch(loadUsers()),
            disableUser: (user: User) => dispatch(disableUser(user)),
            changeRole: (user: User, role: UserRoleData) => dispatch(changeRole(user, role)),
            enableUser: (user: User) => dispatch(enableUser(user)),
            unlockUser: (user: User, newPassword: string) => dispatch(unlockUser(user, newPassword))
        };
    }
)(injectIntl(withI18n(Users)));
