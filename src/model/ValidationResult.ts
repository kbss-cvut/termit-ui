import VocabularyUtils from "../util/VocabularyUtils";
import { CONTEXT as TERM_CONTEXT, TermData } from "./Term";
import { Severity } from "./Severity";
import { SourceShape } from "./SourceShape";
import { ResultPath } from "./ResultPath";
import { context, MultilingualString } from "./MultilingualString";

// @id and @type are merged from ASSET_CONTEXT
const ctx = {
  term: VocabularyUtils.SH_FOCUS_NODE,
  severity: VocabularyUtils.SH_RESULT_SEVERITY,
  message: context(VocabularyUtils.SH_RESULT_MESSAGE),
  sourceShape: VocabularyUtils.SH_SOURCE_SHAPE,
  resultPath: VocabularyUtils.SH_RESULT_PATH,
};

export const CONTEXT = Object.assign({}, TERM_CONTEXT, ctx);

export default class ValidationResult {
  public iri: string;
  public term: TermData;
  public severity: Severity;
  public message: MultilingualString;
  public sourceShape: SourceShape;
  public resultPath: ResultPath;

  constructor(
    iri: string,
    term: TermData,
    severity: Severity,
    message: MultilingualString,
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
