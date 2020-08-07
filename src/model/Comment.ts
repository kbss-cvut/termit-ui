import VocabularyUtils from "../util/VocabularyUtils";
import {ASSET_CONTEXT, SupportsJsonLd} from "./Asset";
import {CONTEXT as USER_CONTEXT, UserData} from "./User";

const ctx = {
    content: "http://rdfs.org/sioc/ns#content",
    author: "http://rdfs.org/sioc/ns#has_creator",
    asset: "http://rdfs.org/sioc/ns#topic",
    created: VocabularyUtils.CREATED,
    modified: VocabularyUtils.LAST_MODIFIED
}

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT, USER_CONTEXT);

export interface CommentData {
    iri?: string;
    content: string;
    author?: UserData;
    asset?: string;  // Asset IRI
    created?: number;
    modified?: number;
}

export default class Comment implements CommentData, SupportsJsonLd<CommentData> {
    public iri?: string;
    public content: string;
    public author?: UserData;
    public asset?: string;
    public created?: number;
    public modified?: number;

    public constructor(data: CommentData) {
        Object.assign(this, data);
        this.content = data.content;
    }

    toJsonLd(): CommentData {
        return Object.assign({}, this, {"@context": CONTEXT});
    }
}
