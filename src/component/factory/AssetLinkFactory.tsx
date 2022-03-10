import Asset from "../../model/Asset";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermLink from "../term/TermLink";
import Term from "../../model/Term";
import { Label } from "reactstrap";
import VocabularyLink from "../vocabulary/VocabularyLink";
import Vocabulary from "../../model/Vocabulary";

export default class AssetLinkFactory {
  public static createAssetLink(asset: Asset): JSX.Element {
    switch (Utils.getPrimaryAssetType(asset)) {
      case VocabularyUtils.TERM:
        return <TermLink term={asset as Term} />;
      case VocabularyUtils.VOCABULARY:
        return <VocabularyLink vocabulary={asset as Vocabulary} />;
      default:
        return <Label>{asset.getLabel()}</Label>;
    }
  }
}
