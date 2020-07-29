import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {UserAccountData} from "../../model/User";
import {AsyncFailureAction, MessageAction} from "../../action/ActionType";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {createNewUser} from "../../action/AsyncUserActions";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import RegistrationForm from "../register/RegistrationForm";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import {Card, CardBody} from "reactstrap";
import {injectIntl} from "react-intl";
import HeaderWithActions from "../misc/HeaderWithActions";

interface CreateNewUserProps extends HasI18n {
    register: (userData: UserAccountData) => Promise<AsyncFailureAction | MessageAction>;
}

export const CreateNewUser: React.FC<CreateNewUserProps> = props => {
    const onRegister = (userData: UserAccountData) => {
        return props.register(userData).then(result => {
            if ((result as AsyncFailureAction).status !== AsyncActionStatus.FAILURE) {
                Routing.transitionTo(Routes.administration);
            }
            return Promise.resolve(result);
        });
    };
    const onCancel = () => Routing.transitionTo(Routes.administration);

    return <>
        <HeaderWithActions title={props.i18n("administration.users.create")}/>
        <Card id="administration-new-user-registration">
            <CardBody>
                <RegistrationForm loading={false} register={onRegister} cancel={onCancel}/>
            </CardBody>
        </Card></>;
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        register: (userData: UserAccountData) => dispatch(createNewUser(userData))
    }
})(injectIntl(withI18n(CreateNewUser)));
