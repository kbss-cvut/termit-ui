import * as React from "react";
import CommentedAssetList from "./CommentedAssetList";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";
import PromiseTrackingMask from "../../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import { ThunkDispatch } from "../../../../util/Types";
import { useDispatch } from "react-redux";

export interface CommonLastCommentedAssetsProps {
  loadAssets: () => (
    dispatch: ThunkDispatch
  ) => Promise<RecentlyCommentedAsset[] | never[]>;
}

const CommonLastCommentedAssets: React.FC<CommonLastCommentedAssetsProps> = (
  props
) => {
  const { loadAssets } = props;
  const [lastCommentedAssets, setLastCommentedAssets] =
    React.useState<RecentlyCommentedAsset[] | null>(null);
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    trackPromise(dispatch(loadAssets()), "last-commented-assets").then((data) =>
      setLastCommentedAssets(data)
    );
  }, [loadAssets, setLastCommentedAssets]);

  return (
    <>
      <PromiseTrackingMask area="last-commented-assets" />
      <CommentedAssetList assets={lastCommentedAssets} />
    </>
  );
};

export default CommonLastCommentedAssets;
