import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Button, ButtonToolbar, Col, Form, Row} from "reactstrap";
import CustomInput from "../misc/CustomInput";

interface ProfileEditFormProps extends HasI18n {
    firstName: string;
    lastName: string;
    isValid: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    showProfileView: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
                                                                    firstName, lastName, onChange, onSubmit, onKeyPress,
                                                                    showProfileView, isValid, i18n
                                                                }) => (
    <Form>
        <Row>
            <Col xl={6} md={12}>
                <CustomInput
                    name="firstName"
                    label={i18n("profile.first.name")}
                    value={firstName}
                    onChange={onChange}
                    invalid={firstName.trim().length === 0}
                    invalidMessage={i18n("profile.legend.invalid.name")}
                />
            </Col>
            <Col xl={6} md={12}>
                <CustomInput
                    name="lastName"
                    label={i18n("profile.last.name")}
                    value={lastName}
                    onChange={onChange}
                    invalid={firstName.trim().length === 0}
                    invalidMessage={i18n("profile.legend.invalid.name")}
                    onKeyPress={onKeyPress}
                />
            </Col>
        </Row>
        <Row>
            <Col xl={12}>
                <ButtonToolbar className="justify-content-center">
                    <Button id="profile-edit-submit" onClick={onSubmit} color="success" size="sm"
                            disabled={!isValid}>{i18n("save")}</Button>
                    <Button id="profile-edit-cancel" onClick={showProfileView} size="sm"
                            color="outline-dark">{i18n("cancel")}</Button>
                </ButtonToolbar>
            </Col>
        </Row>
    </Form>
);

export default injectIntl(withI18n(ProfileEditForm));
