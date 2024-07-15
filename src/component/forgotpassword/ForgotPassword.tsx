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
import { Link } from "react-router-dom";
import WindowTitle from "../misc/WindowTitle";
import IfInternalAuth from "../misc/oidc/IfInternalAuth";
import Mask from "../misc/Mask";
import EnhancedInput, { LabelDirection } from "../misc/EnhancedInput";
import ValidationResult, { Severity } from "../../model/form/ValidationResult";
import Utils from "../../util/Utils";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import Message from "../../model/Message";
import MessageType from "../../model/MessageType";

interface ForgotPasswordProps extends HasI18n {
  loading: boolean;
  resetPassword: (
    username: string
  ) => Promise<AsyncFailureAction | AsyncAction>;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = (props) => {
  React.useEffect(() => {
    SecurityUtils.clearToken();
  }, []);
  const { i18n, resetPassword } = props;
  const [username, setUsername] = React.useState("");
  const [message, setMessage] = React.useState(null as Message | null);

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

  const renderMask = () =>
    props.loading ? (
      <Mask text={props.i18n("register.mask")} classes="mask-container" />
    ) : null;

  const renderAlert = () => {
    if (!message) {
      return null;
    }

    const text = message.messageId ? i18n(message.messageId) : message.message;
    return <Alert color={message.type}>{text}</Alert>;
  };

  const sendRequest = () => {
    resetPassword(username).then((result) => {
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
              messageId: "forgotPassword.success",
            },
            MessageType.SUCCESS
          )
        );
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
            <div>{i18n("forgotPassword.subtitle")}</div>
          </CardHeader>
          <CardBody>
            {renderMask()}
            <Form>
              {renderAlert()}
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
                id="login-submit"
                color="success"
                onClick={sendRequest}
                className="btn-block"
                disabled={props.loading || !isUsernameValid()}
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

export default connect(
  (state: TermItState) => {
    return {
      loading: state.loading,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      resetPassword: (username: string) => dispatch(resetPassword(username)),
    };
  }
)(injectIntl(withI18n(ForgotPassword)));
