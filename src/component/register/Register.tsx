import * as React from "react";
import {FormattedMessage, injectIntl} from "react-intl";
import {Card, CardBody, CardHeader} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routes from "../../util/Routes";
import Routing from "../../util/Routing";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {AsyncFailureAction, MessageAction} from "../../action/ActionType";
import {ThunkDispatch} from "../../util/Types";
import Authentication from "../../util/Authentication";
import PublicLayout from "../layout/PublicLayout";
import {UserAccountData} from "../../model/User";
import {register} from "../../action/AsyncUserActions";
import RegistrationForm from "./RegistrationForm";
import Constants from "../../util/Constants";
import {Link} from "react-router-dom";

interface RegisterProps extends HasI18n {
    loading: boolean;
    register: (user: UserAccountData) => Promise<AsyncFailureAction | MessageAction>;
}

export const Register: React.FC<RegisterProps> = props => {
    React.useEffect(() => {
        Authentication.clearToken();
    }, []);

    const onRegister = (userData: UserAccountData) => props.register(userData);
    const onCancel = () => Routing.transitionTo(Routes.login);
    return <PublicLayout title={props.i18n("login.title")}>
        <Card className="modal-panel">
            <CardHeader className="text-center pb-0 border-bottom-0">
                <h1>{Constants.APP_NAME}</h1>
                <div>{props.i18n("register.subtitle")}</div>
            </CardHeader>
            <CardBody>
                <RegistrationForm register={onRegister} cancel={onCancel} loading={props.loading}/>
                <div className="text-center">
                    <FormattedMessage id="register.login.label" values={{
                        a: (chunks: any) => <Link id="register-login" to={Routes.login.link()}
                                                  className="bold">{chunks}</Link>
                    }}
                    />
                </div>
            </CardBody>
        </Card>
    </PublicLayout>;
};

export default connect((state: TermItState) => {
    return {
        loading: state.loading
    };
}, (dispatch: ThunkDispatch) => {
    return {
        register: (user: UserAccountData) => dispatch(register(user))
    };
})(injectIntl(withI18n(Register)));
