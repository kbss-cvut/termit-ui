import IntlData from "./model/IntlData";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { Route, Router, Switch } from "react-router-dom";
import Routing from "./util/Routing";
import Routes from "./util/Routes";
import { connect } from "react-redux";
import TermItState from "./model/TermItState";
import BreadcrumbRoute from "./component/breadcrumb/BreadcrumbRoute";
import Mask from "./component/misc/Mask";
import { useKeycloak } from "@react-keycloak/web";
import AuthUnavailable from "./component/misc/AuthUnavailable";
import LoginKeycloak from "./component/login/LoginKeycloak";

const PublicMainView = React.lazy(() => import("./component/public/MainView"));
const MainView = React.lazy(() => import("./component/MainView"));

interface IntlWrapperProps {
  intl: IntlData;
}

const AUTH_INIT_TIMEOUT = 20000;
let authTimeout: number;

const IntlWrapper: React.FC<IntlWrapperProps> = (props) => {
  const { intl } = props;
  const { initialized } = useKeycloak();
  const [authAvailable, setAuthAvailable] = React.useState(true);
  if (!authAvailable) {
    return (
      <IntlProvider {...intl}>
        <AuthUnavailable />
      </IntlProvider>
    );
  }
  if (!initialized) {
    // Keycloak does not allow error handling in case it is unable to connect to the auth server, so we handle it
    // by having a timer waiting for connection initialization.
    authTimeout = window.setTimeout(() => {
      if (!initialized) {
        setAuthAvailable(false);
      }
    }, AUTH_INIT_TIMEOUT);
    return (
      <IntlProvider {...intl}>
        <Mask />
      </IntlProvider>
    );
  }
  window.clearTimeout(authTimeout);

  return (
    <IntlProvider {...intl}>
      <Router history={Routing.history}>
        <React.Suspense fallback={<Mask />}>
          <Switch>
            <Route path={Routes.login.path} component={LoginKeycloak} />
            <BreadcrumbRoute
              path={Routes.publicDashboard.path}
              title={intl.messages["main.nav.dashboard"]}
              component={PublicMainView}
            />
            <BreadcrumbRoute
              title={intl.messages["main.nav.dashboard"]}
              component={MainView}
            />
          </Switch>
        </React.Suspense>
      </Router>
    </IntlProvider>
  );
};

export default connect((state: TermItState) => {
  return { intl: state.intl };
})(IntlWrapper);
