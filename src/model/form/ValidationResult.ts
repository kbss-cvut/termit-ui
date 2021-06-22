import OntoValidationResult from "../ValidationResult";
import {ValidationUtils} from "../../component/term/validation/ValidationUtils";
import Utils from "../../util/Utils";
import {getShortLocale} from "../../util/IntlUtil";

export enum Severity {
    BLOCKER,    // Blocker severity indicates the form cannot be submitted and the input should have an error boundary
    ERROR,
    WARNING,
    VALID       // Optionally can mark with a green boundary inputs with valid value
}

export default class ValidationResult {

    public static BLOCKER: ValidationResult = new ValidationResult(Severity.BLOCKER);
    public static VALID: ValidationResult = new ValidationResult(Severity.VALID);

    public readonly severity: Severity;
    public readonly message?: string | JSX.Element;

    constructor(severity: Severity, message?: string | JSX.Element) {
        this.severity = severity;
        this.message = message;
    }

    static fromOntoValidationResult(result: OntoValidationResult, locale: string) {
        return new ValidationResult(ValidationUtils.toSeverity(result.sourceShape.iri),
            Utils.sanitizeArray(result.message).find((ls) => ls.language === getShortLocale(locale))!.value);
    }

    static blocker(msg: string) {
        return new ValidationResult(Severity.BLOCKER, msg);
    }
}

export function severityComparator(a: ValidationResult, b: ValidationResult) {
    return Object.keys(Severity).indexOf(a.severity.toString()) - Object.keys(Severity).indexOf(b.severity.toString());
}
