import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import User from "../../model/User";
import {IfGranted} from "react-authorization";
import VocabularyUtils from "../../util/VocabularyUtils";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {Alert} from "reactstrap";
import {Route, Switch} from "react-router";
import Routes from "../../util/Routes";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import CreateNewUser from "./CreateNewUser";
import Administration from "./Administration";

interface AdministrationRouteProps extends HasI18n {
    user: User;
}

/**
 * Wraps administration in authorization to be able to display an error message in case an unauthorized user attempts
 * to open it by directly changing browser URL.
 */
const AdministrationRoute: React.FC<AdministrationRouteProps> = props => {
    const accessDeniedError = <div className="ml-3 mr-3"><Alert
        color="danger">{props.i18n("administration.accessDenied")}</Alert></div>;
    return <IfGranted expected={VocabularyUtils.USER_ADMIN} actual={props.user.types} unauthorized={accessDeniedError}>
        <Switch>
            <BreadcrumbRoute title={props.i18n("administration.users.create")}
                             path={Routes.createNewUser.path} component={CreateNewUser}/>
            <Route path={Routes.administration.path} component={Administration} exact={true}/>
        </Switch>
    </IfGranted>;
};

export default connect((state: TermItState) => {
    return {
        user: state.user
    };
})(injectIntl(withI18n(AdministrationRoute)));
