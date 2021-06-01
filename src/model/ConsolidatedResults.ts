import ValidationResult from "./ValidationResult";

export type ConsolidatedResults = {
  [termIri: string]: ValidationResult[];
};
