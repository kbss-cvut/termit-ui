import React from "react";
import Asset from "../../model/Asset";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermLink from "../term/TermLink";
import Term from "../../model/Term";
import { Label } from "reactstrap";
import VocabularyLink from "../vocabulary/VocabularyLink";
import Vocabulary from "../../model/Vocabulary";
import Document from "../../model/Document";
import DocumentLink from "../resource/document/DocumentLink";

export default class AssetLinkFactory {
  public static createAssetLink(asset: Asset): React.ReactNode {
    switch (Utils.getPrimaryAssetType(asset)) {
      case VocabularyUtils.TERM:
        return <TermLink term={asset as Term} />;
      case VocabularyUtils.VOCABULARY:
        return <VocabularyLink vocabulary={asset as Vocabulary} />;
      case VocabularyUtils.DOCUMENT:
        return <DocumentLink document={asset as Document} />;
      default:
        return <Label>{asset.getLabel()}</Label>;
    }
  }
}
