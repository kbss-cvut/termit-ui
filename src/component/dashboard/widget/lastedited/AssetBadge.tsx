import * as React from "react";
import TermBadge from "../../../badge/TermBadge";
import VocabularyBadge from "../../../badge/VocabularyBadge";
import ResourceBadge from "../../../badge/ResourceBadge";
import RecentlyModifiedAsset from "../../../../model/RecentlyModifiedAsset";
import Utils from "../../../../util/Utils";
import VocabularyUtils from "../../../../util/VocabularyUtils";

export const AssetBadge: React.FC<{ asset: RecentlyModifiedAsset }> = ({asset}) => {
    const type = Utils.getPrimaryAssetType(asset);
    if (type === VocabularyUtils.TERM) {
        return <TermBadge/>;
    } else if (type === VocabularyUtils.VOCABULARY) {
        return <VocabularyBadge/>;
    } else {
        return <ResourceBadge resource={asset}/>;
    }
}
