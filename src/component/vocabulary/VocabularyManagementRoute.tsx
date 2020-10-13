import * as React from "react";
import {Route, RouteComponentProps, Switch} from "react-router";
import Routes from "../../util/Routes";
import VocabularyManagement from "./VocabularyManagement";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import VocabularyFileDetailRoute from "./VocabularyFileDetailRoute";
import VocabularyRoute from "./VocabularyRoute";

function removeLastLocation(path: string): string {
    return path.replace(/\/[^/]*$/, "");
}

const VocabularyManagementRoute: React.FC<HasI18n & RouteComponentProps<any>> = (props) => {
    return <Switch>
        <DynamicBreadcrumbRoute asset="vocabulary" path={removeLastLocation(Routes.annotateVocabularyFile.path)}
                                component={VocabularyFileDetailRoute}/>
        <DynamicBreadcrumbRoute asset="vocabulary" path={Routes.vocabularySummary.path}
                                includeSearch={true} component={VocabularyRoute}/>
        <Route component={VocabularyManagement} path={Routes.vocabularies.path}/>
    </Switch>;
};

export default injectIntl(withI18n(VocabularyManagementRoute));
