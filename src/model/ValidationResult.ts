import VocabularyUtils from "../util/VocabularyUtils";
import {TermData} from "./Term";
import {CONTEXT as TERM_CONTEXT} from "./Term";
import {CONTEXT as LANG_STRING_CONTEXT, LangString} from "./LangString";
import {Severity} from "./Severity";
import {SourceShape} from "./SourceShape";

// @id and @type are merged from ASSET_CONTEXT
const ctx = {
    "term": VocabularyUtils.SH_FOCUS_NODE,
    "severity": VocabularyUtils.SH_RESULT_SEVERITY,
    "message": VocabularyUtils.SH_RESULT_MESSAGE,
    "sourceShape": VocabularyUtils.SH_SOURCE_SHAPE
};

export const CONTEXT = Object.assign({}, TERM_CONTEXT, LANG_STRING_CONTEXT, ctx );

export default class ValidationResult {
    public id: string;
    public term: TermData;
    public severity: Severity;
    public message: LangString[];
    public sourceShape: SourceShape;


    constructor(id: string, term : TermData, severity: Severity, message: LangString[], sourceShape: SourceShape ) {
        this.id = id;
        this.term = term;
        this.severity = severity;
        this.message = message;
        this.sourceShape = sourceShape;

    }
}
