import { Severity } from "../model/form/ValidationResult";

/**
 * Constants and utility functions concerning server-side quality validation.
 */
const Validation = {
  QUALITY_AFFECTING_RULES: [
    "https://slovník.gov.cz/jazyk/obecný/g4",
    "https://slovník.gov.cz/jazyk/obecný/m1",
    "https://slovník.gov.cz/jazyk/obecný/g13",
    "https://slovník.gov.cz/jazyk/obecný/g14",
  ],

  toSeverity: function (ruleId?: string) {
    return ruleId && this.QUALITY_AFFECTING_RULES.indexOf(ruleId) !== -1
      ? Severity.ERROR
      : Severity.WARNING;
  },
};

export default Validation;
