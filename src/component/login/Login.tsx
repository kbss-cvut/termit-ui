import * as React from "react";
import { FormattedMessage } from "react-intl";
import { Button, Card, CardBody, CardHeader, Form } from "reactstrap";
import Routes from "../../util/Routes";
import Mask from "../misc/Mask";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { ThunkDispatch } from "../../util/Types";
import PublicLayout from "../layout/PublicLayout";
import { login } from "../../action/AsyncUserActions";
import EnhancedInput, { LabelDirection } from "../misc/EnhancedInput";
import Constants, { getEnv } from "../../util/Constants";
import "./Login.scss";
import { Link } from "react-router-dom";
import WindowTitle from "../misc/WindowTitle";
import ConfigParam from "../../util/ConfigParam";
import Messages from "../message/Messages";
import { useI18n } from "../hook/useI18n";

function renderForgotPasswordLink() {
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

function renderRegistrationLink() {
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
              data-testid="login-register"
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

function renderPublicViewLink() {
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
              data-testid="login-public-view"
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

export const Login: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const loading = useSelector((s: TermItState) => s.loading);
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const isValid = () => username.length > 0 && password.length > 0;

  const doLogin = () => dispatch(login(username, password));

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid()) {
      doLogin();
    }
  };

  return (
    <PublicLayout title={i18n("login.title")}>
      <WindowTitle title={i18n("login.title")} />
      <Card className="modal-panel">
        <CardHeader className="border-bottom-0 pb-0 text-center">
          <h1>{Constants.APP_NAME}</h1>
          <div>{i18n("login.subtitle")}</div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Mask text={i18n("login.progress-mask")} classes="mask-container" />
          ) : null}
          <Form>
            <Messages renderInPlace={true} />
            <EnhancedInput
              name="username"
              data-testid="login-username"
              label={i18n("login.username")}
              autoComplete="username"
              labelDirection={LabelDirection.vertical}
              value={username}
              onKeyPress={onKeyPress}
              onChange={(e) => setUsername(e.currentTarget.value)}
              placeholder={i18n("login.username.placeholder")}
            />
            <EnhancedInput
              type="password"
              name="password"
              data-testid="login-password"
              autoComplete="current-password"
              labelDirection={LabelDirection.vertical}
              label={i18n("login.password")}
              value={password}
              onKeyPress={onKeyPress}
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder={i18n("login.password.placeholder")}
              hint={renderForgotPasswordLink()}
            />

            <Button
              id="login-submit"
              data-testid="login-submit"
              color="success"
              onClick={doLogin}
              className="btn-block"
              disabled={loading || !isValid()}
            >
              {i18n("login.submit")}
            </Button>
            {renderRegistrationLink()}
            {renderPublicViewLink()}
          </Form>
        </CardBody>
      </Card>
    </PublicLayout>
  );
};

export default Login;
