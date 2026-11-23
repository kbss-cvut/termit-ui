import * as React from "react";
import { FunctionComponent } from "react";
import { useI18n } from "../hook/useI18n";
import { Route, Switch } from "react-router";
import Routes from "../../util/Routes";
import BreadcrumbRoute from "../breadcrumb/BreadcrumbRoute";
import DynamicBreadcrumbRoute from "../breadcrumb/DynamicBreadcrumbRoute";
import { Redirect } from "react-router-dom";

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
        title={i18n("collection.create")}
        component={CollectionEdit}
        path={Routes.createVocabularyCollection.path}
        includeSearch={true}
      />
      <DynamicBreadcrumbRoute
        asset={"selectedCollection"}
        path={Routes.vocabularyCollectionDetail.path}
        component={CollectionDetailRoute}
        includeSearch={true}
      />
      <Redirect to={Routes.vocabularyCollectionsList.path} />
    </Switch>
  );
};

const CollectionDetailRoute: FunctionComponent = () => {
  return (
    <Switch>
      <Route
        component={CollectionEdit}
        path={Routes.editVocabularyCollection.path}
      />
      <Route
        path={Routes.vocabularyCollectionDetail.path}
        component={CollectionDetail}
      />
    </Switch>
  );
};

export default CollectionRoute;
