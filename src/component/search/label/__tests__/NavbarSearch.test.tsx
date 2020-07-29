import * as React from "react";
import {NavbarSearch} from "../NavbarSearch";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import SearchResultsOverlay from "../SearchResultsOverlay";
import {createMemoryHistory, Location} from "history";
import {match as Match} from "react-router";
import Routes from "../../../../util/Routes";
import {shallow} from "enzyme";
import SearchResult from "../../../../model/SearchResult";
import Generator from "../../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import Routing from "../../../../util/Routing";
import {InputGroup} from "reactstrap";
import {EMPTY_USER} from "../../../../model/User";

jest.mock("../../../../util/Routing");

describe("NavbarSearch", () => {

    let updateSearchFilter: () => Promise<object>;

    let location: Location;
    const history = createMemoryHistory();
    let match: Match<any>;

    const user = Generator.generateUser();

    const searchResults = [new SearchResult({
        iri: Generator.generateUri(),
        label: "test",
        snippetField: "label",
        snippetText: "<em>label</em>",
        types: [VocabularyUtils.VOCABULARY]
    })];

    const navbarConnections = () => {
        return {updateSearchFilter, location, history, match};
    };

    beforeEach(() => {
        updateSearchFilter = jest.fn().mockImplementation(() => Promise.resolve([]));

        location = {
            pathname: "/",
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
    });

    it("does not render results component for initial state", () => {
        const wrapper = shallow(<NavbarSearch searchString="" navbar={false} user={user}
                                              searchResults={null} {...navbarConnections()} {...intlFunctions()}/>);
        const resultsOverlay = wrapper.find(SearchResultsOverlay);
        expect(resultsOverlay.exists()).toBeFalsy();
    });

    it("invokes search on change", () => {
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString="" navbar={false} user={user}
                                                            searchResults={null} {...navbarConnections()} {...intlFunctions()}/>);
        const searchStr = "test";
        const input = wrapper.find("#main-search-input");
        input.simulate("change", {target: {value: searchStr}});
        return Promise.resolve().then(() => {
            expect(updateSearchFilter).toHaveBeenCalled();
        });
    });

    it("does not display search results when current route is search", () => {
        location.pathname = Routes.search.path;
        match.path = Routes.search.path;
        const isInNavbar = false;
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString="" navbar={isInNavbar} user={user}
                                                            searchResults={searchResults} {...navbarConnections()} {...intlFunctions()}/>);
        wrapper.setState({showResults: true, searchOriginNavbar: isInNavbar});
        wrapper.update();
        expect(wrapper.find(SearchResultsOverlay).prop("show")).toBeFalsy();
    });

    it("does not display search results when current route is term search", () => {
        location.pathname = Routes.searchTerms.path;
        match.path = Routes.searchTerms.path;
        const isInNavbar = false;
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString="" navbar={isInNavbar} user={user}
                                                            searchResults={searchResults} {...navbarConnections()} {...intlFunctions()}/>);
        wrapper.setState({showResults: true, searchOriginNavbar: isInNavbar});
        wrapper.update();
        expect(wrapper.find(SearchResultsOverlay).prop("show")).toBeFalsy();
    });

    it("does not display search results when current route is vocabulary search", () => {
        location.pathname = Routes.searchVocabularies.path;
        match.path = Routes.searchVocabularies.path;
        const isInNavbar = false;
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString="" navbar={isInNavbar} user={user}
                                                            searchResults={searchResults} {...navbarConnections()} {...intlFunctions()}/>);
        wrapper.setState({showResults: true, searchOriginNavbar: isInNavbar});
        wrapper.update();
        expect(wrapper.find(SearchResultsOverlay).prop("show")).toBeFalsy();
    });

    it("does not display search results when current route is faceted search", () => {
        location.pathname = Routes.facetedSearch.path;
        match.path = Routes.facetedSearch.path;
        const isInNavbar = false;
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString="" navbar={isInNavbar} user={user}
                                                            searchResults={searchResults} {...navbarConnections()} {...intlFunctions()}/>);
        wrapper.setState({showResults: true, searchOriginNavbar: isInNavbar});
        wrapper.update();
        expect(wrapper.find(SearchResultsOverlay).prop("show")).toBeFalsy();
    });

    it("renders results when they are available", () => {
        const isInNavbar = false;
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString="" navbar={isInNavbar} user={user}
                                                            searchResults={searchResults} {...navbarConnections()} {...intlFunctions()}/>);
        wrapper.setState({showResults: true, searchOriginNavbar: isInNavbar});
        wrapper.update();
        expect(wrapper.find(SearchResultsOverlay).prop("show")).toBeTruthy();
        expect(wrapper.find(SearchResultsOverlay).prop("searchResults")).toEqual(searchResults);
    });

    it("hides results when route changes", () => {
        const isInNavbar = false;
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString="" navbar={isInNavbar} user={user}
                                                            searchResults={searchResults} {...navbarConnections()} {...intlFunctions()}/>);
        wrapper.setState({showResults: true, searchOriginNavbar: isInNavbar});
        wrapper.update();
        expect(wrapper.find(SearchResultsOverlay).prop("show")).toBeTruthy();
        const newLoc = Object.assign({}, location, {pathname: Routes.resources.path});
        const newMatch = Object.assign({}, match, {path: Routes.resources.path});
        wrapper.setProps({location: newLoc, match: newMatch});
        wrapper.update();
        expect(wrapper.find(SearchResultsOverlay).length).toEqual(0);
    });

    it("transitions to search view on enter", () => {
        const searchString = "";
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString={searchString} navbar={false} user={user}
                                                            searchResults={null} {...navbarConnections()} {...intlFunctions()}/>);
        const input = wrapper.find("#main-search-input");
        input.simulate("keyPress", {key: "Enter"});
        expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.search, {query: new Map()});
    });

    it("passes search string as query parameter when transitioning to search view", () => {
        const searchString = "test";
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString={searchString} navbar={false} user={user}
                                                            searchResults={null} {...navbarConnections()} {...intlFunctions()}/>);
        const input = wrapper.find("#main-search-input");
        input.simulate("keyPress", {key: "Enter"});
        expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.search, {query: new Map([["searchString", searchString]])});
    });

    it("renders icon before input if search is in navbar", () => {
        const searchString = "test";
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString={searchString} navbar={true} user={user}
                                                            searchResults={null} {...navbarConnections()} {...intlFunctions()}/>);
        const inputGroup = wrapper.find(InputGroup);
        expect(inputGroup.childAt(0).prop("id")).toEqual("icon");
        expect(inputGroup.childAt(1).prop("id")).toEqual("main-search-input-navbar");
        expect(inputGroup.children().length).toEqual(2);
    });

    it("renders icon after input if search is not in navbar", () => {
        const searchString = "test";
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString={searchString} navbar={false} user={user}
                                                            searchResults={null} {...navbarConnections()} {...intlFunctions()}/>);
        const inputGroup = wrapper.find(InputGroup);
        expect(inputGroup.childAt(0).prop("id")).toEqual("main-search-input");
        expect(inputGroup.childAt(1).prop("id")).toEqual("icon");
        expect(inputGroup.children().length).toEqual(2);
    });

    it("transitions to public search view on enter when user is not logged in", () => {
        const searchString = "";
        const wrapper = shallow<NavbarSearch>(<NavbarSearch searchString={searchString} navbar={false} user={EMPTY_USER}
                                                            searchResults={null} {...navbarConnections()} {...intlFunctions()}/>);
        const input = wrapper.find("#main-search-input");
        input.simulate("keyPress", {key: "Enter"});
        expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.publicSearch, {query: new Map()});
    });
});
