import VocabularyUtils from "../util/VocabularyUtils";
import {ASSET_CONTEXT, SupportsJsonLd} from "./Asset";
import User, {CONTEXT as USER_CONTEXT, UserData} from "./User";

const ctx = {
    content: "http://rdfs.org/sioc/ns#content",
    author: "http://rdfs.org/sioc/ns#has_creator",
    asset: "http://rdfs.org/sioc/ns#topic",
    created: VocabularyUtils.CREATED,
    modified: VocabularyUtils.LAST_MODIFIED,
    likes: VocabularyUtils.NS_TERMIT + "je-oblíben",
    dislikes: VocabularyUtils.NS_TERMIT + "je-neoblíben"
}

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT, USER_CONTEXT);

const TYPE = "http://rdfs.org/sioc/types#Comment";

export interface CommentReaction {
    iri: string;
    author: string;
    object: string;
}

export interface CommentData {
    iri?: string;
    content: string;
    author?: UserData;
    asset?: string;  // Asset IRI
    created?: number;
    modified?: number;
    likes?: CommentReaction[];
    dislikes?: CommentReaction[];
}

export default class Comment implements CommentData, SupportsJsonLd<CommentData> {
    public iri?: string;
    public content: string;
    public author?: User;
    public asset?: string;
    public created?: number;
    public modified?: number;
    public likes?: CommentReaction[];
    public dislikes?: CommentReaction[];

    public constructor(data: CommentData) {
        Object.assign(this, data);
        if (data.author) {
            this.author = new User(data.author);
        }
        this.content = data.content;
    }

    toJsonLd(): CommentData {
        return Object.assign({types: [TYPE]}, this, {"@context": CONTEXT});
    }
}
