import * as React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../../../util/Types";
import { loadLastCommentedAssets } from "../../../../action/AsyncCommentedAssetActions";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";
import CommonLastCommentedAssets from "./CommonLastCommentedAssets";

interface AllLastCommentedAssetsProps {
  loadAssets: () => Promise<RecentlyCommentedAsset[]>;
}

const AllLastCommentedAssets: React.FC<AllLastCommentedAssetsProps> = (
  props
) => <CommonLastCommentedAssets {...props} />;

export default connect(undefined, (dispatch: ThunkDispatch) => ({
  loadAssets: () => dispatch(loadLastCommentedAssets()),
}))(AllLastCommentedAssets);
