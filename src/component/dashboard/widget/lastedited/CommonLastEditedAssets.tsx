import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../../hoc/withI18n";
import withInjectableLoading, {InjectsLoading} from "../../../hoc/withInjectableLoading";
import RecentlyModifiedAsset from "../../../../model/RecentlyModifiedAsset";
import AssetList from "./AssetList";

export interface CommonLastEditedAssetsProps extends HasI18n, InjectsLoading {
    loadAssets: () => Promise<RecentlyModifiedAsset[]>;
    locale: string;
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

    return <>
        {renderMask()}
        <AssetList assets={lastEditedAssets} loading={loading}/>
    </>;
}

export default injectIntl(withI18n(withInjectableLoading(CommonLastEditedAssets)));