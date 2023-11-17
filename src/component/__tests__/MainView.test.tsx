import { MainView } from "../MainView";
import User, { EMPTY_USER } from "../../model/User";
import {
  Configuration,
  DEFAULT_CONFIGURATION,
} from "../../model/Configuration";
import { intlFunctions } from "../../__tests__/environment/IntlUtil";
import { shallow } from "enzyme";
import { createMemoryHistory } from "history";
import { match, routingProps } from "../../__tests__/environment/TestUtil";
import Generator from "../../__tests__/environment/Generator";
import Constants from "../../util/Constants";
import Breadcrumbs from "../breadcrumb/Breadcrumbs";

describe("MainView", () => {
  let loadUser: () => Promise<any>;
  let logout: () => void;
  let changeView: () => void;
  let openContextsForEditing: () => Promise<any>;
  let loadTermStates: () => void;

  const nonEmptyUser = new User({
    firstName: "Catherine",
    lastName: "Halsey",
    username: "halsey@unsc.org",
    iri: Generator.generateUri(),
  });
  const configuration: Configuration = {
    iri: Generator.generateUri(),
    language: Constants.DEFAULT_LANGUAGE,
    roles: [],
    maxFileUploadSize: "10MB",
    versionSeparator: "/version",
  };

  let actions: {
    loadUser: () => Promise<any>;
    logout: () => void;
    openContextsForEditing: (contexts: string[]) => Promise<any>;
    changeView: () => void;
    loadTermStates: () => void;
  };

  beforeEach(() => {
    loadUser = jest.fn().mockResolvedValue({});
    logout = jest.fn();
    changeView = jest.fn();
    openContextsForEditing = jest.fn().mockResolvedValue({});
    loadTermStates = jest.fn();
    actions = {
      loadUser,
      logout,
      openContextsForEditing,
      changeView,
      loadTermStates,
    };
  });

  describe("component mount", () => {
    it("loads user on mount", () => {
      shallow(
        <MainView
          user={EMPTY_USER}
          sidebarExpanded={true}
          desktopView={true}
          configuration={DEFAULT_CONFIGURATION}
          {...actions}
          {...intlFunctions()}
          {...routingProps()}
        />
      );
      expect(loadUser).toHaveBeenCalled();
    });

    it("opens vocabularies for editing after loading user when their context IRIs are specified in query", async () => {
      const contextsToEdit = [Generator.generateUri(), Generator.generateUri()];
      const routing = routingProps();
      routing.location.search = contextsToEdit
        .map((c) => `edit-context=${encodeURIComponent(c)}`)
        .join("&");
      await shallow(
        <MainView
          user={EMPTY_USER}
          sidebarExpanded={true}
          desktopView={true}
          configuration={DEFAULT_CONFIGURATION}
          {...actions}
          {...intlFunctions()}
          {...routing}
        />
      );
      expect(openContextsForEditing).toHaveBeenCalledWith(contextsToEdit);
    });

    it("opens vocabularies for editing when their context IRIs are specified in query", () => {
      const contextsToEdit = [Generator.generateUri(), Generator.generateUri()];
      const routing = routingProps();
      routing.location.search = contextsToEdit
        .map((c) => `edit-context=${encodeURIComponent(c)}`)
        .join("&");
      shallow(
        <MainView
          user={nonEmptyUser}
          sidebarExpanded={true}
          desktopView={true}
          configuration={DEFAULT_CONFIGURATION}
          {...actions}
          {...intlFunctions()}
          {...routing}
        />
      );
      expect(openContextsForEditing).toHaveBeenCalledWith(contextsToEdit);
    });

    it("does not attempt to open vocabularies when no context IRIs are provided in query", () => {
      shallow(
        <MainView
          user={nonEmptyUser}
          sidebarExpanded={true}
          desktopView={true}
          configuration={DEFAULT_CONFIGURATION}
          {...actions}
          {...intlFunctions()}
          {...routingProps()}
        />
      );
      expect(openContextsForEditing).not.toHaveBeenCalled();
    });

    it("does not load user when it is already present in store", () => {
      shallow(
        <MainView
          user={nonEmptyUser}
          sidebarExpanded={true}
          desktopView={true}
          configuration={DEFAULT_CONFIGURATION}
          {...actions}
          {...intlFunctions()}
          {...routingProps()}
        />
      );
      expect(loadUser).not.toHaveBeenCalled();
    });

    it("renders placeholder UI when user is being loaded", () => {
      const wrapper = shallow(
        <MainView
          user={EMPTY_USER}
          sidebarExpanded={true}
          desktopView={true}
          configuration={DEFAULT_CONFIGURATION}
          {...actions}
          {...intlFunctions()}
          {...routingProps()}
        />
      );
      expect(wrapper.exists("#loading-placeholder")).toBeTruthy();
    });
  });

  it("does not render breadcrumb on dashboard", () => {
    const wrapper = shallow(
      <MainView
        user={nonEmptyUser}
        sidebarExpanded={true}
        desktopView={true}
        configuration={DEFAULT_CONFIGURATION}
        {...actions}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(wrapper.exists(Breadcrumbs)).toBeFalsy();
  });

  it("renders breadcrumb on route different to dashboard", () => {
    const locationVocabularies = {
      pathname: "/vocabularies",
      search: "",
      hash: "",
      state: {},
    };

    const wrapper = shallow(
      <MainView
        user={nonEmptyUser}
        sidebarExpanded={true}
        desktopView={true}
        configuration={configuration}
        {...actions}
        history={createMemoryHistory()}
        location={locationVocabularies}
        match={match()}
        {...intlFunctions()}
      />
    );
    expect(wrapper.exists(Breadcrumbs)).toBeTruthy();
  });

  it("renders navbar on >= 768px", () => {
    const wrapper = shallow(
      <MainView
        user={nonEmptyUser}
        sidebarExpanded={true}
        desktopView={true}
        configuration={configuration}
        {...actions}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(wrapper.exists("#navbar")).toBeTruthy();
  });

  it("does not render navbar on > 768px", () => {
    const wrapper = shallow(
      <MainView
        user={nonEmptyUser}
        sidebarExpanded={true}
        desktopView={false}
        configuration={configuration}
        {...actions}
        {...intlFunctions()}
        {...routingProps()}
      />
    );
    expect(wrapper.exists("#navbar")).toBeFalsy();
  });
});
