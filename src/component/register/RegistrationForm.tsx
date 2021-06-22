import * as React from "react";
import { UserAccountData } from "../../model/User";
import { AsyncFailureAction, MessageAction } from "../../action/ActionType";
import ErrorInfo from "../../model/ErrorInfo";
import Ajax, { params } from "../../util/Ajax";
import Constants from "../../util/Constants";
import { Alert, Button, Col, Form, Row } from "reactstrap";
import EnhancedInput, { LabelDirection } from "../misc/EnhancedInput";
import Mask from "../misc/Mask";
import withI18n, { HasI18n } from "../hoc/withI18n";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import { injectIntl } from "react-intl";
import VocabularyUtils from "../../util/VocabularyUtils";
import ValidationResult, { Severity } from "../../model/form/ValidationResult";

interface RegistrationFormProps extends HasI18n {
  loading: boolean;
  register: (
    user: UserAccountData
  ) => Promise<AsyncFailureAction | MessageAction>;
  cancel: () => void;
}

interface RegistrationFormState extends UserAccountData {
  types: string[];
  passwordConfirm: string;
  usernameExists: boolean;
  error: ErrorInfo | null;
}

export class RegistrationForm extends React.Component<
  RegistrationFormProps,
  RegistrationFormState
> {
  constructor(props: RegistrationFormProps) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      types: [VocabularyUtils.USER_RESTRICTED],
      passwordConfirm: "",
      usernameExists: false,
      error: null,
    };
  }

  public onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newState = Object.assign({}, this.state, { error: null });
    newState[e.currentTarget.name!] = e.currentTarget.value;
    this.setState(newState);
  };

  private onUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.onChange(e);
    const username = e.currentTarget.value;
    Ajax.get(
      Constants.API_PREFIX + "/users/username",
      params({ username })
    ).then((data) => {
      this.setState({ usernameExists: data === true });
    });
  };

  private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && this.isValid()) {
      this.onRegister();
    }
  };

  private validateFirstName() {
    return this.state.firstName.trim().length === 0
      ? ValidationResult.BLOCKER
      : ValidationResult.VALID;
  }

  private validateLastName() {
    return this.state.lastName.trim().length === 0
      ? ValidationResult.BLOCKER
      : ValidationResult.VALID;
  }

  private validateUsername() {
    const { username, usernameExists } = this.state;
    if (username.trim().length === 0) {
      return ValidationResult.BLOCKER;
    }
    if (usernameExists) {
      return new ValidationResult(
        Severity.BLOCKER,
        this.props.i18n("register.username-exists.tooltip")
      );
    }
    return ValidationResult.VALID;
  }

  private validatePassword() {
    return this.state.password.trim().length === 0 || !this.passwordsMatch()
      ? ValidationResult.BLOCKER
      : ValidationResult.VALID;
  }

  private isValid(): boolean {
    return (
      this.validateFirstName().severity === Severity.VALID &&
      this.validateLastName().severity === Severity.VALID &&
      this.validateUsername().severity === Severity.VALID &&
      this.state.password.trim().length > 0 &&
      this.passwordsMatch() &&
      !this.state.usernameExists
    );
  }

  private passwordsMatch(): boolean {
    return this.state.password === this.state.passwordConfirm;
  }

  public onRegister = () => {
    const { passwordConfirm, usernameExists, error, ...userData } = this.state;
    this.props.register(userData).then((result) => {
      const asyncResult = result as AsyncFailureAction;
      if (asyncResult.status === AsyncActionStatus.FAILURE) {
        this.setState({ error: asyncResult.error });
      }
    });
  };

  public render() {
    const i18n = this.props.i18n;
    return (
      <>
        {this.renderMask()}
        <Form>
          {this.renderAlert()}
          <Row>
            <Col md={6}>
              <EnhancedInput
                type="text"
                name="firstName"
                autoComplete="given-name"
                label={i18n("register.first-name")}
                labelDirection={LabelDirection.vertical}
                value={this.state.firstName}
                onChange={this.onChange}
                validation={this.validateFirstName()}
                autoFocus={true}
                placeholder={i18n("register.first-name.placeholder")}
              />
            </Col>
            <Col md={6}>
              <EnhancedInput
                type="text"
                name="lastName"
                autoComplete="family-name"
                label={i18n("register.last-name")}
                labelDirection={LabelDirection.vertical}
                value={this.state.lastName}
                onChange={this.onChange}
                validation={this.validateLastName()}
                placeholder={i18n("register.last-name.placeholder")}
              />
            </Col>
          </Row>
          {this.renderUsername()}
          <EnhancedInput
            type="password"
            name="password"
            autoComplete="new-password"
            label={i18n("register.password")}
            labelDirection={LabelDirection.vertical}
            onChange={this.onChange}
            value={this.state.password}
            placeholder={i18n("register.password.placeholder")}
            validation={this.validatePassword()}
          />

          {this.renderPasswordConfirm()}
          <Button
            id="register-submit"
            className="btn-block"
            color="success"
            size="sm"
            disabled={!this.isValid() || this.props.loading}
            onClick={this.onRegister}
          >
            {i18n("register.submit")}
          </Button>
          <br />
        </Form>
      </>
    );
  }

  private renderMask() {
    return this.props.loading ? (
      <Mask text={this.props.i18n("register.mask")} classes="mask-container" />
    ) : null;
  }

  private renderAlert() {
    if (!this.state.error) {
      return null;
    }
    const error = this.state.error;
    const text = error.messageId
      ? this.props.i18n(error.messageId)
      : error.message;
    return <Alert color="danger">{text}</Alert>;
  }

  private renderUsername() {
    const i18n = this.props.i18n;

    return (
      <EnhancedInput
        type="text"
        name="username"
        autoComplete="username"
        label={i18n("register.username")}
        labelDirection={LabelDirection.vertical}
        value={this.state.username}
        onChange={this.onUsernameChange}
        placeholder={i18n("register.username.placeholder")}
        validation={this.validateUsername()}
      />
    );
  }

  private renderPasswordConfirm() {
    const i18n = this.props.i18n;
    const validation = this.passwordsMatch()
      ? ValidationResult.VALID
      : new ValidationResult(
          Severity.BLOCKER,
          i18n("register.passwords-not-matching.tooltip")
        );

    return (
      <EnhancedInput
        type="password"
        name="passwordConfirm"
        autoComplete="new-password"
        labelDirection={LabelDirection.vertical}
        label={this.props.i18n("register.password-confirm")}
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
        value={this.state.passwordConfirm}
        validation={validation}
        placeholder={i18n("register.password-confirm.placeholder")}
      />
    );
  }
}

export default injectIntl(withI18n(RegistrationForm));
