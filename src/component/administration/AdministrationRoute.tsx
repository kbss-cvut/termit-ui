import * as React from "react";
import { IfGranted } from "react-authorization";
import VocabularyUtils from "../../util/VocabularyUtils";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { Route, Switch } from "react-router";
import Routes from "../../util/Routes";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import CreateNewUser from "./user/CreateNewUser";
import Administration from "./Administration";
import Unauthorized from "../authorization/Unauthorized";
import { useI18n } from "../hook/useI18n";
import CreateUserGroup from "./group/CreateUserGroup";

/**
 * Wraps administration in authorization to be able to display an error message in case an unauthorized user attempts
 * to open it by directly changing browser URL.
 */
const AdministrationRoute: React.FC = () => {
  const { i18n } = useI18n();
  const user = useSelector((state: TermItState) => state.user);
  return (
    <IfGranted
      expected={VocabularyUtils.USER_ADMIN}
      actual={user.types}
      unauthorized={<Unauthorized />}
    >
      <Switch>
        <BreadcrumbRoute
          title={i18n("administration.users.create")}
          path={Routes.createNewUser.path}
          component={CreateNewUser}
        />
        <BreadcrumbRoute
          title={i18n("administration.groups.create")}
          path={Routes.createNewUserGroup.path}
          component={CreateUserGroup}
        />
        <Route
          path={Routes.administration.path}
          component={Administration}
          exact={true}
        />
      </Switch>
    </IfGranted>
  );
};

export default AdministrationRoute;
