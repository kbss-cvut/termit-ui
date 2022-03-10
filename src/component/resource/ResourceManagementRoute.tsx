import * as React from "react";
import { Route, Switch } from "react-router";
import Routes from "../../util/Routes";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import ResourceManagement from "./ResourceManagement";
import ResourceRoute from "./ResourceRoute";

const ResourceManagementRoute: React.FC = () => {
  return (
    <Switch>
      <DynamicBreadcrumbRoute
        asset="resource"
        path={Routes.resourceSummary.path}
        includeSearch={true}
        component={ResourceRoute}
      />
      <Route component={ResourceManagement} path={Routes.resources.path} />
    </Switch>
  );
};

export default ResourceManagementRoute;
