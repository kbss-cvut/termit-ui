import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Button, ButtonToolbar, Col, Form, Modal, ModalBody, ModalHeader, Row} from "reactstrap";
import User from "../../model/User";
import EnhancedInput, {LabelDirection} from "../misc/EnhancedInput";

interface PasswordResetProps extends HasI18n {
    open?: boolean;
    user: User;
    onSubmit: (newPassword: string) => void;
    onCancel: () => void;
}

export const PasswordReset: React.FC<PasswordResetProps> = (props: PasswordResetProps) => {
    const [password, updatePassword] = React.useState("");
    const [passwordConfirm, updatePasswordConfirm] = React.useState("");

    return <Modal id="users-unlock" isOpen={props.open} toggle={props.onCancel}>
        <ModalHeader>{props.formatMessage("administration.users.unlock.title", {name: props.user.fullName})}</ModalHeader>
        <ModalBody>
            <Form>
                <EnhancedInput type="password" name="users-unlock-password" labelDirection={LabelDirection.horizontal}
                               label={props.i18n("administration.users.unlock.password")} value={password}
                               onChange={(e) => updatePassword(e.target.value)}
                               autoFocus={true} labelWidth={4} inputWidth={8}/>
                <EnhancedInput type="password" name="users-unlock-confirm" labelDirection={LabelDirection.horizontal}
                               label={props.i18n("administration.users.unlock.passwordConfirm")}
                               value={passwordConfirm} onChange={(e) => updatePasswordConfirm(e.target.value)}
                               labelWidth={4} inputWidth={8}/>

                <Row>
                    <Col xs={{size: "auto", offset: 4}}>
                        <ButtonToolbar>
                            <Button id="users-unlock-submit" color="success" size="sm"
                                    onClick={() => props.onSubmit(password)}
                                    disabled={password.trim().length === 0 || passwordConfirm.trim().length === 0}>
                                {props.i18n("administration.users.status.action.unlock")}
                            </Button>
                            <Button id="users-unlock-cancel" color="outline-dark" size="sm" onClick={props.onCancel}>
                                {props.i18n("cancel")}
                            </Button>
                        </ButtonToolbar>
                    </Col>
                </Row>
            </Form>
        </ModalBody>
    </Modal>;
};

export default injectIntl(withI18n(PasswordReset));
