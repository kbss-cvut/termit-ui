import {Route, Switch} from "react-router";
import Routes from "../../util/Routes";
import * as React from "react";
import ResourceSummaryRoute from "./ResourceSummaryRoute";
import Mask from "../misc/Mask";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";

const ResourceFileDetail = React.lazy(() => import("./ResourceFileDetail"));

const ResourceRoute: React.FC = () => {
    return <React.Suspense fallback={<Mask/>}>
        <Switch>
            <DynamicBreadcrumbRoute asset="selectedFile" path={Routes.annotateFile.path}
                                    component={ResourceFileDetail} includeSearch={true}/>
            <Route asset="resource" path={Routes.resourceSummary.path}
                   includeSearch={true} component={ResourceSummaryRoute}/>
        </Switch>
    </React.Suspense>;
};

export default ResourceRoute;
