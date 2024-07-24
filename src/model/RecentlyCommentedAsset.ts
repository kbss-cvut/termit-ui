import VocabularyUtils from "../util/VocabularyUtils";
import { ASSET_CONTEXT, HasIdentifier, HasTypes } from "./Asset";
import Comment, { CONTEXT as COMMENT_CONTEXT } from "./Comment";
import Utils from "../util/Utils";

const ctx = {
  modified: {
    "@id": VocabularyUtils.DC_MODIFIED,
    "@type": VocabularyUtils.XSD_DATETIME,
  },
  label: VocabularyUtils.RDFS_LABEL,
  editor: VocabularyUtils.PREFIX + "má-editora",
  vocabulary: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
  lastComment: VocabularyUtils.JE_TEMATEM,
  myLastComment: VocabularyUtils.MA_MUJ_POSLEDNI_KOMENTAR,
};

export const CONTEXT = Object.assign(ctx, ASSET_CONTEXT, COMMENT_CONTEXT);

export interface RecentlyCommentedAssetData extends HasTypes {
  iri: string;
  label: string;
  vocabulary: HasIdentifier;
  types: string[];
  lastComment: Comment;
  myLastComment?: Comment;
}

export default class RecentlyCommentedAsset
  implements RecentlyCommentedAssetData
{
  public readonly iri: string;
  public readonly label: string;
  public readonly vocabulary: HasIdentifier;
  public readonly types: string[];
  lastComment: Comment;
  myLastComment?: Comment;

  constructor(data: RecentlyCommentedAssetData) {
    this.iri = data.iri;
    this.label = data.label;
    this.vocabulary = data.vocabulary;
    this.lastComment = data.lastComment;
    this.myLastComment = data.myLastComment;
    this.types = Utils.sanitizeArray(data.types);
  }
}
