import * as React from "react";
import SearchQuery from "../../../../model/SearchQuery";
import SearchResult from "../../../../model/SearchResult";
import {Location} from "history";
import {createMemoryHistory} from "history";
import {match as Match} from "react-router";
import Routes from "../../../../util/Routes";
import {mountWithIntl} from "../../../../__tests__/environment/Environment";
import {Search} from "../Search";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";

describe("Search", () => {

    let addSearchListener: () => void;
    let removeSearchListener: () => void;
    let updateSearchFilter: (searchString: string) => any;

    let searchQuery: SearchQuery;
    let searchResults: SearchResult[] | null;
    let searchInProgress: boolean;

    let location: Location;
    const history = createMemoryHistory();
    let match: Match<any>;

    let searchProps: any;
    let routingProps: any;

    beforeEach(() => {
        addSearchListener = jest.fn();
        removeSearchListener = jest.fn();
        updateSearchFilter = jest.fn();
        searchQuery = new SearchQuery();
        searchResults = null;
        searchInProgress = false;
        location = {
            pathname: Routes.search.path,
            search: "",
            hash: "",
            state: {}
        };
        match = {
            params: {},
            path: location.pathname,
            isExact: true,
            url: "http://localhost:3000/" + location.pathname
        };
        searchProps = {
            addSearchListener,
            removeSearchListener,
            updateSearchFilter,
            searchQuery,
            searchResults,
            searchInProgress
        };
        routingProps = {location, match, history};
    });

    it("resets search filter on reset results button click", () => {
        searchProps.searchResults = [];
        const wrapper = mountWithIntl(<Search {...searchProps} {...routingProps} {...intlFunctions()}/>);
        wrapper.find("button#search-reset").simulate("click");
        expect(updateSearchFilter).toHaveBeenCalledWith("");
    });
});
