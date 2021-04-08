// @id and @type are merged from ASSET_CONTEXT
import Asset, {ASSET_CONTEXT} from "./Asset";
import MultilingualString, {context, getLocalized} from "./MultilingualString";
import VocabularyUtils from "../util/VocabularyUtils";

const ctx = {
    iri: "@id",
    label: context(VocabularyUtils.SKOS_PREF_LABEL),
    description: context(VocabularyUtils.SKOS_SCOPE_NOTE)
};

export const CONTEXT = Object.assign({}, ctx, ASSET_CONTEXT);

export interface UserRoleData {
    iri: string;
    label: MultilingualString;
    description?: MultilingualString;
    types?: string[] | undefined;
}

export default class UserRole extends Asset implements UserRoleData {
    public label: MultilingualString;
    public description?: MultilingualString;

    constructor(data: UserRoleData) {
        super(data);
        this.label = data.label;
        this.description = data.description;
        Object.assign(this, data);
    }

    getLabel(lang?: string): string {
        return getLocalized(this.label, lang);
    }

    getDescription(lang?: string): string {
        return getLocalized(this.description, lang);
    }

    public toJsonLd(): {} {
        return Object.assign({}, this, {"@context": CONTEXT});
    }
}
