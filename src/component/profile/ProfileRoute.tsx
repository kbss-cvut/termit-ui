import {Route, Switch} from "react-router";
import Routes from "../../util/Routes";
import * as React from "react";
import ChangePassword from "./ChangePassword";
import Profile from "./Profile";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";

const ProfileRoute: React.FC<HasI18n> = ({i18n}) => (
    <Switch>
        <BreadcrumbRoute
            title={i18n("profile.change-password")}
            path={Routes.changePassword.path}
            component={ChangePassword}/>
        <Route component={Profile}/>
    </Switch>
);

export default injectIntl(withI18n(ProfileRoute));
