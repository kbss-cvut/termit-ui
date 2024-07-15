import * as React from "react";
import { IntlProvider } from "react-intl";
import { Route, Router, Switch } from "react-router-dom";
import Routing from "./util/Routing";
import Routes from "./util/Routes";
import Login from "./component/login/Login";
import Register from "./component/register/Register";
import ForgotPassword from "./component/forgotpassword/ForgotPassword";
import { useSelector } from "react-redux";
import TermItState from "./model/TermItState";
import BreadcrumbRoute from "./component/breadcrumb/BreadcrumbRoute";
import Mask from "./component/misc/Mask";

const PublicMainView = React.lazy(() => import("./component/public/MainView"));
const MainView = React.lazy(() => import("./component/MainView"));

const IntlWrapper: React.FC = () => {
  const intl = useSelector((state: TermItState) => state.intl);
  return (
    <IntlProvider {...intl}>
      <Router history={Routing.history}>
        <React.Suspense fallback={<Mask />}>
          <Switch>
            <Route path={Routes.login.path} component={Login} />
            <Route path={Routes.register.path} component={Register} />
            <Route
              path={Routes.forgotPassword.path}
              component={ForgotPassword}
            />
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

export default IntlWrapper;
