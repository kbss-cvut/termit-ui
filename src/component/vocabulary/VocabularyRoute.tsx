import {Route, RouteComponentProps, Switch} from "react-router";
import Routes from "../../util/Routes";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import TermDetail from "../term/TermDetail";
import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import VocabularySummary from "./VocabularySummary";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import CreateTerm from "../term/CreateTerm";

const VocabularyRoute: React.FC<HasI18n & RouteComponentProps<any>> = (props) => {
    return <Switch>
        <BreadcrumbRoute title={props.i18n("glossary.createTerm.breadcrumb")}
                         path={Routes.createVocabularyTerm.path} component={CreateTerm}
                         includeSearch={true}/>
        <DynamicBreadcrumbRoute asset="selectedTerm" path={Routes.vocabularyTermDetail.path}
                                component={TermDetail} includeSearch={true}/>
        <Route asset="vocabulary" path={Routes.vocabularySummary.path}
                                includeSearch={true} component={VocabularySummary}/>
    </Switch>;
};

export default injectIntl(withI18n(VocabularyRoute));