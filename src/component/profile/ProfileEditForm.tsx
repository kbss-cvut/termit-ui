import * as React from "react";
import { Button, ButtonToolbar, Col, Form, Row } from "reactstrap";
import CustomInput from "../misc/CustomInput";
import { useI18n } from "../hook/useI18n";
import ValidationResult from "../../model/form/ValidationResult";
import Utils from "../../util/Utils";

interface ProfileEditFormProps {
  firstName: string;
  lastName: string;
  username: string;
  isValid: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showProfileView: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  firstName,
  lastName,
  username,
  onChange,
  onSubmit,
  onKeyPress,
  showProfileView,
  isValid,
}) => {
  const { i18n } = useI18n();
  return (
    <Form>
      <Row>
        <Col xs={12}>
          <CustomInput
            name="firstName"
            label={i18n("profile.first.name")}
            value={firstName}
            onChange={onChange}
            validation={
              firstName.trim().length === 0
                ? ValidationResult.blocker(i18n("profile.legend.invalid.name"))
                : ValidationResult.VALID
            }
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <CustomInput
            name="lastName"
            label={i18n("profile.last.name")}
            value={lastName}
            onChange={onChange}
            validation={
              lastName.trim().length === 0
                ? ValidationResult.blocker(i18n("profile.legend.invalid.name"))
                : ValidationResult.VALID
            }
            onKeyPress={onKeyPress}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <CustomInput
            name="username"
            label={i18n("login.username")}
            value={username}
            onChange={onChange}
            validation={
              username.trim().length === 0 || !Utils.isValidEmail(username)
                ? ValidationResult.blocker(
                    i18n("register.username.notValidEmail")
                  )
                : ValidationResult.VALID
            }
            onKeyPress={onKeyPress}
          />
        </Col>
      </Row>
      <Row>
        <Col xl={12}>
          <ButtonToolbar className="justify-content-center">
            <Button
              id="profile-edit-submit"
              onClick={onSubmit}
              color="success"
              size="sm"
              disabled={!isValid}
            >
              {i18n("save")}
            </Button>
            <Button
              id="profile-edit-cancel"
              onClick={showProfileView}
              size="sm"
              color="outline-dark"
            >
              {i18n("cancel")}
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    </Form>
  );
};

export default ProfileEditForm;
