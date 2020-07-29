import TermAssignment, {
    BASE_CONTEXT as BASE_ASSIGNMENT_CONTEXT,
    CONTEXT as ASSIGNMENT_CONTEXT,
    Target,
    TermAssignmentData
} from "./TermAssignment";
import Utils from "../util/Utils";
import VocabularyUtils from "../util/VocabularyUtils";

const ctx = {
    "selectors": VocabularyUtils.NS_TERMIT + "má-selektor"
};

const textQuoteSelectorCtx = {
    "exactMatch": VocabularyUtils.NS_TERMIT + "má-přesný-text-quote",
    "prefix": VocabularyUtils.NS_TERMIT + "má-prefix-text-quote",
    "suffix": VocabularyUtils.NS_TERMIT + "má-suffix-text-quote"
};

/**
 * Context of the assignment itself, without term or resource context.
 */
export const BASE_CONTEXT = Object.assign({}, BASE_ASSIGNMENT_CONTEXT, ctx, textQuoteSelectorCtx);

export const CONTEXT = Object.assign({}, ASSIGNMENT_CONTEXT, ctx, textQuoteSelectorCtx);

export interface Selector {
    iri?: string;
    types: string[];
}

export interface TextQuoteSelector extends Selector {
    exactMatch: string;
    prefix?: string;
    suffix?: string;
}

export interface OccurrenceTarget extends Target {
    selectors: TextQuoteSelector[] | TextQuoteSelector;
}

export interface TermOccurrenceData extends TermAssignmentData {
    target: OccurrenceTarget;
}

export default class TermOccurrence extends TermAssignment {
    public target: OccurrenceTarget;

    constructor(data: TermOccurrenceData) {
        super(data);
        this.target = data.target;
        this.target.selectors = Utils.sanitizeArray(this.target.selectors);
    }

    public isSuggested(): boolean {
        return Utils.sanitizeArray(this.types).indexOf(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE) !== -1;
    }

    public toJsonLd(): TermOccurrenceData {
        return Object.assign({}, this, {"@context": CONTEXT});
    }
}

