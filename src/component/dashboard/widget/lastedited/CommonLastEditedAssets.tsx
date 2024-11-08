import React, { useState } from "react";
import RecentlyModifiedAsset from "../../../../model/RecentlyModifiedAsset";
import AssetList from "./AssetList";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../../util/Types";
import PromiseTrackingMask from "../../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import Constants from "../../../../util/Constants";
import SimplePagination from "../lastcommented/SimplePagination";

export interface CommonLastEditedAssetsProps {
  loadAssets: (
    pageNo: number,
    pageSize: number
  ) => (dispatch: ThunkDispatch) => Promise<RecentlyModifiedAsset[] | never[]>;
}

const CommonLastEditedAssets: React.FC<CommonLastEditedAssetsProps> = (
  props
) => {
  const { loadAssets } = props;
  const [page, setPage] = useState(0);
  const [lastEditedAssets, setLastEditedAssets] = React.useState<
    RecentlyModifiedAsset[] | null
  >(null);
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    trackPromise(
      dispatch(loadAssets(page, Constants.LAST_COMMENTED_ASSET_LIMIT)),
      "last-edited-assets"
    ).then((data) => setLastEditedAssets(data));
  }, [loadAssets, setLastEditedAssets, dispatch, page]);

  return (
    <>
      <PromiseTrackingMask area="last-edited-assets" />
      <AssetList assets={lastEditedAssets} />
      {lastEditedAssets !== null && (
        <SimplePagination
          page={page}
          setPage={setPage}
          pageSize={Constants.LAST_COMMENTED_ASSET_LIMIT}
          itemCount={lastEditedAssets?.length}
        />
      )}
    </>
  );
};

export default CommonLastEditedAssets;
