import * as React from "react";
import { Route, Switch } from "react-router";
import Routes from "../../util/Routes";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import CreateResource from "./CreateResource";
import ResourceManagement from "./ResourceManagement";
import ResourceRoute from "./ResourceRoute";
import { useI18n } from "../hook/useI18n";

const ResourceManagementRoute: React.FC = () => {
  const { i18n } = useI18n();
  return (
    <Switch>
      <BreadcrumbRoute
        title={i18n("resource.create.title")}
        path={Routes.createResource.path}
        component={CreateResource}
      />
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
