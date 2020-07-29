import {Route, RouteComponentProps, Switch} from "react-router";
import Routes from "../../util/Routes";
import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import ResourceSummaryRoute from "./ResourceSummaryRoute";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import ResourceFileDetail from "./ResourceFileDetail";

const ResourceRoute: React.FC<HasI18n & RouteComponentProps<any>> = (props) => {
    return <Switch>
        <BreadcrumbRoute title={props.i18n("annotator.annotate-content")} path={Routes.annotateFile.path}
                         component={ResourceFileDetail}/>
        <Route asset="resource" path={Routes.resourceSummary.path}
                                includeSearch={true} component={ResourceSummaryRoute}/>
    </Switch>;
};

export default injectIntl(withI18n(ResourceRoute));