import { TermInfo } from "./Term";

export interface TermBatchEditDto {
  targetTerms: string[];
  related?: TermInfo[];
  relatedMatch?: TermInfo[];
  exactMatchTerms?: TermInfo[];
  parentTerms?: TermInfo[];
  types?: string[];
}
