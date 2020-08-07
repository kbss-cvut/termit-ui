import VocabularyUtils from "../util/VocabularyUtils";
import {ASSET_CONTEXT} from "./Asset";
import {UserData} from "./User";

const ctx = {
    content: "http://rdfs.org/sioc/ns#content",
    author: "http://rdfs.org/sioc/ns#has_creator",
    asset: "http://rdfs.org/sioc/ns#topic",
    created: VocabularyUtils.CREATED,
    modified: VocabularyUtils.LAST_MODIFIED
}

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT);

export interface CommentData {
    iri?: string;
    content: string;
    author?: UserData;
    asset?: string;  // Asset IRI
    created?: number;
    modified?: number;
}

export default class Comment implements CommentData {
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
}
