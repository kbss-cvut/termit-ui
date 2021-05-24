import VocabularyUtils from "../util/VocabularyUtils";
import { ASSET_CONTEXT, AssetData, SupportsJsonLd } from "./Asset";
import User, { CONTEXT as USER_CONTEXT, UserData } from "./User";
import Utils from "../util/Utils";

const ctx = {
    content: VocabularyUtils.NS_SIOC + "ns#content",
    author: VocabularyUtils.NS_SIOC + "ns#has_creator",
    asset: VocabularyUtils.NS_SIOC + "ns#topic",
    created: VocabularyUtils.CREATED,
    modified: VocabularyUtils.LAST_MODIFIED,
    reactions: VocabularyUtils.NS_TERMIT + "má-reakci",
    actor: VocabularyUtils.NS_ACTIVITY_STREAMS + "actor",
    object: VocabularyUtils.NS_ACTIVITY_STREAMS + "object",
};

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT, USER_CONTEXT);

export interface CommentReaction {
    iri: string;
    actor: AssetData;
    object: AssetData;
    types: string[];
}

export const ReactionType = {
    LIKE: VocabularyUtils.NS_ACTIVITY_STREAMS + "Like",
    DISLIKE: VocabularyUtils.NS_ACTIVITY_STREAMS + "Dislike",
};

export interface CommentData {
    iri?: string;
    content: string;
    author?: UserData;
    asset?: AssetData; // Asset IRI
    created?: number;
    modified?: number;
    reactions?: CommentReaction[];
}

export default class Comment
    implements CommentData, SupportsJsonLd<CommentData>
{
    public iri?: string;
    public content: string;
    public author?: User;
    public asset?: AssetData;
    public created?: number;
    public modified?: number;
    public reactions?: CommentReaction[];

    public constructor(data: CommentData) {
        Object.assign(this, data);
        if (data.author) {
            this.author = new User(data.author);
        }
        this.content = data.content;
    }

    toJsonLd(): CommentData {
        const result = Object.assign(
            { types: [VocabularyUtils.COMMENT] },
            this,
            { "@context": CONTEXT }
        );
        if (result.reactions) {
            Utils.sanitizeArray(result.reactions).forEach(
                (r) => (r.object = { iri: this.iri })
            );
        }
        return result;
    }
}
