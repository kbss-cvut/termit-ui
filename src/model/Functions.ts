export default interface FetchOptionsFunction {
    searchString?: string;
    optionID?: string;
    limit?: number;
    offset?: number;
    includeImported?: boolean;
    includeTerms?: string[];
}
