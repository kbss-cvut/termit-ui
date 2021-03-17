import * as React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {loadMyLastCommented} from "../../../action/AsyncCommentedAssetActions";
import RecentlyCommentedAsset from "../../../model/RecentlyCommentedAsset";
import CommonLastCommentedAssets from "./CommonLastCommentedAssets";

interface MyLastCommentedAssetsProps {
    loadCommentedAssets: () => Promise<RecentlyCommentedAsset[]>;
}

const MyLastCommentedAssets: React.FC<MyLastCommentedAssetsProps> = props =>
    <CommonLastCommentedAssets {...props} />

export default connect(undefined, (dispatch: ThunkDispatch) => ({
    loadCommentedAssets: () => dispatch(loadMyLastCommented())
}))(MyLastCommentedAssets);