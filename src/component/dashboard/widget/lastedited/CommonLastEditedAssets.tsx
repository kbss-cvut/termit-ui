import * as React from "react";
import withInjectableLoading, {InjectsLoading} from "../../../hoc/withInjectableLoading";
import RecentlyModifiedAsset from "../../../../model/RecentlyModifiedAsset";
import AssetList from "./AssetList";

export interface CommonLastEditedAssetsProps extends InjectsLoading {
    loadAssets: () => Promise<RecentlyModifiedAsset[]>;
}

const CommonLastEditedAssets: React.FC<CommonLastEditedAssetsProps> = props => {
    const {loadAssets, loading, loadingOn, loadingOff, renderMask} = props;
    const [lastEditedAssets, setLastEditedAssets] = React.useState<RecentlyModifiedAsset[]>([]);
    React.useEffect(() => {
        loadingOn();
        loadAssets()
            .then(data => setLastEditedAssets(data))
            .then(() => loadingOff());
    }, [loadAssets, setLastEditedAssets, loadingOn, loadingOff]);

    return (
        <>
            {renderMask()}
            <AssetList assets={lastEditedAssets} loading={loading} />
        </>
    );
};

export default withInjectableLoading(CommonLastEditedAssets);
