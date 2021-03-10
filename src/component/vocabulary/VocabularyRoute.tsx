import {Route, Switch} from "react-router";
import Routes from "../../util/Routes";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import TermDetail from "../term/TermDetail";
import * as React from "react";
import VocabularySummary from "./VocabularySummary";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import CreateTerm from "../term/CreateTerm";
import {useI18n} from "../hook/useI18n";

const VocabularyRoute: React.FC = () => {
    const {i18n} = useI18n();
    return <Switch>
        <BreadcrumbRoute title={i18n("glossary.createTerm.breadcrumb")}
                         path={Routes.createVocabularyTerm.path} component={CreateTerm}
                         includeSearch={true}/>
        <DynamicBreadcrumbRoute asset="selectedTerm" path={Routes.vocabularyTermDetail.path}
                                component={TermDetail} includeSearch={true}/>
        <Route asset="vocabulary" path={Routes.vocabularySummary.path}
               includeSearch={true} component={VocabularySummary}/>
    </Switch>;
};

export default VocabularyRoute;