import * as React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../../util/Types";
import {loadLastEditedAssets} from "../../../../action/AsyncActions";
import RecentlyModifiedAsset from "../../../../model/RecentlyModifiedAsset";
import CommonLastEditedAssets from "./CommonLastEditedAssets";

interface AllLastEditedAssetsProps {
    loadAssets: () => Promise<RecentlyModifiedAsset[]>;
}

export const AllLastEditedAssets: React.FC<AllLastEditedAssetsProps> = props =>
    <CommonLastEditedAssets {...props}/>

export default connect(undefined, (dispatch: ThunkDispatch) => ({
    loadAssets: () => dispatch(loadLastEditedAssets())
}))(AllLastEditedAssets)