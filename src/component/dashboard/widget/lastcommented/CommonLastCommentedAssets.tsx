import * as React from "react";
import withInjectableLoading, {InjectsLoading} from "../../../hoc/withInjectableLoading";
import CommentedAssetList from "./CommentedAssetList";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";

export interface CommonLastCommentedAssetsProps extends InjectsLoading {
    loadAssets: () => Promise<RecentlyCommentedAsset[]>;
}

const CommonLastCommentedAssets: React.FC<CommonLastCommentedAssetsProps> = props => {
    const {loadAssets, loading, loadingOn, loadingOff, renderMask} = props;
    const [lastCommentedAssets, setLastCommentedAssets] = React.useState<RecentlyCommentedAsset[]>([]);
    React.useEffect(() => {
        loadingOn();
        loadAssets()
            .then(data => setLastCommentedAssets(data))
            .then(() => loadingOff());
    }, [loadAssets, setLastCommentedAssets, loadingOn, loadingOff]);

    return <>
        {renderMask()}
        <CommentedAssetList assets={lastCommentedAssets} loading={loading}/>
    </>;
}

export default withInjectableLoading(CommonLastCommentedAssets);