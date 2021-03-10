import * as React from "react";
import {RouteComponentProps, Switch} from "react-router";
import Route from "../../misc/Route";
import VocabularySummary from "./VocabularySummary";
import Routes from "../../../util/Routes";
import DynamicBreadcrumbRoute from "../../breadcrumb/DynamicBreadcrumbRoute";
import TermDetail from "../term/TermDetail";

const VocabularyRoute: React.FC<RouteComponentProps<any>> = () => {
    return <Switch>
        <DynamicBreadcrumbRoute asset="selectedTerm" path={Routes.publicVocabularyTermDetail.path}
                                component={TermDetail} includeSearch={true}/>
        <Route asset="vocabulary" path={Routes.publicVocabularySummary.path}
               includeSearch={true} component={VocabularySummary}/>
    </Switch>;
};

export default VocabularyRoute;
