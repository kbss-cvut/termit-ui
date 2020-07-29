import * as React from "react";
import {MainView} from "../MainView";
import User, {EMPTY_USER} from "../../model/User";
import {intlFunctions} from "../../__tests__/environment/IntlUtil";
import {shallow} from "enzyme";
import {createMemoryHistory} from "history";
import {Breadcrumbs} from "react-breadcrumbs";

describe("MainView", () => {

    const location = {
        pathname: "/",
        search: "",
        hash: "",
        state: {}
    };
    const history = createMemoryHistory();
    const match = {
        params: {},
        path: "/",
        isExact: true,
        url: "http://localhost:3000/"
    };

    let loadUser: () => void;
    let logout: () => void;

    const nonEmptyUser = new User({
        firstName: "Catherine",
        lastName: "Halsey",
        username: "halsey@unsc.org",
        iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey"
    });

    beforeEach(() => {
        loadUser = jest.fn();
        logout = jest.fn();
    });

    it("loads user on mount", () => {
        shallow(<MainView user={EMPTY_USER} loadUser={loadUser} logout={logout} history={history} location={location}
                          match={match} {...intlFunctions()}/>);
        expect(loadUser).toHaveBeenCalled();
    });

    it("does not load user when it is already present in store", () => {
        const user = new User({
            firstName: "Catherine",
            lastName: "Halsey",
            username: "halsey@unsc.org",
            iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey"
        });
        shallow(<MainView user={user} loadUser={loadUser} logout={logout} history={history} location={location}
                          match={match} {...intlFunctions()}/>);
        expect(loadUser).not.toHaveBeenCalled();
    });

    it("renders placeholder UI when user is being loaded", () => {
        const wrapper = shallow(<MainView user={EMPTY_USER} loadUser={loadUser} logout={logout} history={history}
                                          location={location} match={match} {...intlFunctions()}/>);
        expect(wrapper.exists("#loading-placeholder")).toBeTruthy();
    });

    it("does not render breadcrumb on dashboard", () => {
        const wrapper = shallow(<MainView user={nonEmptyUser} loadUser={loadUser} logout={logout} history={history}
                                          location={location} match={match} {...intlFunctions()}/>);
        expect(wrapper.exists(Breadcrumbs)).toBeFalsy();
    });

    it("renders breadcrumb on route different to dashboard", () => {
        const locationVocabularies = {
            pathname: "/vocabularies",
            search: "",
            hash: "",
            state: {}
        };

        const wrapper = shallow(<MainView user={nonEmptyUser} loadUser={loadUser} logout={logout} history={history}
                                          location={locationVocabularies} match={match} {...intlFunctions()}/>);
        expect(wrapper.exists(Breadcrumbs)).toBeTruthy();
    });

    it("renders navbar on >= 768px", () => {
        const wrapper = shallow(<MainView user={nonEmptyUser} loadUser={loadUser} logout={logout} history={history}
                                          location={location} match={match} desktopView={true} {...intlFunctions()}/>);
        expect(wrapper.exists("#navbar")).toBeTruthy();
    });

    it("does not render navbar on > 768px", () => {
        const wrapper = shallow(<MainView user={nonEmptyUser} loadUser={loadUser} logout={logout} history={history}
                                          location={location} match={match} desktopView={false} {...intlFunctions()}/>);
        expect(wrapper.exists("#navbar")).toBeFalsy();
    });
});
