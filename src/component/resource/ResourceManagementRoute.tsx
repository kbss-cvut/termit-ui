import * as React from "react";
import { Switch } from "react-router";
import Routes from "../../util/Routes";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
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
    </Switch>
  );
};

export default ResourceManagementRoute;
