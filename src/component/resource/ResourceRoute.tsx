import {Route, Switch} from "react-router";
import Routes from "../../util/Routes";
import * as React from "react";
import ResourceSummaryRoute from "./ResourceSummaryRoute";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import Mask from "../misc/Mask";
import {useI18n} from "../hook/useI18n";

const ResourceFileDetail = React.lazy(() => import("./ResourceFileDetail"));

const ResourceRoute: React.FC = () => {
    const {i18n} = useI18n();
    return <React.Suspense fallback={<Mask/>}>
        <Switch>
            <BreadcrumbRoute title={i18n("annotator.annotate-content")} path={Routes.annotateFile.path}
                             component={ResourceFileDetail}/>
            <Route asset="resource" path={Routes.resourceSummary.path}
                   includeSearch={true} component={ResourceSummaryRoute}/>
        </Switch>
    </React.Suspense>;
};

export default ResourceRoute;
