import * as React from "react";
import {Col, Label, Row} from "reactstrap";
import User from "../../model/User";
import {useI18n} from "../hook/useI18n";

interface ProfileViewProps {
    user: User;
}

const ProfileView: React.FC<ProfileViewProps> = ({user}) => {
    const {i18n} = useI18n();
    return <>
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
    </>;
};

export default ProfileView;