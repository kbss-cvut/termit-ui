import VocabularyUtils from "../util/VocabularyUtils";
import Asset, {ASSET_CONTEXT, AssetData} from "./Asset";

const ctx = {
    label: VocabularyUtils.DC_TITLE,
    description: VocabularyUtils.DC_DESCRIPTION
}

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT);

export interface WorkspaceData extends AssetData {
    description?: string;
}

export default class Workspace extends Asset implements WorkspaceData {
    public description?: string;


    constructor(data: WorkspaceData) {
        super();
        Object.assign(this, data);
    }

    public toJsonLd(): {} {
        return Object.assign({}, this, {"@context": CONTEXT});
    }
}
