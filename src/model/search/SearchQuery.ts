export default class SearchQuery {
  public searchQuery: string;
  public language: string;

  constructor(oldState: SearchQuery | null = null) {
    this.searchQuery = oldState ? oldState.searchQuery : "";
    this.language = oldState ? oldState.language : "";
  }

  public isEmpty(): boolean {
    return !this.searchQuery;
  }
}
