import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { doesUsernameExists } from "../../../action/AsyncUserActions";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import * as _ from "lodash";
import ValidationResult, {
  Severity,
} from "../../../model/form/ValidationResult";
import Utils from "../../../util/Utils";
import { useI18n } from "../../hook/useI18n";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import {
  Button,
  Col,
  Collapse,
  Container,
  Form,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import EnhancedInput, { LabelDirection } from "../../misc/EnhancedInput";
import Toggle from "react-bootstrap-toggle";
import { TOGGLE_STYLE } from "../../term/IncludeImportedTermsToggle";
import { UserAccountData } from "../../../model/User";
import Constants from "../../../util/Constants";

interface CreateNewUserFormProps {
  onSubmit: (userAccountData: UserAccountData) => void;
}

const CreateNewUserForm: React.FC<CreateNewUserFormProps> = (props) => {
  const dispatch: ThunkDispatch = useDispatch();
  const { i18n } = useI18n();
  const { onSubmit } = props;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [usernameExists, setUsernameExists] = useState(false);
  const [emailPassword, setEmailPassword] = useState(true);

  // ref is required to keep the same debounced function between renders
  const fetchUsernameExists = useRef(
    _.debounce((username) => {
      dispatch(doesUsernameExists(username)).then((action) => {
        if (_.isBoolean(action)) {
          setUsernameExists(action);
        }
      });
    }, Constants.INPUT_DEBOUNCE_WAIT_TIME)
  ).current;

  const onFormSubmit = () => {
    if (!isValid()) {
      return;
    }

    onSubmit({
      firstName,
      lastName,
      username,
      password: emailPassword ? "" : password,
    });
  };

  const onChange = (
    setter: (value: any) => void,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setter(e.currentTarget.value);
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValid()) {
      onFormSubmit();
    }
  };

  const validateNonEmpty = useRef((value: string) => {
    if (value == null || value.trim().length === 0) {
      return ValidationResult.BLOCKER;
    }
    return ValidationResult.VALID;
  }).current;

  const validateUsername = useRef(
    (username: string, usernameExists?: boolean) => {
      if (validateNonEmpty(username) === ValidationResult.BLOCKER) {
        return ValidationResult.BLOCKER;
      }
      if (!Utils.isValidEmail(username)) {
        return ValidationResult.blocker(
          i18n("register.username.notValidEmail")
        );
      }
      if (usernameExists) {
        return ValidationResult.blocker(
          i18n("register.username-exists.tooltip")
        );
      }

      return ValidationResult.VALID;
    }
  ).current;

  // on username change, contact API and check if username already exists
  useEffect(() => {
    if (validateUsername(username) === ValidationResult.VALID) {
      fetchUsernameExists(username);
    }
  }, [username, validateUsername, fetchUsernameExists]);

  const validatePasswordConfirmation = () => {
    if (password !== passwordConfirmation) {
      return ValidationResult.blocker(
        i18n("register.passwords-not-matching.tooltip")
      );
    }
    if (validateNonEmpty(passwordConfirmation) === ValidationResult.BLOCKER) {
      return ValidationResult.BLOCKER;
    }
    return ValidationResult.VALID;
  };

  const onEnterPasswordToggle = () => {
    setEmailPassword(!emailPassword);
  };

  const isValid = () => {
    const validationResults = [
      validateNonEmpty(firstName),
      validateNonEmpty(lastName),
      validateUsername(username, usernameExists),
    ];
    if (!emailPassword) {
      validationResults.push(
        validateNonEmpty(password),
        validatePasswordConfirmation()
      );
    }

    // if there is at least one "false" value, the form is invalid
    return !validationResults
      // map validation results to booleans
      .map((result) => result.severity === Severity.VALID)
      // search "false" value
      .includes(false);
  };

  return (
    <Container>
      <PromiseTrackingMask area="CreateNewUserForm" />
      <Form>
        <Row>
          <Col md={6}>
            <EnhancedInput
              type="text"
              name="firstName"
              autoComplete="given-name"
              label={i18n("register.first-name")}
              labelDirection={LabelDirection.vertical}
              value={firstName}
              onChange={onChange.bind(this, setFirstName)}
              validation={validateNonEmpty(firstName)}
              autoFocus={true}
            />
          </Col>
          <Col md={6}>
            <EnhancedInput
              type="text"
              name="lastName"
              autoComplete="family-name"
              label={i18n("register.last-name")}
              labelDirection={LabelDirection.vertical}
              value={lastName}
              onChange={onChange.bind(this, setLastName)}
              validation={validateNonEmpty(lastName)}
            />
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <EnhancedInput
              type="text"
              name="username"
              autoComplete="username"
              label={i18n("register.username")}
              labelDirection={LabelDirection.vertical}
              value={username}
              onChange={onChange.bind(this, setUsername)}
              hint={i18n("register.username.help")}
              validation={validateUsername(username, usernameExists)}
            />
          </Col>
          <Col md={12}>
            <Toggle
              id="enter-password-toggle"
              onClick={onEnterPasswordToggle}
              on={i18n("administration.users.create.password-toggle.user")}
              off={i18n("administration.users.create.password-toggle.admin")}
              onstyle="primary"
              offstyle="secondary"
              size="sm"
              onClassName="toggle-custom"
              offClassName="toggle-custom"
              handleClassName="toggle-handle-custom"
              className="mb-4"
              style={TOGGLE_STYLE}
              active={emailPassword}
              recalculateOnResize={true}
            />
            <UncontrolledTooltip
              target="enter-password-toggle"
              placement="right"
            >
              {i18n(
                "administration.users.create.password-toggle.tooltip." +
                  (emailPassword ? "user" : "admin")
              )}
            </UncontrolledTooltip>
          </Col>
        </Row>
        <Collapse isOpen={!emailPassword}>
          <Row className="">
            <Col md={12}>
              <EnhancedInput
                type="password"
                name="password"
                autoComplete="new-password"
                label={i18n("register.password")}
                labelDirection={LabelDirection.vertical}
                onChange={onChange.bind(this, setPassword)}
                value={password}
                validation={validateNonEmpty(password)}
                disabled={emailPassword}
              />
            </Col>
            <Col md={12}>
              <EnhancedInput
                type="password"
                name="passwordConfirm"
                autoComplete="new-password"
                labelDirection={LabelDirection.vertical}
                label={i18n("register.password-confirm")}
                onChange={onChange.bind(this, setPasswordConfirmation)}
                onKeyPress={onKeyPress}
                value={passwordConfirmation}
                validation={validatePasswordConfirmation()}
                disabled={emailPassword}
              />
            </Col>
          </Row>
        </Collapse>
        <Button
          id="register-submit"
          className="btn-block"
          color="success"
          size="sm"
          disabled={!isValid()}
          onClick={onFormSubmit}
        >
          {i18n("administration.users.create.submit")}
        </Button>
      </Form>
    </Container>
  );
};

export default CreateNewUserForm;
