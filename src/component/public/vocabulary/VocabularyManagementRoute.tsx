import * as React from "react";
import {Route, RouteComponentProps, Switch} from "react-router";
import DynamicBreadcrumbRoute from "../../breadcrumb/DynamicBreadcrumbRoute";
import Routes from "../../../util/Routes";
import VocabularyRoute from "./VocabularyRoute";
import VocabularyManagement from "./VocabularyManagement";

const VocabularyManagementRoute: React.FC<RouteComponentProps<any>> = () => {
    return <Switch>
        <DynamicBreadcrumbRoute asset="vocabulary" path={Routes.publicVocabularySummary.path}
                                includeSearch={true} component={VocabularyRoute}/>
        <Route component={VocabularyManagement} path={Routes.publicVocabularies.path}/>
    </Switch>;
};

export default VocabularyManagementRoute;
