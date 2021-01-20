import * as React from "react";
import {MainView} from "../MainView";
import User, {EMPTY_USER} from "../../model/User";
import {intlFunctions} from "../../__tests__/environment/IntlUtil";
import {shallow} from "enzyme";
import {createMemoryHistory} from "history";
import VocabularyUtils, {IRI} from "../../util/VocabularyUtils";
import Generator from "../../__tests__/environment/Generator";
import WorkspaceNotLoaded from "../workspace/WorkspaceNotLoaded";
import Workspace from "../../model/Workspace";
import Header from "../main/Header";
import ActionType from "../../action/ActionType";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import {KeycloakInstance} from "keycloak-js";

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

    let keycloak: KeycloakInstance;

    beforeEach(() => {
        location.search = "";
        dispatchFunctions = {
            loadUser: jest.fn().mockResolvedValue({}),
            logout: jest.fn(),
            selectWorkspace: jest.fn(),
            loadCurrentWorkspace: jest.fn()
        };
        keycloak = {
            init: jest.fn().mockResolvedValue({}),
            authServerUrl: "http://localhost:8080/",
            realm: "test",
            clientId: "client",
            authenticated: true,
            login: jest.fn(),
            logout: jest.fn(),
            register: jest.fn(),
            createAccountUrl: jest.fn(),
            createLoginUrl: jest.fn(),
            createLogoutUrl: jest.fn(),
            createRegisterUrl: jest.fn(),
            accountManagement: jest.fn(),
            clearToken: jest.fn(),
            isTokenExpired: jest.fn(),
            updateToken: jest.fn(),
            hasRealmRole: jest.fn(),
            hasResourceRole: jest.fn(),
            loadUserInfo: jest.fn(),
            loadUserProfile: jest.fn()
        };
    });

    it("loads user on mount", () => {
        shallow(<MainView user={EMPTY_USER} {...dispatchFunctions} history={history} location={location}
                          match={match} {...intlFunctions()}
                          keycloak={keycloak} keycloakInitialized={true}/>);
        expect(dispatchFunctions.loadUser).toHaveBeenCalled();
    });

    it("does not load user when it is already present in store", () => {
        const user = new User({
            firstName: "Catherine",
            lastName: "Halsey",
            username: "halsey@unsc.org",
            iri: "http://onto.fel.cvut.cz/ontologies/termit/catherine-halsey"
        });
        shallow(<MainView user={user} {...dispatchFunctions} history={history} location={location}
                          match={match} {...intlFunctions()} keycloak={keycloak} keycloakInitialized={true}/>);
        expect(dispatchFunctions.loadUser).not.toHaveBeenCalled();
    });

    it("renders placeholder UI when user is being loaded", () => {
        const wrapper = shallow(<MainView user={EMPTY_USER} {...dispatchFunctions} history={history}
                                          location={location} match={match} {...intlFunctions()} keycloak={keycloak}
                                          keycloakInitialized={true}/>);
        expect(wrapper.exists("#loading-placeholder")).toBeTruthy();
    });

    describe("workspace", () => {

        const wsIri = "http://onto.fel.cvut.cz/ontologies/termit/workspaces/testOne";

        it("selects workspace when workspace IRI is specified as query param", () => {
            location.search = `workspace=${encodeURIComponent(wsIri)}`;
            shallow(<MainView user={Generator.generateUser()} {...dispatchFunctions} history={history}
                              location={location} match={match} {...intlFunctions()} keycloak={keycloak}
                              keycloakInitialized={true}/>);
            return Promise.resolve().then(() => {
                expect(dispatchFunctions.selectWorkspace).toHaveBeenCalledWith(VocabularyUtils.create(wsIri));
            });
        });

        it("does not select workspace when user is not loaded", () => {
            location.search = `workspace=${encodeURIComponent(wsIri)}`;
            shallow(<MainView user={EMPTY_USER} {...dispatchFunctions} history={history} location={location}
                              match={match} {...intlFunctions()} keycloak={keycloak} keycloakInitialized={true}/>);
            expect(dispatchFunctions.selectWorkspace).not.toHaveBeenCalled();
        });

        it("loads current workspace when user is loaded and no workspace IRI is provided", () => {
            shallow(<MainView user={Generator.generateUser()} {...dispatchFunctions} history={history}
                              location={location} match={match} {...intlFunctions()} keycloak={keycloak}
                              keycloakInitialized={true}/>);
            return Promise.resolve().then(() => {
                expect(dispatchFunctions.loadCurrentWorkspace).toHaveBeenCalled();
            });
        });

        it("does not load current workspace when user is not loaded", () => {
            shallow(<MainView user={EMPTY_USER} {...dispatchFunctions} history={history} location={location}
                              match={match} {...intlFunctions()} keycloak={keycloak} keycloakInitialized={true}/>);
            expect(dispatchFunctions.loadCurrentWorkspace).not.toHaveBeenCalled();
        });

        it("does not attempt to load current workspace when user loading failed", () => {
            dispatchFunctions.loadUser = jest.fn().mockResolvedValue({
                type: ActionType.FETCH_USER,
                status: AsyncActionStatus.FAILURE,
                error: {status: 401}
            });
            shallow(<MainView user={EMPTY_USER} {...dispatchFunctions} history={history} location={location}
                              match={match} {...intlFunctions()} keycloak={keycloak} keycloakInitialized={true}/>);
            return Promise.resolve().then(() => {
                expect(dispatchFunctions.loadCurrentWorkspace).not.toHaveBeenCalled();
            });
        });

        it("renders workspace placeholder when workspace is not loaded", () => {
            const wrapper = shallow(<MainView user={Generator.generateUser()} {...dispatchFunctions} history={history}
                                              location={location} match={match} {...intlFunctions()} keycloak={keycloak}
                                              keycloakInitialized={true}/>);
            expect(wrapper.exists(WorkspaceNotLoaded)).toBeTruthy();
        });
    });

    it("does not render breadcrumb on dashboard", () => {
        const wrapper = shallow(<MainView user={nonEmptyUser} {...dispatchFunctions} workspace={new Workspace({
            iri: Generator.generateUri(),
            label: "Test workspace"
        })} location={location} match={match} {...intlFunctions()} keycloak={keycloak} keycloakInitialized={true}/>);
        const header = wrapper.find(Header);
        expect(header.prop("showBreadcrumbs")).toBeFalsy();
    });

    it("renders breadcrumb on route different to dashboard", () => {
        const locationVocabularies = {
            pathname: "/vocabularies",
            search: "",
            hash: "",
            state: {}
        };

        const wrapper = shallow(<MainView user={nonEmptyUser} {...dispatchFunctions}
                                          workspace={new Workspace({
                                              iri: Generator.generateUri(),
                                              label: "Test workspace"
                                          })} location={locationVocabularies} match={match} {...intlFunctions()}
                                          keycloak={keycloak} keycloakInitialized={true}/>);
        const header = wrapper.find(Header);
        expect(header.prop("showBreadcrumbs")).toBeTruthy();
    });
});
