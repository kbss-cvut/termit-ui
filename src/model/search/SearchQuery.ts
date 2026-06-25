import { SearchTarget } from "./SearchTarget";
import SearchParam from "./SearchParam";

export default class SearchQuery {
  public searchString: string;
  public language: string;
  public target: SearchTarget;
  public facetParams: Record<string, SearchParam>;

  constructor(oldState: Partial<SearchQuery> = {}) {
    this.searchString = oldState.searchString || "";
    this.language = oldState.language || "";
    this.target = oldState.target || SearchTarget.BOTH;
    this.facetParams = oldState.facetParams || {};
  }

  public isSearchStringBlank(): boolean {
    return this.searchString.trim().length === 0;
  }

  public hasFacetParams(): boolean {
    return Object.keys(this.facetParams).length > 0;
  }

  public isEmpty(): boolean {
    return this.isSearchStringBlank() && !this.hasFacetParams();
  }
}
