import * as React from "react";
import { IntlProvider } from "react-intl";
import { Router, Switch } from "react-router-dom";
import Routing from "./util/Routing";
import Routes from "./util/Routes";
import { useSelector } from "react-redux";
import TermItState from "./model/TermItState";
import BreadcrumbRoute from "./component/breadcrumb/BreadcrumbRoute";
import Mask from "./component/misc/Mask";
import OidcAuthWrapper from "./component/misc/oidc/OidcAuthWrapper";

const PublicMainView = React.lazy(() => import("./component/public/MainView"));
const MainView = React.lazy(() => import("./component/MainView"));

const IntlWrapper: React.FC = () => {
  const intl = useSelector((state: TermItState) => state.intl);
  return (
    <IntlProvider {...intl}>
      <Router history={Routing.history}>
        <React.Suspense fallback={<Mask />}>
          <Switch>
            <BreadcrumbRoute
              path={Routes.publicDashboard.path}
              title={intl.messages["main.nav.dashboard"]}
              component={PublicMainView}
            />
            <BreadcrumbRoute
              title={intl.messages["main.nav.dashboard"]}
              component={OidcMainView}
            />
          </Switch>
        </React.Suspense>
      </Router>
    </IntlProvider>
  );
};

const OidcMainView = () => (
  <OidcAuthWrapper>
    <MainView />
  </OidcAuthWrapper>
);

export default IntlWrapper;
