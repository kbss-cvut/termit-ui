import * as React from "react";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { FormattedMessage, injectIntl } from "react-intl";
import { Button, Card, CardBody, CardHeader, Form } from "reactstrap";
import Routes from "../../util/Routes";
import Mask from "../misc/Mask";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import { ThunkDispatch } from "../../util/Types";
import PublicLayout from "../layout/PublicLayout";
import { MessageAction } from "../../action/ActionType";
import { login } from "../../action/AsyncUserActions";
import EnhancedInput, { LabelDirection } from "../misc/EnhancedInput";
import Constants, { getEnv } from "../../util/Constants";
import "./Login.scss";
import { Link } from "react-router-dom";
import WindowTitle from "../misc/WindowTitle";
import ConfigParam from "../../util/ConfigParam";
import Messages from "../message/Messages";

interface LoginProps extends HasI18n {
  loading: boolean;
  login: (username: string, password: string) => Promise<MessageAction>;
}

interface LoginState {
  username: string;
  password: string;
}

export class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
  }

  private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newState = Object.assign({}, this.state);
    newState[e.currentTarget.name!] = e.currentTarget.value;
    this.setState(newState);
  };

  private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && this.isValid()) {
      this.login();
    }
  };

  private login = () =>
    this.props.login(this.state.username, this.state.password);

  private isValid() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  public render() {
    const i18n = this.props.i18n;
    return (
      <PublicLayout title={i18n("login.title")}>
        <WindowTitle title={i18n("login.title")} />
        <Card className="modal-panel">
          <CardHeader className="border-bottom-0 pb-0 text-center">
            <h1>{Constants.APP_NAME}</h1>
            <div>{i18n("login.subtitle")}</div>
          </CardHeader>
          <CardBody>
            {this.renderMask()}
            <Form>
              <Messages renderInPlace={true} />
              <EnhancedInput
                name="username"
                label={i18n("login.username")}
                autoComplete="username"
                labelDirection={LabelDirection.vertical}
                value={this.state.username}
                onKeyPress={this.onKeyPress}
                onChange={this.onChange}
                autoFocus={true}
                placeholder={i18n("login.username.placeholder")}
              />
              <EnhancedInput
                type="password"
                name="password"
                autoComplete="current-password"
                labelDirection={LabelDirection.vertical}
                label={i18n("login.password")}
                value={this.state.password}
                onKeyPress={this.onKeyPress}
                onChange={this.onChange}
                placeholder={i18n("login.password.placeholder")}
                hint={this.renderForgotPasswordLink()}
              />

              <Button
                id="login-submit"
                color="success"
                onClick={this.login}
                className="btn-block"
                disabled={this.props.loading || !this.isValid()}
              >
                {i18n("login.submit")}
              </Button>
              {this.renderRegistrationLink()}
              {this.renderPublicViewLink()}
            </Form>
          </CardBody>
        </Card>
      </PublicLayout>
    );
  }

  private renderMask() {
    return this.props.loading ? (
      <Mask
        text={this.props.i18n("login.progress-mask")}
        classes="mask-container"
      />
    ) : null;
  }

  private renderForgotPasswordLink() {
    return (
      <FormattedMessage
        id="login.forgotPassword.label"
        values={{
          a: (chunks: any) => (
            <Link
              id="login-reset-password"
              to={Routes.forgotPassword.link()}
              className="bold"
            >
              {chunks}
            </Link>
          ),
        }}
      />
    );
  }

  private renderRegistrationLink() {
    if (getEnv(ConfigParam.ADMIN_REGISTRATION_ONLY, "") === true.toString()) {
      return null;
    }
    return (
      <div className="mt-2 text-center">
        <FormattedMessage
          id="login.register.label"
          values={{
            a: (chunks: any) => (
              <Link
                id="login-register"
                to={Routes.register.link()}
                className="bold"
              >
                {chunks}
              </Link>
            ),
          }}
        />
      </div>
    );
  }

  private renderPublicViewLink() {
    if (getEnv(ConfigParam.DISABLE_PUBLIC_VIEW, "") === "true") {
      return null;
    }
    return (
      <div className="mt-2 text-center">
        <FormattedMessage
          id="login.public-view-link"
          values={{
            a: (chunks: any) => (
              <Link
                id="login-public-view"
                to={Routes.publicVocabularies.link()}
                className="bold"
              >
                {chunks}
              </Link>
            ),
          }}
        />
      </div>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      loading: state.loading,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      login: (username: string, password: string) =>
        dispatch(login(username, password)),
    };
  }
)(injectIntl(withI18n(Login)));
