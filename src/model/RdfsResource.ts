import {AssetData} from "./Asset";
import Utils from "../util/Utils";
import VocabularyUtils from "../util/VocabularyUtils";

export const CONTEXT = {
    iri: "@id",
    label: VocabularyUtils.RDFS_LABEL,
    comment: VocabularyUtils.RDFS_COMMENT,
    types: "@type"
};

export interface RdfsResourceData extends AssetData {
    iri: string;
    label?: string;
    comment?: string;
    types?: string[];
}

/**
 * Represents a generic RDFS resource.
 */
export default class RdfsResource implements RdfsResourceData {
    public readonly iri: string;
    public readonly label?: string;
    public readonly comment?: string;
    public readonly types: string[];

    constructor(data: RdfsResourceData) {
        this.iri = data.iri;
        this.label = data.label;
        this.comment = data.comment;
        this.types = Utils.sanitizeArray(data.types);
        if (this.types.indexOf(VocabularyUtils.RDFS_RESOURCE) === -1) {
            this.types.push(VocabularyUtils.RDFS_RESOURCE);
        }
    }

    public toJsonLd() {
        return Object.assign({}, this, {"@context": CONTEXT});
    }
}
