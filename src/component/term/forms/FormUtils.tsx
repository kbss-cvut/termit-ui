import ValidationResult from "../../../model/ValidationResult";
import { getShortLocale } from "../../../util/IntlUtil";
import { ValidationUtils } from "../validation/ValidationUtils";
import Utils from "../../../util/Utils";
import "../validation/ValidationMessage.scss";

export function renderValidationMessages(
  locale: string,
  validationResults: ValidationResult[]
) {
  return validationResults.length > 0 ? (
    <ul className="list-unstyled">
      {validationResults.map((r) => {
        const message = Utils.sanitizeArray(r.message).find(
          (ls) => ls.language === getShortLocale(locale)
        )!.value;
        return (
          <li key={r.iri} className={ValidationUtils.getMessageClass(ValidationUtils.toSeverity(r.sourceShape?.iri))}>
            {message}
          </li>
        );
      })}
    </ul>
  ) : undefined;
}
