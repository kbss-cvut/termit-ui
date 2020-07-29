import * as React from "react";
import {Route, RouteComponentProps, Switch} from "react-router";
import Routes from "../../util/Routes";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import {VocabularyFileDetail} from "./VocabularyFileDetail";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";

const VocabularyFileDetailRoute: React.SFC<RouteComponentProps<any> & HasI18n> = (props) => {
    const i18n = props.i18n;
    return <Switch>
        <BreadcrumbRoute title={i18n("annotator.annotate-content")} path={Routes.annotateVocabularyFile.path}
                         component={VocabularyFileDetail}
                         includeSearch={true}/>
        <Route component={VocabularyFileDetail}/>
    </Switch>;
};

export default injectIntl(withI18n(VocabularyFileDetailRoute));