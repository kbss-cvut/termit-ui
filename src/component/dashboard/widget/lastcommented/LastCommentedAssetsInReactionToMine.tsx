import * as React from "react";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../../../util/Types";
import { loadLastCommentedInReactionToMine } from "../../../../action/AsyncCommentedAssetActions";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";
import CommonLastCommentedAssets from "./CommonLastCommentedAssets";

interface MyLastCommentedAssetsProps {
  loadAssets: () => Promise<RecentlyCommentedAsset[]>;
}

const LastCommentedAssetsInReactionToMine: React.FC<MyLastCommentedAssetsProps> =
  (props) => <CommonLastCommentedAssets {...props} />;

export default connect(undefined, (dispatch: ThunkDispatch) => ({
  loadAssets: () => dispatch(loadLastCommentedInReactionToMine()),
}))(LastCommentedAssetsInReactionToMine);
