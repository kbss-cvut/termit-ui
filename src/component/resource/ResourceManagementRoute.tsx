import * as React from "react";
import {Route, RouteComponentProps, Switch} from "react-router";
import Routes from "../../util/Routes";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import CreateResource from "./CreateResource";
import ResourceManagement from "./ResourceManagement";
import ResourceRoute from "./ResourceRoute";

const ResourceManagementRoute: React.FC<HasI18n & RouteComponentProps<any>> = (props) => {
    return <Switch>
        <BreadcrumbRoute title={props.i18n("resource.create.title")} path={Routes.createResource.path}
                         component={CreateResource}/>
        <DynamicBreadcrumbRoute asset="resource" path={Routes.resourceSummary.path}
                                includeSearch={true} component={ResourceRoute}/>
        <Route component={ResourceManagement} path={Routes.resources.path}/>
    </Switch>;
};

export default injectIntl(withI18n(ResourceManagementRoute));