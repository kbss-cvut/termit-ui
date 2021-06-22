import * as React from "react";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import TermItState from "../../model/TermItState";
import { ThunkDispatch } from "../../util/Types";
import {
  Button,
  ButtonToolbar,
  Card,
  CardBody,
  Col,
  Form,
  Row,
} from "reactstrap";
import CustomInput from "../misc/CustomInput";
import { AsyncAction } from "../../action/ActionType";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import User, {
  PasswordUpdateUser,
  UserDataWithPassword,
} from "../../model/User";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import { changePassword } from "../../action/AsyncUserActions";
import HeaderWithActions from "../misc/HeaderWithActions";
import ValidationResult, { Severity } from "../../model/form/ValidationResult";

interface ChangePasswordProps extends HasI18n {
  user: User;
  changePassword: (user: User) => Promise<AsyncAction>;
}

interface ChangePasswordState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export class ChangePassword extends React.Component<
  ChangePasswordProps,
  ChangePasswordState
> {
  constructor(props: ChangePasswordProps) {
    super(props);
    this.state = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  }

  private onInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newState = Object.assign({}, this.state);
    newState[e.currentTarget.name!] = e.currentTarget.value;
    this.setState(newState);
  };

  private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      this.onChangePassword();
    }
  };

  private onChangePassword = (): void => {
    if (!this.isValid()) {
      return;
    }

    const userDataWithPassword: UserDataWithPassword = {
      ...this.props.user,
      originalPassword: this.state.currentPassword,
      password: this.state.newPassword,
    };

    this.props
      .changePassword(new PasswordUpdateUser(userDataWithPassword))
      .then((asyncResult: AsyncAction) => {
        if (asyncResult.status === AsyncActionStatus.SUCCESS) {
          this.navigateToProfileRoute();
        }
      });
  };

  private passwordsMatch(): boolean {
    return this.state.newPassword === this.state.confirmPassword;
  }

  private passwordsDiffer(): boolean {
    return this.state.currentPassword !== this.state.newPassword;
  }

  private validateNewPassword() {
    return this.state.newPassword.trim().length > 0 && !this.passwordsDiffer()
      ? new ValidationResult(
          Severity.BLOCKER,
          this.props.i18n("change-password.passwords.differ.tooltip")
        )
      : undefined;
  }

  private validatePasswordConfirmation() {
    return this.state.newPassword.trim().length > 0 && !this.passwordsMatch()
      ? new ValidationResult(
          Severity.BLOCKER,
          this.props.i18n("register.passwords-not-matching.tooltip")
        )
      : undefined;
  }

  private isValid(): boolean {
    return (
      this.state.currentPassword.trim().length > 0 &&
      this.state.newPassword.trim().length > 0 &&
      this.state.confirmPassword.trim().length > 0 &&
      this.passwordsMatch() &&
      this.passwordsDiffer()
    );
  }

  private navigateToProfileRoute = () => Routing.transitionTo(Routes.profile);

  public render() {
    const { i18n } = this.props;

    return (
      <>
        <HeaderWithActions title={i18n("profile.change-password")} />
        <Card id="change-password">
          <CardBody>
            <Form>
              <Row>
                <Col xl={6} md={12}>
                  <CustomInput
                    type="password"
                    name="currentPassword"
                    label={i18n("change-password.current.password")}
                    value={this.state.currentPassword}
                    onChange={this.onInputChange}
                    autoComplete="current-password"
                  />
                </Col>
              </Row>
              <Row>
                <Col xl={6} md={12}>
                  <CustomInput
                    type="password"
                    name="newPassword"
                    label={i18n("change-password.new.password")}
                    value={this.state.newPassword}
                    validation={this.validateNewPassword()}
                    onChange={this.onInputChange}
                    autoComplete="new-password"
                  />
                </Col>
                <Col xl={6} md={12}>
                  <CustomInput
                    type="password"
                    name="confirmPassword"
                    label={i18n("change-password.confirm.password")}
                    value={this.state.confirmPassword}
                    validation={this.validatePasswordConfirmation()}
                    onChange={this.onInputChange}
                    onKeyPress={this.onKeyPress}
                    autoComplete="new-password"
                  />
                </Col>
              </Row>
              <Row>
                <Col xl={12}>
                  <ButtonToolbar className="justify-content-center">
                    <Button
                      id="change-password-submit"
                      onClick={this.onChangePassword}
                      color="success"
                      size="sm"
                      disabled={!this.isValid()}
                    >
                      {i18n("save")}
                    </Button>
                    <Button
                      id="change-password-cancel"
                      onClick={this.navigateToProfileRoute}
                      size="sm"
                      color="outline-dark"
                    >
                      {i18n("cancel")}
                    </Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>
      </>
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      user: state.user,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      changePassword: (name: User) => dispatch(changePassword(name)),
    };
  }
)(injectIntl(withI18n(ChangePassword)));
