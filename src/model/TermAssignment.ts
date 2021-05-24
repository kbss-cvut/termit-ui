import { TermData } from "./Term";
import { CONTEXT as RESOURCE_CONTEXT } from "./Resource";
import { AssetData, SupportsJsonLd } from "./Asset";
import VocabularyUtils from "../util/VocabularyUtils";
import Utils from "../util/Utils";

const ctx = {
    term: VocabularyUtils.NS_TERMIT + "je-přiřazením-termu",
    description: VocabularyUtils.DC_DESCRIPTION,
    target: VocabularyUtils.NS_TERMIT + "má-cíl",
    source: VocabularyUtils.PREFIX + "má-zdroj",
};

/**
 * Context of the assignment itself, without term or resource context.
 */
export const BASE_CONTEXT = Object.assign({}, ctx);

export const CONTEXT = Object.assign({}, ctx, RESOURCE_CONTEXT);

export interface Target {
    source: AssetData;
    types: string[];
}

export interface TermAssignmentData {
    iri?: string;
    term: TermData;
    target: Target;
    description?: string;
    types: string[];
}

export default class TermAssignment
    implements TermAssignmentData, SupportsJsonLd<TermAssignmentData>
{
    public iri?: string;
    public term: TermData;
    public target: Target;
    public description?: string;
    public types: string[];

    constructor(data: TermAssignmentData) {
        this.iri = data.iri;
        this.term = data.term;
        this.target = data.target;
        this.description = data.description;
        this.types = Utils.sanitizeArray(data.types);
    }

    public isSuggested() {
        return false;
    }

    public toJsonLd(): TermAssignmentData {
        return Object.assign({}, this, { "@context": CONTEXT });
    }
}
