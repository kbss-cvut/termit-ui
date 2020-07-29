import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Button, ButtonToolbar} from "reactstrap";
import {GoKey, GoPencil} from "react-icons/go";

interface ProfileActionButtonsProps extends HasI18n {
    edit: boolean;
    showProfileEdit: () => void;
    navigateToChangePasswordRoute: () => void;
}

export const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({edit, showProfileEdit, navigateToChangePasswordRoute, i18n}) => (
    <ButtonToolbar key="profile.summary.actions">
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
    </ButtonToolbar>
);

export default injectIntl(withI18n(ProfileActionButtons));
