import * as React from "react";
import {connect} from "react-redux";
import CommonLastCommentedAssets from "./CommonLastCommentedAssets";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";
import {ThunkDispatch} from "../../../../util/Types";
import {loadLastCommentedByMe} from "../../../../action/AsyncCommentedAssetActions";

interface LastCommentedAssetsByMeProps {
    loadAssets: () => Promise<RecentlyCommentedAsset[]>;
}

const LastCommentedAssetsByMe: React.FC<LastCommentedAssetsByMeProps> = props => (
    <CommonLastCommentedAssets {...props} />
);

export default connect(undefined, (dispatch: ThunkDispatch) => ({
    loadAssets: () => dispatch(loadLastCommentedByMe())
}))(LastCommentedAssetsByMe);
