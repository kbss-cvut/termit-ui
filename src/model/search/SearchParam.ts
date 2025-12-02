export default interface SearchParam {
  property: string;

  value: any[];

  matchType: MatchType;
}

export enum MatchType {
  IRI = "IRI",
  SUBSTRING = "SUBSTRING",
  EXACT_MATCH = "EXACT_MATCH",
}
