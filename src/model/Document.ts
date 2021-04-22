import OntologicalVocabulary from "../util/VocabularyUtils";
import VocabularyUtils from "../util/VocabularyUtils";
import File, { OWN_CONTEXT as FILE_CONTEXT, FileData } from "./File";
import Resource, {
    CONTEXT as RESOURCE_CONTEXT,
    ResourceData,
} from "./Resource";
import Utils from "../util/Utils";
import { AssetData } from "./Asset";

const ctx = {
    files: {
        "@id": VocabularyUtils.HAS_FILE,
        "@container": "@set",
    },
    vocabulary: VocabularyUtils.HAS_DOCUMENT_VOCABULARY,
};

export const CONTEXT = Object.assign({}, RESOURCE_CONTEXT, ctx, FILE_CONTEXT);

export interface DocumentData extends ResourceData {
    files: FileData[];
    vocabulary?: AssetData;
}

export default class Document extends Resource implements DocumentData {
    public files: File[];
    public vocabulary?: AssetData;

    constructor(data: DocumentData) {
        super(data);
        this.vocabulary = data.vocabulary;
        this.files = Utils.sanitizeArray(data.files).map((fd) => new File(fd));
    }

    public clone() {
        return new Document(this);
    }

    public toJsonLd(): DocumentData {
        const result: any = Object.assign({}, this, {
            "@context": CONTEXT,
            types: [
                OntologicalVocabulary.RESOURCE,
                OntologicalVocabulary.DOCUMENT,
            ],
        });
        // Break reference cycles by replacing them with ID-references only
        result.files = Document.replaceCircularReferencesToOwnerWithOwnerId(
            result.files
        );
        result.vocabulary = this.vocabulary ? this.vocabulary.iri : undefined;
        return result;
    }

    public static replaceCircularReferencesToOwnerWithOwnerId(
        files: File[]
    ): FileData[] {
        return files.map((f) =>
            Object.assign({}, f, {
                owner: f.owner ? { iri: f.owner.iri } : undefined,
            })
        );
    }
}
