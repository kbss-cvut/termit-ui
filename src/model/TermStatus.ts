/**
 * Simplified status of a term.
 *
 * Currently, this enum only provides explicit values mapping to the boolean {@code draft} flag of a term.
 */

const enum TermStatus {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
}

export default TermStatus;
