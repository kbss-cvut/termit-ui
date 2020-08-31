import {ASSET_CONTEXT} from "./Asset";
import VocabularyUtils from "../util/VocabularyUtils";
import {BASE_CONTEXT as BASE_OCCURRENCE_CONTEXT} from "./TermOccurrence";

const ctx = {
    label: VocabularyUtils.SKOS_PREF_LABEL,
    altLabels: VocabularyUtils.SKOS_ALT_LABEL,
    hiddenLabels: VocabularyUtils.SKOS_HIDDEN_LABEL,
    definition: VocabularyUtils.DEFINITION,
    comment: VocabularyUtils.SKOS_SCOPE_NOTE,
    parentTerms: VocabularyUtils.BROADER,
    subTerms: VocabularyUtils.NARROWER,
    sources: VocabularyUtils.DC_SOURCE,
    vocabulary: VocabularyUtils.IS_TERM_FROM_VOCABULARY,
    definitionSource: VocabularyUtils.HAS_DEFINITION_SOURCE,
    draft: VocabularyUtils.IS_DRAFT,
    glossary: VocabularyUtils.SKOS_IN_SCHEME,
    types: "@type"
};

export const CONTEXT = Object.assign(ctx, ASSET_CONTEXT, BASE_OCCURRENCE_CONTEXT);

export default class ValidationResult {
    public termIri: string;
    public severityKey: string;
    public message: string;

    constructor(termIri : string, severityKey: string, message: string) {
        this.termIri = termIri;
        this.severityKey = severityKey;
        this.message = message;
    }
}
