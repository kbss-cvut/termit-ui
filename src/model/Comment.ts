import VocabularyUtils from "../util/VocabularyUtils";
import {ASSET_CONTEXT, AssetData, SupportsJsonLd} from "./Asset";
import User, {CONTEXT as USER_CONTEXT, UserData} from "./User";

const ctx = {
    content: "http://rdfs.org/sioc/ns#content",
    author: "http://rdfs.org/sioc/ns#has_creator",
    asset: "http://rdfs.org/sioc/ns#topic",
    created: VocabularyUtils.CREATED,
    modified: VocabularyUtils.LAST_MODIFIED,
    reactions: VocabularyUtils.NS_TERMIT + "má-reakci",
    actor: "https://www.w3.org/ns/activitystreams#actor",
    object: "https://www.w3.org/ns/activitystreams#object"
}

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT, USER_CONTEXT);

const TYPE = "http://rdfs.org/sioc/types#Comment";

export interface CommentReaction {
    iri: string;
    actor: AssetData;
    object: AssetData;
    types: string[];
}

export interface CommentData {
    iri?: string;
    content: string;
    author?: UserData;
    asset?: string;  // Asset IRI
    created?: number;
    modified?: number;
    reactions?: CommentReaction[];
}

export default class Comment implements CommentData, SupportsJsonLd<CommentData> {
    public iri?: string;
    public content: string;
    public author?: User;
    public asset?: string;
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
        return Object.assign({types: [TYPE]}, this, {"@context": CONTEXT});
    }
}
