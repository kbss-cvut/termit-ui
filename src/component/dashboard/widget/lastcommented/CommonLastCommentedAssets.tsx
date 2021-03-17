import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../../hoc/withI18n";
import withInjectableLoading, {InjectsLoading} from "../../../hoc/withInjectableLoading";
import CommentedAssetList from "./CommentedAssetList";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";

export interface CommonLastCommentedAssetsProps extends HasI18n, InjectsLoading {
    loadAssets: () => Promise<RecentlyCommentedAsset[]>;
    locale: string;
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
            <CommentedAssetList commentedAssets={lastCommentedAssets} loading={loading}/>
        </>;
}

export default injectIntl(withI18n(withInjectableLoading(CommonLastCommentedAssets)));