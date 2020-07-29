import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Col, Label, Row} from "reactstrap";
import User from "../../model/User";

interface ProfileViewProps extends HasI18n {
    user: User;
}

const ProfileView: React.FC<ProfileViewProps> = ({user, i18n}) => (
    <>
        <Row>
            <Col xl={2}>
                <Label className="attribute-label">{i18n("profile.first.name")}:</Label>
            </Col>
            <Col xl={4}>
                <Label id="profile-first-name">{user.firstName}</Label>
            </Col>
        </Row>
        <Row>
            <Col xl={2}>
                <Label className="attribute-label">{i18n("profile.last.name")}:</Label>
            </Col>
            <Col xl={4}>
                <Label id="profile-last-name">{user.lastName}</Label>
            </Col>
        </Row>
    </>
);

export default injectIntl(withI18n(ProfileView));