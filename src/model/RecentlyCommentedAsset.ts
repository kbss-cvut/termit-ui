import VocabularyUtils from "../util/VocabularyUtils";
import { ASSET_CONTEXT, HasTypes } from "./Asset";
import Comment, { CONTEXT as COMMENT_CONTEXT } from "./Comment";

const ctx = {
    modified: VocabularyUtils.DC_MODIFIED,
    editor: VocabularyUtils.PREFIX + "má-editora",
    vocabulary: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
    lastComment: VocabularyUtils.JE_TEMATEM,
    lastMyComment: VocabularyUtils.MA_MUJ_POSLEDNI_KOMENTAR,
};

export const CONTEXT = Object.assign(ctx, ASSET_CONTEXT, COMMENT_CONTEXT);

export interface RecentlyCommentedAssetData extends HasTypes {
    iri: string;
    type: string;
    lastComment: Comment;
    myLastComment?: Comment;
}

export default class RecentlyCommentedAsset
    implements RecentlyCommentedAssetData {
    public readonly iri: string;
    public readonly type: string;
    lastComment: Comment;
    myLastComment?: Comment;

    constructor(data: RecentlyCommentedAssetData) {
        this.iri = data.iri;
        this.lastComment = data.lastComment;
        this.myLastComment = data.myLastComment;
        this.type = data.type;
    }
}
