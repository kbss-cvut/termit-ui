import * as React from "react";
import {Button, ButtonToolbar} from "reactstrap";
import {GoKey, GoPencil} from "react-icons/go";
import {useI18n} from "../hook/useI18n";

interface ProfileActionButtonsProps {
    edit: boolean;
    showProfileEdit: () => void;
    navigateToChangePasswordRoute: () => void;
}

export const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({
                                                                              edit,
                                                                              showProfileEdit,
                                                                              navigateToChangePasswordRoute
                                                                          }) => {
    const {i18n} = useI18n();
    return <ButtonToolbar key="profile.summary.actions">
        {!edit && <>
            <Button
                id="profile-edit"
                key="profile.edit"
                size="sm"
                color="primary"
                title={i18n("edit")}
                onClick={showProfileEdit}>
                <GoPencil/>&nbsp;{i18n("edit")}
            </Button>
            <Button
                id="profile-change-password"
                key="profile.change.password"
                size="sm"
                color="primary"
                title={i18n("profile.change-password")}
                onClick={navigateToChangePasswordRoute}>
                <GoKey/>&nbsp;{i18n("profile.change-password")}
            </Button></>}
    </ButtonToolbar>;
};

export default ProfileActionButtons;
