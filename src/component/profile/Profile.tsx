import * as React from "react";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import TermItState from "../../model/TermItState";
import {ThunkDispatch} from "../../util/Types";
import User, {UserData} from "../../model/User";
import {AsyncAction} from "../../action/ActionType";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import ProfileView from "./ProfileView";
import ProfileActionButtons from "./ProfileActionButtons";
import ProfileEditForm from "./ProfileEditForm";
import {updateProfile} from "../../action/AsyncUserActions";
import HeaderWithActions from "../misc/HeaderWithActions";
import {Card, CardBody} from "reactstrap";
import WindowTitle from "../misc/WindowTitle";

interface ProfileProps extends HasI18n {
    user: User;
    updateProfile: (user: User) => Promise<AsyncAction>;
}

interface ProfileState {
    firstName: string;
    lastName: string;
    edit: boolean;
}

export class Profile extends React.Component<ProfileProps, ProfileState> {
    constructor(props: ProfileProps) {
        super(props);
        this.state = {
            firstName: props.user.firstName,
            lastName: props.user.lastName,
            edit: false
        };
    }

    private onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const newState = Object.assign({}, this.state);
        newState[e.currentTarget.name!] = e.currentTarget.value;
        this.setState(newState);
    };

    private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            this.onSubmit();
        }
    };

    private onSubmit = (): void => {
        if (!this.isValid()) {
            return;
        }

        const userData: UserData = {
            ...this.props.user,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
        };

        this.props.updateProfile(new User(userData)).then((asyncResult: AsyncAction) => {
            if (asyncResult.status === AsyncActionStatus.SUCCESS) {
                this.showProfileView();
            }
        });
    };

    private isValid(): boolean {
        const {user} = this.props;
        return (this.state.firstName !== user.firstName || this.state.lastName !== user.lastName) &&
            this.state.firstName.trim().length > 0 && this.state.lastName.trim().length > 0;
    }

    private showProfileEdit = () => this.setState({edit: true});

    private showProfileView = () => this.setState({edit: false});

    private navigateToChangePasswordRoute = () => Routing.transitionTo(Routes.changePassword);

    public render() {
        const {i18n, user} = this.props;

        return <>
            <WindowTitle title={i18n("main.user-profile")}/>
            <HeaderWithActions title={`${i18n("main.user-profile")}: ${user.username}`}
                               actions={this.renderActionButtons()}/>
            <Card id="panel-profile">
                <CardBody>
                    {!this.state.edit ?
                        <ProfileView user={user}/> :
                        <ProfileEditForm
                            firstName={this.state.firstName}
                            lastName={this.state.lastName}
                            onChange={this.onChange}
                            onSubmit={this.onSubmit}
                            onKeyPress={this.onKeyPress}
                            showProfileView={this.showProfileView}
                            isValid={this.isValid()}
                        />}
                </CardBody>
            </Card>
        </>;
    }

    private renderActionButtons() {
        return <ProfileActionButtons edit={this.state.edit} showProfileEdit={this.showProfileEdit}
                                     navigateToChangePasswordRoute={this.navigateToChangePasswordRoute}/>;
    }
}

export default connect((state: TermItState) => {
    return {
        user: state.user,
    };
}, (dispatch: ThunkDispatch) => {
    return {
        updateProfile: (name: User) => dispatch(updateProfile(name))
    };
})(injectIntl(withI18n(Profile)));
