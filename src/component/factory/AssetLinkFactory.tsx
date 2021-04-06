import Asset from "../../model/Asset";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermLink from "../term/TermLink";
import Term from "../../model/Term";
import {Label} from "reactstrap";
import VocabularyLink from "../vocabulary/VocabularyLink";
import Vocabulary from "../../model/Vocabulary";
import ResourceLink from "../resource/ResourceLink";
import Resource from "../../model/Resource";

export default class AssetLinkFactory {

    public static createAssetLink(asset: Asset): JSX.Element {
        switch (Utils.getPrimaryAssetType(asset)) {
            case VocabularyUtils.TERM:
                return <TermLink term={asset as Term}/>;
            case VocabularyUtils.VOCABULARY:
                return <VocabularyLink vocabulary={asset as Vocabulary}/>;
            case VocabularyUtils.DOCUMENT:
            case VocabularyUtils.FILE:      // Intentional fall-through
            case VocabularyUtils.RESOURCE:  // Intentional fall-through
                return <ResourceLink resource={asset as Resource}/>;
            default:
                return <Label>{asset.getLabel()}</Label>;
        }
    }
}
