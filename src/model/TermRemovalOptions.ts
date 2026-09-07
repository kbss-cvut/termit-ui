/**
 * Strategy used to handle direct sub-terms when removing a term.
 */
export enum SubTermRemovalStrategy {
  /** Prevent removal when the term has any sub-terms. */
  FAIL = "FAIL",
  /** Move sub-terms to the removed term's parents, or make them root terms. */
  RECONNECT = "RECONNECT",
  /** Remove all sub-terms recursively. */
  CASCADE = "CASCADE",
}

/**
 * Options controlling how references associated with a removed term are
 * handled by the server.
 */
export interface TermRemovalOptions {
  /** Strategy applied when the removed term has sub-terms. */
  subTermsStrategy: SubTermRemovalStrategy;
  /** Whether occurrences of the term should be removed. */
  removeOccurrences: boolean;
  /** Whether incoming relationships referencing the term should be removed. */
  removeRelationships: boolean;
}
