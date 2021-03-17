import * as React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {loadLastCommentedAssets} from "../../../action/AsyncCommentedAssetActions";
import RecentlyCommentedAsset from "../../../model/RecentlyCommentedAsset";
import CommonLastCommentedAssets from "./CommonLastCommentedAssets";

interface AllLastCommentedAssetsProps {
    loadCommentedAssets: () => Promise<RecentlyCommentedAsset[]>;
}

const AllLastCommentedAssets: React.FC<AllLastCommentedAssetsProps> = props =>
    <CommonLastCommentedAssets {...props}/>

export default connect(undefined, (dispatch: ThunkDispatch) => ({
    loadCommentedAssets: () => dispatch(loadLastCommentedAssets())
}))(AllLastCommentedAssets);