import * as React from "react";
import { UserAccountData } from "../../model/User";
import { AsyncFailureAction, MessageAction } from "../../action/ActionType";
import ErrorInfo from "../../model/ErrorInfo";
import Ajax, { params } from "../../util/Ajax";
import Constants from "../../util/Constants";
import { Alert, Button, Col, Form, Row } from "reactstrap";
import Mask from "../misc/Mask";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import ValidationResult, { Severity } from "../../model/form/ValidationResult";
import Utils from "../../util/Utils";
import SecurityUtils from "../../util/SecurityUtils";
import EnhancedInput, { LabelDirection } from "../misc/EnhancedInput";
import { useI18n } from "../hook/useI18n";
import VocabularyUtils from "../../util/VocabularyUtils";

interface RegistrationFormProps {
  loading: boolean;
  register: (
    user: UserAccountData
  ) => Promise<AsyncFailureAction | MessageAction>;
  cancel: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  loading,
  register,
}) => {
  const { i18n, formatMessage } = useI18n();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [usernameExists, setUsernameExists] = React.useState(false);
  const [error, setError] = React.useState<ErrorInfo | null>(null);

  const onFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setFirstName(e.currentTarget.value);
  };

  const onLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setLastName(e.currentTarget.value);
  };

  const onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const value = e.currentTarget.value;
    setUsername(value);
    Ajax.get(
      Constants.API_PREFIX + "/users/username",
      params({ username: value })
    ).then((data) => {
      setUsernameExists(data === true);
    });
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPassword(e.currentTarget.value);
  };

  const onPasswordConfirmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPasswordConfirm(e.currentTarget.value);
  };

  const validateUsername = (): ValidationResult => {
    if (username.trim().length === 0) {
      return ValidationResult.VALID;
    }
    if (!Utils.isValidEmail(username)) {
      return new ValidationResult(
        Severity.BLOCKER,
        i18n("register.username.notValidEmail")
      );
    }
    if (usernameExists) {
      return new ValidationResult(
        Severity.BLOCKER,
        i18n("register.username-exists.tooltip")
      );
    }
    return ValidationResult.VALID;
  };

  const passwordsMatch = () => password === passwordConfirm;

  const isValid = (): boolean =>
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    validateUsername().severity === Severity.VALID &&
    SecurityUtils.isPasswordValid(password) &&
    passwordsMatch();

  const onRegister = () => {
    const userData = {
      firstName,
      lastName,
      username,
      password,
      types: [VocabularyUtils.USER_RESTRICTED],
    };
    register(userData).then((result) => {
      const asyncResult = result as AsyncFailureAction;
      if (asyncResult.status === AsyncActionStatus.FAILURE) {
        setError(asyncResult.error);
      }
    });
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid()) {
      onRegister();
    }
  };

  const passwordConfirmValidation = passwordsMatch()
    ? ValidationResult.VALID
    : new ValidationResult(
        Severity.BLOCKER,
        i18n("register.passwords-not-matching.tooltip")
      );

  return (
    <>
      {loading ? (
        <Mask text={i18n("register.mask")} classes="mask-container" />
      ) : null}
      <Form>
        {error ? (
          <Alert color="danger" data-testid="register-error">
            {error.messageId ? i18n(error.messageId) : error.message}
          </Alert>
        ) : null}
        <Row>
          <Col md={6}>
            <EnhancedInput
              type="text"
              name="firstName"
              data-testid="register-first-name"
              autoComplete="given-name"
              label={i18n("register.first-name")}
              labelDirection={LabelDirection.vertical}
              value={firstName}
              onChange={onFirstNameChange}
              required={true}
            />
          </Col>
          <Col md={6}>
            <EnhancedInput
              type="text"
              name="lastName"
              data-testid="register-last-name"
              autoComplete="family-name"
              label={i18n("register.last-name")}
              labelDirection={LabelDirection.vertical}
              value={lastName}
              onChange={onLastNameChange}
              required={true}
            />
          </Col>
        </Row>
        <EnhancedInput
          type="text"
          name="username"
          data-testid="register-username"
          autoComplete="username"
          label={i18n("register.username")}
          value={username}
          labelDirection={LabelDirection.vertical}
          onChange={onUsernameChange}
          required={true}
          hint={i18n("register.username.help")}
          validation={validateUsername()}
        />
        <EnhancedInput
          type="password"
          name="password"
          data-testid="register-password"
          autoComplete="new-password"
          label={i18n("register.password")}
          labelDirection={LabelDirection.vertical}
          onChange={onPasswordChange}
          value={password}
          required={true}
          hint={formatMessage("createPassword.requirements", {
            minLength: SecurityUtils.PASSWORD_MIN_LENGTH,
          })}
        />

        <EnhancedInput
          type="password"
          name="passwordConfirm"
          data-testid="register-password-confirm"
          autoComplete="new-password"
          label={i18n("register.password-confirm")}
          onChange={onPasswordConfirmChange}
          onKeyPress={onKeyPress}
          value={passwordConfirm}
          labelDirection={LabelDirection.vertical}
          required={true}
          validation={passwordConfirmValidation}
        />
        <Button
          id="register-submit"
          data-testid="register-submit"
          className="btn-block"
          color="success"
          disabled={!isValid() || loading}
          onClick={onRegister}
        >
          {i18n("register.submit")}
        </Button>
        <br />
      </Form>
    </>
  );
};

export default RegistrationForm;
