import * as React from "react";
import {Route, Switch} from "react-router";
import Routes from "../../util/Routes";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import {VocabularyFileDetail} from "./VocabularyFileDetail";
import {useI18n} from "../hook/useI18n";

const VocabularyFileDetailRoute: React.FC = () => {
    const {i18n} = useI18n();
    return <Switch>
        <BreadcrumbRoute title={i18n("annotator.annotate-content")} path={Routes.annotateVocabularyFile.path}
                         component={VocabularyFileDetail}
                         includeSearch={true}/>
        <Route component={VocabularyFileDetail}/>
    </Switch>;
};

export default VocabularyFileDetailRoute;