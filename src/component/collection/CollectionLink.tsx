import { FunctionComponent } from "react";
import { SkosCollectionData } from "../../model/Collection";
import { getLocalized } from "../../model/MultilingualString";
import Routes from "../../util/Routes";
import Routing from "../../util/Routing";
import AssetLink from "../misc/AssetLink";

export const CollectionLink: FunctionComponent<{
  collection: SkosCollectionData;
  shortLocale: string;
}> = ({ collection, shortLocale }) => {
  const label = getLocalized(collection.title, shortLocale);
  const path = Routing.getTransitionPath(
    Routes.vocabularyCollectionDetail,
    Routing.makeCollectionDetailParams(collection)
  );

  const asset = Object.assign({}, collection, { label });

  return <AssetLink {...{ asset, path }} />;
};
