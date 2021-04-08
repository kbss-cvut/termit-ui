import * as React from "react";
import ValidationResult from "../../../model/ValidationResult";
import { getShortLocale } from "../../../util/IntlUtil";
import { ValidationUtils } from "../validation/ValidationUtils";
import Utils from "../../../util/Utils";

export function renderValidationMessages(
  locale: string,
  validationResults: ValidationResult[]
) {
  return (
    <>
      {validationResults.map((r) => {
        const message = Utils.sanitizeArray(r.message).find(
          (ls) => ls.language === getShortLocale(locale)
        )!.value;
        const color =
          ValidationUtils.qualityAffectingRules.indexOf(r.sourceShape?.iri) > -1
            ? ValidationUtils.qualityAffectingRuleViolationColor
            : ValidationUtils.qualityNotAffectingRuleViolationColor;
        return (
          <li key={r.iri} style={{ color }}>
            {message}
          </li>
        );
      })}
    </>
  );
}
