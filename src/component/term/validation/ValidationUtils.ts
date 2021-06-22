import {Severity} from "../../../model/form/ValidationResult";

export const ValidationUtils = {
  qualityAffectingRules: [
    "https://slovník.gov.cz/jazyk/obecný/g4",
    "https://slovník.gov.cz/jazyk/obecný/m1",
    "https://slovník.gov.cz/jazyk/obecný/g13",
    "https://slovník.gov.cz/jazyk/obecný/g14",
  ],

  qualityAffectingRuleViolationColor: "#8965e0",

  qualityNotAffectingRuleViolationColor: "#11cdef",

  toSeverity: function(ruleId?: string) {
    return ruleId && this.qualityAffectingRules.indexOf(ruleId) !== -1 ? Severity.ERROR : Severity.WARNING;
  },

  getMessageClass:  function (severity: Severity) {
    switch (severity) {
      case Severity.ERROR:
        return "qualityAffectingRuleViolation";
      case Severity.WARNING:
        return "qualityNotAffectingRuleViolation";
      default:
        // Others are covered by the default valid/invalid input styling
        return undefined;
    }
}
};
