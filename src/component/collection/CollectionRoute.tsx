import * as React from "react";
import { FunctionComponent } from "react";
import { useI18n } from "../hook/useI18n";
import { Route, Switch } from "react-router";
import Routes from "../../util/Routes";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";

const CollectionDetail = React.lazy(
  () => import("../collection/CollectionDetail")
);
const CollectionEdit = React.lazy(
  () => import("../collection/CollectionMetadataEdit")
);
const CollectionRoute: FunctionComponent = () => {
  const { i18n } = useI18n();

  return (
    <Switch>
      <BreadcrumbRoute
        component={CollectionEdit}
        title={i18n("edit")}
        path={Routes.editVocabularyCollection.path}
        includeSearch={true}
      />
      <Route
        component={CollectionDetail}
        path={Routes.vocabularyCollectionDetail.path}
      />
    </Switch>
  );
};

export default CollectionRoute;
