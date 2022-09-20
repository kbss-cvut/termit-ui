import * as React from "react";
import { Route, Switch } from "react-router";
import Routes from "../../util/Routes";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import VocabularyRoute from "./VocabularyRoute";
import CreateVocabularyRoute from "./CreateVocabularyRoute";
import VocabularyManagement from "./VocabularyManagement";
import { useI18n } from "../hook/useI18n";
import ImportVocabularyRoute from "./ImportVocabularyRoute";

const VocabularyManagementRoute: React.FC = () => {
  const { i18n } = useI18n();
  return (
    <Switch>
      <BreadcrumbRoute
        title={i18n("vocabulary.create.title")}
        path={Routes.createVocabulary.path}
        component={CreateVocabularyRoute}
      />
      <BreadcrumbRoute
        title={i18n("vocabulary.import.title")}
        path={Routes.importVocabulary.path}
        component={ImportVocabularyRoute}
      />
      <DynamicBreadcrumbRoute
        asset="vocabulary"
        path={Routes.vocabularySnapshotSummary.path}
        includeSearch={true}
        component={VocabularyRoute}
      />
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
