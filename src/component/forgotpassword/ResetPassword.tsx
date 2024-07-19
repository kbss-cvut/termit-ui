import * as React from "react";
import { Button, Card, CardBody, CardHeader, Form } from "reactstrap";
import { FormattedMessage } from "react-intl";
import Routes from "../../util/Routes";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import SecurityUtils from "../../util/SecurityUtils";
import PublicLayout from "../layout/PublicLayout";
import { resetPassword } from "../../action/AsyncUserActions";
import Constants from "../../util/Constants";
import { Link, useParams } from "react-router-dom";
import WindowTitle from "../misc/WindowTitle";
import IfInternalAuth from "../misc/oidc/IfInternalAuth";
import EnhancedInput, { LabelDirection } from "../misc/EnhancedInput";
import ValidationResult, { Severity } from "../../model/form/ValidationResult";
import MessageType from "../../model/MessageType";
import { useI18n } from "../hook/useI18n";
import { trackPromise } from "react-promise-tracker";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import Messages from "../message/Messages";
import ChangePasswordDto from "../../model/ChangePasswordDto";

interface ResetPasswordGetParams {
  token: string;
  token_uri: string;
}

export const ResetPassword: React.FC<{}> = () => {
  React.useEffect(() => {
    SecurityUtils.clearToken();
  }, []);

  const dispatch: ThunkDispatch = useDispatch();
  const { i18n } = useI18n();

  const { token, token_uri } = useParams<ResetPasswordGetParams>();
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setpasswordConfirm] = React.useState("");
  // will block UI once the request was successfully sent
  const [passwordChanged, setPasswordChanged] = React.useState(false);

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.currentTarget.value);
  };
  const onPasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setpasswordConfirm(e.currentTarget.value);
  };

  const arePasswordsEqualAndNotEmpty = () =>
    password === passwordConfirm && password != "";
  const validatePasswords = () => {
    if (arePasswordsEqualAndNotEmpty()) {
      return ValidationResult.VALID;
    }

    if (password == "") {
      return new ValidationResult(Severity.BLOCKER);
    }

    return new ValidationResult(
      Severity.BLOCKER,
      i18n("resetPassword.passwordsNotEqual")
    );
  };

  // Listen to keys and check if enter was pressed, validate the form and send request
  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && arePasswordsEqualAndNotEmpty()) {
      sendRequest();
    }
  };

  const sendRequest = () => {
    trackPromise(
      dispatch(
        resetPassword(
          new ChangePasswordDto(decodeURIComponent(token_uri), token, password)
        )
      ),
      "resetPassword"
    ).then((message) => {
      if (message.message.type === MessageType.SUCCESS) {
        setPasswordChanged(true);
        setPassword("");
        setpasswordConfirm("");
      }
    });
  };

  return (
    <PublicLayout title={i18n("resetPassword.title")}>
      <WindowTitle title={i18n("resetPassword.title")} />
      <IfInternalAuth>
        <Card className="modal-panel">
          <CardHeader className="border-bottom-0 pb-0 text-center">
            <h1>{Constants.APP_NAME}</h1>
            <div>{i18n("resetPassword.subtitle")}</div>
          </CardHeader>
          <CardBody>
            <PromiseTrackingMask area="resetPassword" />
            <Form>
              <Messages renderInPlace={true} />
              <EnhancedInput
                type="password"
                name="newPassword"
                label={i18n("resetPassword.password")}
                autoComplete="new-password"
                labelDirection={LabelDirection.vertical}
                value={password}
                onKeyPress={onKeyPress}
                onChange={onPasswordChange}
                autoFocus={true}
                placeholder={i18n("resetPassword.password.placeholder")}
                disabled={passwordChanged}
              />
              <EnhancedInput
                type="password"
                name="newPassword-confirm"
                label={i18n("resetPassword.password.confirm")}
                autoComplete="new-password"
                labelDirection={LabelDirection.vertical}
                value={passwordConfirm}
                onKeyPress={onKeyPress}
                onChange={onPasswordConfirmChange}
                validation={validatePasswords()}
                disabled={passwordChanged}
              />
              <Button
                id="resetPassword-submit"
                color="success"
                onClick={sendRequest}
                className="btn-block"
                disabled={!arePasswordsEqualAndNotEmpty() || passwordChanged}
              >
                {i18n("resetPassword.submit")}
              </Button>
            </Form>
            <div className="mt-2 text-center">
              <FormattedMessage
                id="forgotPassword.login.label"
                values={{
                  a: (chunks: any) => (
                    <Link
                      id="forgotPassword-login"
                      to={Routes.login.link()}
                      className="bold"
                    >
                      {chunks}
                    </Link>
                  ),
                }}
              />
            </div>
          </CardBody>
        </Card>
      </IfInternalAuth>
    </PublicLayout>
  );
};

export default ResetPassword;
