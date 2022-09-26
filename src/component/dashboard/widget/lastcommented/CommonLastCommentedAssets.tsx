import * as React from "react";
import { useState } from "react";
import CommentedAssetList from "./CommentedAssetList";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";
import PromiseTrackingMask from "../../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import { ThunkDispatch } from "../../../../util/Types";
import { useDispatch } from "react-redux";
import Constants from "../../../../util/Constants";
import SimplePagination from "./SimplePagination";

export interface CommonLastCommentedAssetsProps {
  loadAssets: (
    pageNo: number,
    pageSize: number
  ) => (dispatch: ThunkDispatch) => Promise<RecentlyCommentedAsset[] | never[]>;
}

const CommonLastCommentedAssets: React.FC<CommonLastCommentedAssetsProps> = (
  props
) => {
  const { loadAssets } = props;
  const [page, setPage] = useState(0);
  const [lastCommentedAssets, setLastCommentedAssets] =
    React.useState<RecentlyCommentedAsset[] | null>(null);
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    trackPromise(
      dispatch(loadAssets(page, Constants.LAST_COMMENTED_ASSET_LIMIT)),
      "last-commented-assets"
    ).then((data) => setLastCommentedAssets(data));
  }, [loadAssets, setLastCommentedAssets, dispatch, page]);

  return (
    <>
      <PromiseTrackingMask area="last-commented-assets" />
      <CommentedAssetList assets={lastCommentedAssets} />
      {lastCommentedAssets !== null && (
        <SimplePagination
          page={page}
          setPage={setPage}
          pageSize={Constants.LAST_COMMENTED_ASSET_LIMIT}
          itemCount={lastCommentedAssets?.length}
        />
      )}
    </>
  );
};

export default CommonLastCommentedAssets;
