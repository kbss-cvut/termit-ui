import * as React from "react";
import { Route, Switch } from "react-router";
import Routes from "../../util/Routes";
import VocabularyManagement from "./VocabularyManagement";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import VocabularyRoute from "./VocabularyRoute";

const VocabularyManagementRoute: React.FC = () => {
  return (
    <Switch>
      <DynamicBreadcrumbRoute
        asset="vocabulary"
        path={Routes.vocabularySummary.path}
        includeSearch={true}
        component={VocabularyRoute}
      />
      <Route component={VocabularyManagement} path={Routes.vocabularies.path} />
    </Switch>
  );
};

export default VocabularyManagementRoute;
