import VocabularyUtils from "../util/VocabularyUtils";
import { TermData } from "./Term";
import { CONTEXT as TERM_CONTEXT } from "./Term";
import { CONTEXT as LANG_STRING_CONTEXT, LangString } from "./LangString";
import { Severity } from "./Severity";
import { SourceShape } from "./SourceShape";
import { ResultPath } from "./ResultPath";

// @id and @type are merged from ASSET_CONTEXT
const ctx = {
    term: VocabularyUtils.SH_FOCUS_NODE,
    severity: VocabularyUtils.SH_RESULT_SEVERITY,
    message: VocabularyUtils.SH_RESULT_MESSAGE,
    sourceShape: VocabularyUtils.SH_SOURCE_SHAPE,
    resultPath: VocabularyUtils.SH_RESULT_PATH,
};

export const CONTEXT = Object.assign(
    {},
    TERM_CONTEXT,
    LANG_STRING_CONTEXT,
    ctx
);

export default class ValidationResult {
    public iri: string;
    public term: TermData;
    public severity: Severity;
    public message: LangString[];
    public sourceShape: SourceShape;
    public resultPath: ResultPath;

    constructor(
        iri: string,
        term: TermData,
        severity: Severity,
        message: LangString[],
        sourceShape: SourceShape,
        resultPath: ResultPath
    ) {
        this.iri = iri;
        this.term = term;
        this.severity = severity;
        this.message = message;
        this.sourceShape = sourceShape;
        this.resultPath = resultPath;
    }
}
