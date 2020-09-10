import * as React from "react";
import {MainView} from "../MainView";
import User, {EMPTY_USER} from "../../model/User";
import {intlFunctions} from "../../__tests__/environment/IntlUtil";
import {shallow} from "enzyme";
import {createMemoryHistory} from "history";
import {Breadcrumbs} from "react-breadcrumbs";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import Generator from "../../__tests__/environment/Generator";

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

    let dispatchFunctions: {
        loadUser: () => Promise<any>;
        logout: () => void;
        selectWorkspace: (iri: IRI) => void;
        loadCurrentWorkspace: () => void;
    }

    const nonEmptyUser = new User({
        firstName: "Catherine",
        lastName: "Halsey",
        username: "halsey@unsc.org",
        iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey"
    });

    beforeEach(() => {
        location.search = "";
        dispatchFunctions = {
            loadUser: jest.fn().mockResolvedValue({}),
            logout: jest.fn(),
            selectWorkspace: jest.fn(),
            loadCurrentWorkspace: jest.fn()
        };
    });

    it("loads user on mount", () => {
        shallow(<MainView user={EMPTY_USER} {...dispatchFunctions}
                          history={history} location={location} match={match} {...intlFunctions()}/>);
        expect(dispatchFunctions.loadUser).toHaveBeenCalled();
    });

    it("does not load user when it is already present in store", () => {
        const user = new User({
            firstName: "Catherine",
            lastName: "Halsey",
            username: "halsey@unsc.org",
            iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey"
        });
        shallow(<MainView user={user} {...dispatchFunctions}
                          history={history} location={location} match={match} {...intlFunctions()}/>);
        expect(dispatchFunctions.loadUser).not.toHaveBeenCalled();
    });

    it("renders placeholder UI when user is being loaded", () => {
        const wrapper = shallow(<MainView user={EMPTY_USER} {...dispatchFunctions} history={history}
                                          location={location} match={match} {...intlFunctions()}/>);
        expect(wrapper.exists("#loading-placeholder")).toBeTruthy();
    });

    describe("workspace", () => {

        const wsIri = "http://onto.fel.cvut.cz/ontologies/termit/workspaces/testOne";

        it("selects workspace when workspace IRI is specified as query param", () => {
            location.search = `workspace=${encodeURIComponent(wsIri)}`;
            shallow(<MainView user={Generator.generateUser()} {...dispatchFunctions}
                              history={history} location={location} match={match} {...intlFunctions()}/>);
            return Promise.resolve().then(() => {
                expect(dispatchFunctions.selectWorkspace).toHaveBeenCalledWith(VocabularyUtils.create(wsIri));
            });
        });

        it("does not select workspace when user is not loaded", () => {
            location.search = `workspace=${encodeURIComponent(wsIri)}`;
            shallow(<MainView user={EMPTY_USER} {...dispatchFunctions}
                              history={history} location={location} match={match} {...intlFunctions()}/>);
            expect(dispatchFunctions.selectWorkspace).not.toHaveBeenCalled();
        });

        it("loads current workspace when user is loaded and no workspace IRI is provided", () => {
            shallow(<MainView user={Generator.generateUser()} {...dispatchFunctions}
                              history={history} location={location} match={match} {...intlFunctions()}/>);
            return Promise.resolve().then(() => {
                expect(dispatchFunctions.loadCurrentWorkspace).toHaveBeenCalled();
            });
        });

        it("does not load current workspace when user is not loaded", () => {
            shallow(<MainView user={EMPTY_USER} {...dispatchFunctions}
                              history={history} location={location} match={match} {...intlFunctions()}/>);
            return Promise.resolve().then(() => {
                expect(dispatchFunctions.loadCurrentWorkspace).not.toHaveBeenCalled();
            });
        });
    });

    it("does not render breadcrumb on dashboard", () => {
        const wrapper = shallow(<MainView user={nonEmptyUser} {...dispatchFunctions}
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

        const wrapper = shallow(<MainView user={nonEmptyUser} {...dispatchFunctions}
                                          location={locationVocabularies} match={match} {...intlFunctions()}/>);
        expect(wrapper.exists(Breadcrumbs)).toBeTruthy();
    });

    it("renders navbar on >= 768px", () => {
        const wrapper = shallow(<MainView user={nonEmptyUser} {...dispatchFunctions}
                                          location={location} match={match} desktopView={true} {...intlFunctions()}/>);
        expect(wrapper.exists("#navbar")).toBeTruthy();
    });

    it("does not render navbar on > 768px", () => {
        const wrapper = shallow(<MainView user={nonEmptyUser} {...dispatchFunctions}
                                          location={location} match={match} desktopView={false} {...intlFunctions()}/>);
        expect(wrapper.exists("#navbar")).toBeFalsy();
    });
});
