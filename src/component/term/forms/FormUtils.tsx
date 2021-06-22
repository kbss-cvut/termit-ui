import ValidationResult from "../../../model/ValidationResult";
import FormValidationResult from "../../../model/form/ValidationResult";
import InputValidationMessage from "../../misc/validation/InputValidationMessage";

export function renderValidationMessages(
  locale: string,
  validationResults: ValidationResult[]
) {
  return validationResults.length > 0 ? (
    <ul className="list-unstyled">
      {validationResults.map((r) => {
        const message = FormValidationResult.fromOntoValidationResult(
          r,
          locale
        );
        return <InputValidationMessage key={r.iri} message={message} />;
      })}
    </ul>
  ) : undefined;
}
