import * as React from "react";
import { Alert, Button, Card, CardBody, CardHeader, Form } from "reactstrap";
import { FormattedMessage, injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Routes from "../../util/Routes";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import { AsyncAction, AsyncFailureAction } from "../../action/ActionType";
import { ThunkDispatch } from "../../util/Types";
import SecurityUtils from "../../util/SecurityUtils";
import PublicLayout from "../layout/PublicLayout";
import { resetPassword } from "../../action/AsyncUserActions";
import Constants from "../../util/Constants";
import { Link, useParams } from "react-router-dom";
import WindowTitle from "../misc/WindowTitle";
import IfInternalAuth from "../misc/oidc/IfInternalAuth";
import Mask from "../misc/Mask";
import EnhancedInput, { LabelDirection } from "../misc/EnhancedInput";
import ValidationResult, { Severity } from "../../model/form/ValidationResult";
import Message from "../../model/Message";
import ChangePasswordDto from "../../model/ChangePasswordDto";
import MessageType from "../../model/MessageType";
import AsyncActionStatus from "../../action/AsyncActionStatus";

interface ResetPasswordProps extends HasI18n {
  loading: boolean;
  resetPassword: (
    data: ChangePasswordDto
  ) => Promise<AsyncFailureAction | AsyncAction>;
}
interface ResetPasswordGetParams {
  token: string;
  token_uri: string;
}

export const ResetPassword: React.FC<ResetPasswordProps> = (props) => {
  React.useEffect(() => {
    SecurityUtils.clearToken();
  }, []);
  const { i18n, resetPassword } = props;
  const { token, token_uri } = useParams<ResetPasswordGetParams>();
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setpasswordConfirm] = React.useState("");
  const [message, setMessage] = React.useState(null as Message | null);
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

  const renderMask = () =>
    props.loading ? (
      <Mask text={props.i18n("resetPassword.mask")} classes="mask-container" />
    ) : null;

  const renderAlert = () => {
    if (!message) {
      return null;
    }

    const text = message.messageId ? i18n(message.messageId) : message.message;
    return <Alert color={message.type}>{text}</Alert>;
  };

  const sendRequest = () => {
    resetPassword({ token, uri: token_uri, newPassword: password }).then(
      (result) => {
        const asyncResult = result as AsyncFailureAction;
        if (asyncResult.status === AsyncActionStatus.FAILURE) {
          const error = asyncResult.error;
          setMessage(
            new Message(
              {
                messageId: error.messageId,
                message: error.message,
              },
              MessageType.ERROR
            )
          );
        } else {
          setMessage(
            new Message(
              {
                messageId: "resetPassword.success",
              },
              MessageType.SUCCESS
            )
          );
          setPasswordChanged(true);
          setPassword("");
          setpasswordConfirm("");
        }
      }
    );
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
            {renderMask()}
            <Form>
              {renderAlert()}
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
                disabled={
                  props.loading ||
                  !arePasswordsEqualAndNotEmpty() ||
                  passwordChanged
                }
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

export default connect(
  (state: TermItState) => {
    return {
      loading: state.loading,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      resetPassword: (dto: ChangePasswordDto) => dispatch(resetPassword(dto)),
    };
  }
)(injectIntl(withI18n(ResetPassword)));
