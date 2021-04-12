import Asset, { ASSET_CONTEXT, AssetData } from "./Asset";
import Term from "./Term";
import Utils from "../util/Utils";
import VocabularyUtils from "../util/VocabularyUtils";
import Constants from "../util/Constants";

const ctx = {
    label: VocabularyUtils.DC_TITLE,
    description: VocabularyUtils.DC_DESCRIPTION,
};

export const CONTEXT = Object.assign(ctx, ASSET_CONTEXT);

export interface ResourceData extends AssetData {
    iri: string;
    label: string;
    description?: string;
    terms?: Term[];
}

export default class Resource extends Asset implements ResourceData {
    public label: string;
    public description?: string;
    public terms: Term[];

    constructor(data: ResourceData) {
        super(data);
        this.label = data.label;
        this.terms = [];
        Object.assign(this, data);
        this.types = Utils.sanitizeArray(data.types);
        if (this.types.indexOf(VocabularyUtils.RESOURCE) === -1) {
            this.types.push(VocabularyUtils.RESOURCE);
        }
    }

    public clone() {
        return new Resource(this);
    }

    getLabel(): string {
        return this.label;
    }

    public toJsonLd(): {} {
        return Object.assign({}, this, { "@context": CONTEXT });
    }
}

export const EMPTY_RESOURCE = new Resource({
    iri: Constants.EMPTY_ASSET_IRI,
    label: "",
    terms: [],
});
