import * as React from "react";
import { useEffect } from "react";
import { Button, Card, CardBody, CardHeader, Form } from "reactstrap";
import { FormattedMessage } from "react-intl";
import Routes from "../../util/Routes";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import SecurityUtils from "../../util/SecurityUtils";
import PublicLayout from "../layout/PublicLayout";
import { requestPasswordReset } from "../../action/AsyncUserActions";
import Constants from "../../util/Constants";
import { Link } from "react-router-dom";
import WindowTitle from "../misc/WindowTitle";
import IfInternalAuth from "../misc/oidc/IfInternalAuth";
import EnhancedInput, { LabelDirection } from "../misc/EnhancedInput";
import ValidationResult, { Severity } from "../../model/form/ValidationResult";
import Utils from "../../util/Utils";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import { useI18n } from "../hook/useI18n";
import Messages from "../message/Messages";
import MessageType from "../../model/MessageType";

export const ForgotPassword: React.FC<{}> = () => {
  useEffect(() => {
    SecurityUtils.clearToken();
  }, []);

  const dispatch: ThunkDispatch = useDispatch();
  const { i18n } = useI18n();

  const [username, setUsername] = React.useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.currentTarget.value);
  };

  const validateUsername = () => {
    if (username.trim().length === 0) {
      return ValidationResult.BLOCKER;
    }
    if (!Utils.isValidEmail(username)) {
      return new ValidationResult(
        Severity.BLOCKER,
        i18n("forgotPassword.username.notValidEmail")
      );
    }
    return ValidationResult.VALID;
  };
  const isUsernameValid = () => validateUsername() === ValidationResult.VALID;

  // Listen to keys and check if enter was pressed, validate the form and send request
  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isUsernameValid()) {
      sendRequest();
    }
  };

  const sendRequest = () => {
    trackPromise(
      dispatch(requestPasswordReset(username)),
      "requestPasswordReset"
    ).then((message) => {
      if (message.message.type === MessageType.SUCCESS) {
        setUsername("");
      }
    });
  };

  return (
    <PublicLayout title={i18n("forgotPassword.title")}>
      <WindowTitle title={i18n("forgotPassword.title")} />
      <IfInternalAuth>
        <Card className="modal-panel">
          <CardHeader className="border-bottom-0 pb-0 text-center">
            <h1>{Constants.APP_NAME}</h1>
            <div>{i18n("forgotPassword.title")}</div>
          </CardHeader>
          <CardBody>
            <PromiseTrackingMask area="requestPasswordReset" />
            <Form>
              <Messages renderInPlace={true} />
              <EnhancedInput
                name="username"
                label={i18n("forgotPassword.username")}
                autoComplete="username"
                labelDirection={LabelDirection.vertical}
                value={username}
                onKeyPress={onKeyPress}
                onChange={onChange}
                autoFocus={true}
                placeholder={i18n("forgotPassword.username.placeholder")}
                validation={validateUsername()}
              />
              <Button
                id="forgotPassword-submit"
                color="success"
                onClick={sendRequest}
                className="btn-block"
                disabled={!isUsernameValid()}
              >
                {i18n("forgotPassword.submit")}
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

export default ForgotPassword;
