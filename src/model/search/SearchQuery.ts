import { SearchTarget } from "./SearchTarget";

export default class SearchQuery {
  public searchString: string;
  public language: string;
  public target: SearchTarget;

  constructor(oldState: Partial<SearchQuery> | null = null) {
    this.searchString = oldState ? oldState.searchString || "" : "";
    this.language = oldState ? oldState.language || "" : "";
    this.target = oldState
      ? oldState.target || SearchTarget.BOTH
      : SearchTarget.BOTH;
  }

  public isEmpty(): boolean {
    return !this.searchString;
  }
}
