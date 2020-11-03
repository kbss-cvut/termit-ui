import VocabularyUtils from "../util/VocabularyUtils";
import Asset, {ASSET_CONTEXT, AssetData} from "./Asset";

const ctx = {
    label: VocabularyUtils.DC_TITLE,
    description: VocabularyUtils.DC_DESCRIPTION
}

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT);

export interface WorkspaceData extends AssetData {
    label: string;
    description?: string;
}

export default class Workspace extends Asset implements WorkspaceData {
    public label: string;
    public description?: string;


    constructor(data: WorkspaceData) {
        super(data);
        this.label = data.label;
        this.description = data.description;
    }

    getLabel(lang?: string): string {
        return this.label;
    }

    public toJsonLd(): {} {
        return Object.assign({}, this, {"@context": CONTEXT});
    }
}
