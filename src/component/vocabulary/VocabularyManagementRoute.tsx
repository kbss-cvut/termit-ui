import * as React from "react";
import {Route, RouteComponentProps, Switch} from "react-router";
import Routes from "../../util/Routes";
import VocabularyManagement from "./VocabularyManagement";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import VocabularyFileDetailRoute from "./VocabularyFileDetailRoute";
import VocabularyRoute from "./VocabularyRoute";
import CreateVocabularyRoute from "./CreateVocabularyRoute";

function removeLastLocation(path: string): string {
    return path.replace(/\/[^/]*$/, "");
}

const VocabularyManagementRoute: React.FC<HasI18n & RouteComponentProps<any>> = (props) => {
    return <Switch>
        <DynamicBreadcrumbRoute asset="vocabulary" path={removeLastLocation(Routes.annotateVocabularyFile.path)}
                                component={VocabularyFileDetailRoute}/>
        <BreadcrumbRoute title={props.i18n("vocabulary.create.title")} path={Routes.createVocabulary.path}
                         component={CreateVocabularyRoute}/>
        <DynamicBreadcrumbRoute asset="vocabulary" path={Routes.vocabularySummary.path}
                                includeSearch={true} component={VocabularyRoute}/>
        <Route component={VocabularyManagement} path={Routes.vocabularies.path}/>
    </Switch>;
};

export default injectIntl(withI18n(VocabularyManagementRoute));