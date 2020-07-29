export interface QueryResultIF {
    queryString: string,
    result: any
}

export default class QueryResult implements QueryResultIF {
    public queryString: string;
    public result: any;

    constructor(queryString : string, result : any) {
        this.queryString = queryString;
        this.result = result;
    }
}
