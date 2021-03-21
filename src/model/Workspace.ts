import VocabularyUtils from "../util/VocabularyUtils";
import Asset, {ASSET_CONTEXT, AssetData} from "./Asset";
import Utils from "../util/Utils";

const ctx = {
    label: VocabularyUtils.DC_TITLE,
    description: VocabularyUtils.DC_DESCRIPTION,
    vocabularies: "https://slovn\u00edk.gov.cz/datov\u00fd/pracovn\u00ed-prostor/pojem/obsahuje-slovn\u00edk"
}

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT);

export interface WorkspaceData extends AssetData {
    label: string;
    description?: string;
    vocabularies: AssetData[];
}

export default class Workspace extends Asset implements WorkspaceData {
    public readonly label: string;
    public readonly description?: string;
    public readonly vocabularies: AssetData[];

    constructor(data: WorkspaceData) {
        super(data);
        this.label = data.label;
        this.description = data.description;
        this.vocabularies = Utils.sanitizeArray(data.vocabularies);
    }

    getLabel(lang?: string): string {
        return this.label;
    }

    public containsVocabulary(vocabularyIri?: string) {
        return vocabularyIri && this.vocabularies.find(v => v.iri === vocabularyIri);
    }

    public toJsonLd(): {} {
        return Object.assign({}, this, {"@context": CONTEXT});
    }
}

export const EMPTY_WORKSPACE = new Workspace({
    iri: "http://empty",
    label: "",
    vocabularies: []
});
