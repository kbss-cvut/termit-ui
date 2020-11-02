import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import {Alert, Button, Card, CardBody, CardHeader, Form} from "reactstrap";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import Mask from "../misc/Mask";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import ErrorInfo from "../../model/ErrorInfo";
import {ThunkDispatch} from "../../util/Types";
import PublicLayout from "../layout/PublicLayout";
import {AsyncFailureAction, MessageAction} from "../../action/ActionType";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import {login} from "../../action/AsyncUserActions";
import EnhancedInput, {LabelDirection} from "../misc/EnhancedInput";
import Constants from "../../util/Constants";
import "./Login.scss";

interface LoginProps extends HasI18n {
    loading: boolean;
    login: (username: string, password: string) => Promise<MessageAction | AsyncFailureAction>;
}

interface LoginState {
    username: string;
    password: string;
    error: ErrorInfo | null;
}

export class Login extends React.Component<LoginProps, LoginState> {

    constructor(props: LoginProps) {
        super(props);
        this.state = {
            username: "",
            password: "",
            error: null
        };
    }

    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newState = Object.assign({}, this.state, {error: null});
        newState[e.currentTarget.name!] = e.currentTarget.value;
        this.setState(newState);
    };

    private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && this.isValid()) {
            this.login();
        }
    };

    private login = () => {
        this.props.login(this.state.username, this.state.password).then(result => {
            const asyncResult = result as AsyncFailureAction;
            if (asyncResult.status === AsyncActionStatus.FAILURE) {
                this.setState({error: asyncResult.error});
            }
        });
    };

    private register = () => {
        Routing.transitionTo(Routes.register);
    };

    private isValid() {
        return this.state.username.length > 0 && this.state.password.length > 0;
    }

    public render() {
        const i18n = this.props.i18n;
        return <PublicLayout title={i18n("login.title")}>
            <Card className="modal-panel">
                <CardHeader className="text-center pb-0 border-bottom-0">
                    <h1>{Constants.APP_NAME}</h1>
                    <div>{i18n("login.subtitle")}</div>
                </CardHeader>
                <CardBody>
                    {this.renderMask()}
                    <Form>
                        {this.renderAlert()}
                        <EnhancedInput name="username" label={i18n("login.username")} autoComplete="username"
                                       labelDirection={LabelDirection.vertical}
                                       value={this.state.username} onKeyPress={this.onKeyPress} onChange={this.onChange}
                                       autoFocus={true} placeholder={i18n("login.username.placeholder")}/>
                        <EnhancedInput type="password" name="password" autoComplete="current-password"
                                       labelDirection={LabelDirection.vertical}
                                       label={i18n("login.password")} value={this.state.password}
                                       onKeyPress={this.onKeyPress} onChange={this.onChange}
                                       placeholder={i18n("login.password.placeholder")}/>

                        <Button id="login-submit" color={Constants.SUBMIT_BUTTON_VARIANT} onClick={this.login}
                                className="btn-block"
                                disabled={this.props.loading || !this.isValid()}>{i18n("login.submit")}</Button>
                        {this.renderRegistrationLink()}
                    </Form>
                </CardBody>
            </Card>
        </PublicLayout>;
    }

    private renderMask() {
        return this.props.loading ?
            <Mask text={this.props.i18n("login.progress-mask")} classes="mask-container"/> : null;
    }

    private renderAlert() {
        if (!this.state.error) {
            return null;
        }
        const error = this.state.error;
        const messageId = error.messageId ? error.messageId : "login.error";
        return <Alert color="danger">{this.props.i18n(messageId)}</Alert>;
    }

    private renderRegistrationLink() {
        const i18n = this.props.i18n;

        if (process.env.REACT_APP_ADMIN_REGISTRATION_ONLY === true.toString()) {
            return null;
        }
        return <div className="text-center mt-2">
            {i18n("login.register.label")}
            <Button id="login-register" color="link" onClick={this.register}
                    className="p-1 align-baseline"
                    disabled={this.props.loading}>{i18n("login.register")}</Button>
        </div>;
    }
}

export default connect((state: TermItState) => {
    return {
        loading: state.loading
    };
}, (dispatch: ThunkDispatch) => {
    return {
        login: (username: string, password: string) => dispatch(login(username, password))
    };
})(injectIntl(withI18n(Login)));
