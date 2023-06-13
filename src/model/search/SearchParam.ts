export default interface SearchParam {
  property: string;

  value: string[];

  matchType: MatchType;
}

export enum MatchType {
  IRI = "IRI",
  SUBSTRING = "SUBSTRING",
  EXACT_MATCH = "EXACT_MATCH",
}
