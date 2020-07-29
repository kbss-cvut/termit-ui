export default class SearchQuery {
    public searchQuery: string;

    constructor(oldState: SearchQuery | null = null) {
        this.searchQuery = oldState ? oldState.searchQuery : "";
    }

    public isEmpty(): boolean {
        return !this.searchQuery;
    }
}
