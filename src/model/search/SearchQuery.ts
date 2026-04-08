export default class SearchQuery {
  public searchString: string;
  public language: string;

  constructor(oldState: SearchQuery | null = null) {
    this.searchString = oldState ? oldState.searchString : "";
    this.language = oldState ? oldState.language : "";
  }

  public isEmpty(): boolean {
    return !this.searchString;
  }
}
