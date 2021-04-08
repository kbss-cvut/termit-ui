import * as React from "react";
import { connect } from "react-redux";
import CommonLastCommentedAssets from "./CommonLastCommentedAssets";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";
import { loadMyLastCommented } from "../../../../action/AsyncCommentedAssetActions";
import { ThunkDispatch } from "../../../../util/Types";

interface MyLastCommentedAssetsProps {
  loadAssets: () => Promise<RecentlyCommentedAsset[]>;
}

const MyLastCommentedAssets: React.FC<MyLastCommentedAssetsProps> = (props) => (
  <CommonLastCommentedAssets {...props} />
);

export default connect(undefined, (dispatch: ThunkDispatch) => ({
  loadAssets: () => dispatch(loadMyLastCommented()),
}))(MyLastCommentedAssets);
