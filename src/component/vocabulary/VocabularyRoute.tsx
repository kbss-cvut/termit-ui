import * as React from "react";
import { Switch } from "react-router";
import Routes from "../../util/Routes";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import TermDetail from "../term/TermDetail";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import CreateTerm from "../term/CreateTerm";
import VocabularySummary from "./VocabularySummary";
import { useI18n } from "../hook/useI18n";
import Route from "../misc/Route";
import ResourceFileDetail from "../resource/ResourceFileDetail";
import VocabularySheetViewPage from "./sheet/VocabularySheetViewPage";

const VocabularyRoute: React.FC = () => {
  const { i18n } = useI18n();
  return (
    <Switch>
      <BreadcrumbRoute
        title={i18n("glossary.createTerm.breadcrumb")}
        path={Routes.createVocabularyTerm.path}
        component={CreateTerm}
        includeSearch={true}
      />
      <BreadcrumbRoute
        title={i18n("glossary.table.workspace.breadcrumb")}
        path={Routes.vocabularySheetView.path}
        component={VocabularySheetViewPage}
        includeSearch={true}
      />
      <DynamicBreadcrumbRoute
        asset="selectedTerm"
        path={Routes.vocabularyTermSnapshotDetail.path}
        component={TermDetail}
        includeSearch={true}
      />
      <DynamicBreadcrumbRoute
        asset="selectedTerm"
        path={Routes.vocabularyTermDetail.path}
        component={TermDetail}
        includeSearch={true}
      />
      <DynamicBreadcrumbRoute
        asset="selectedFile"
        path={Routes.annotateFile.path}
        component={ResourceFileDetail}
        includeSearch={true}
      />
      <Route
        asset="vocabulary"
        path={Routes.vocabularySnapshotSummary.path}
        includeSearch={true}
        component={VocabularySummary}
      />
      <Route
        asset="vocabulary"
        path={Routes.vocabularySummary.path}
        includeSearch={true}
        component={VocabularySummary}
      />
    </Switch>
  );
};

export default VocabularyRoute;
