import * as React from "react";
import {Route, Switch} from "react-router";
import Routes from "../../util/Routes";
import VocabularyManagement from "./VocabularyManagement";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import VocabularyFileDetailRoute from "./VocabularyFileDetailRoute";
import VocabularyRoute from "./VocabularyRoute";
import CreateVocabularyRoute from "./CreateVocabularyRoute";
import {useI18n} from "../hook/useI18n";

function removeLastLocation(path: string): string {
    return path.replace(/\/[^/]*$/, "");
}

const VocabularyManagementRoute: React.FC = () => {
    const {i18n} = useI18n();
    return <Switch>
        <DynamicBreadcrumbRoute asset="vocabulary" path={removeLastLocation(Routes.annotateVocabularyFile.path)}
                                component={VocabularyFileDetailRoute}/>
        <BreadcrumbRoute title={i18n("vocabulary.create.title")} path={Routes.createVocabulary.path}
                         component={CreateVocabularyRoute}/>
        <DynamicBreadcrumbRoute asset="vocabulary" path={Routes.vocabularySummary.path}
                                includeSearch={true} component={VocabularyRoute}/>
        <Route component={VocabularyManagement} path={Routes.vocabularies.path}/>
    </Switch>;
};

export default VocabularyManagementRoute;