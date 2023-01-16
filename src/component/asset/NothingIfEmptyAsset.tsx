import React from "react";
import { AssetData } from "../../model/Asset";
import Constants from "../../util/Constants";

/**
 * Renders nothing ({@code null}) when the specified asset is empty (using the EMPTY_ASSET_IRI constant).
 *
 * Once the asset is non-empty, the specified children are rendered.
 *
 * This should prevent attempts at loading asset-related data when the asset is not loaded yet and the empty asset
 * is used in its place.
 * @param asset Asset to check
 * @param children Children to render
 * @constructor
 */
const NothingIfEmptyAsset: React.FC<{ asset: AssetData }> = ({
  asset,
  children,
}) => {
  return asset.iri === Constants.EMPTY_ASSET_IRI ? null : <>{children}</>;
};

export default NothingIfEmptyAsset;
