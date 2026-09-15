import { screen } from "@testing-library/react";
import { MainView } from "../MainView";
import User, { EMPTY_USER } from "../../model/User";
import {
  Configuration,
  DEFAULT_CONFIGURATION,
} from "../../model/Configuration";
import { intlFunctions } from "../../__tests__/environment/IntlUtil";
import { createMemoryHistory } from "history";
import { match, routingProps } from "../../__tests__/environment/TestUtil";
import Generator from "../../__tests__/environment/Generator";
import Constants from "../../util/Constants";
import { renderWithIntl } from "../../__tests__/environment/Environment";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";

// MainView pulls in the whole application tree (sidebar, dashboard widgets, lazy-loaded
// route modules, ...). Since RTL - unlike Enzyme's shallow rendering - always renders the
// full tree, these heavy/unrelated children are stubbed out so the tests stay focused on
// MainView's own rendering logic (placeholder, navbar, breadcrumb).
vi.mock("../dashboard/Dashboard", () => ({
  default: () => <div data-testid="dashboard" />,
}));
vi.mock("../sidebar/Sidebar", () => ({
  default: () => <div data-testid="sidebar" />,
}));
vi.mock("../footer/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));
vi.mock("../search/label/NavbarSearch", () => ({
  default: () => <div data-testid="navbar-search" />,
}));
vi.mock("../search/SearchListenerHelper", () => ({
  default: () => null,
}));
vi.mock("../misc/UserDropdown", () => ({
  default: () => <div data-testid="user-dropdown" />,
}));
vi.mock("../profile/ProfileRoute", () => ({
  default: () => <div data-testid="profile-route" />,
}));
vi.mock("../administration/AdministrationRoute", () => ({
  default: () => <div data-testid="administration-route" />,
}));
vi.mock("../vocabulary/VocabularyManagementRoute", () => ({
  default: () => <div data-testid="vocabulary-management-route" />,
}));
vi.mock("../statistics/Statistics", () => ({
  default: () => <div data-testid="statistics" />,
}));
vi.mock("../search/AdvancedSearch", () => ({
  default: () => <div data-testid="advanced-search" />,
}));

describe("MainView", () => {
  let loadUser: () => Promise<any>;
  let logout: () => void;
  let changeView: () => void;
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
    indexedLanguages: [],
  };

  let actions: {
    loadUser: () => Promise<any>;
    logout: () => void;
    changeView: () => void;
    loadTermStates: () => void;
  };

  beforeEach(() => {
    loadUser = vi.fn().mockResolvedValue({});
    logout = vi.fn();
    changeView = vi.fn();
    loadTermStates = vi.fn();
    actions = {
      loadUser,
      logout,
      changeView,
      loadTermStates,
    };
  });

  function renderMainView(props: any, pathname: string = "/") {
    return renderWithIntl(
      <MemoryRouter initialEntries={[pathname]}>
        <MainView
          {...actions}
          {...intlFunctions()}
          {...routingProps()}
          {...props}
        />
      </MemoryRouter>
    );
  }

  describe("component mount", () => {
    it("loads user on mount", () => {
      renderMainView({
        user: EMPTY_USER,
        sidebarExpanded: true,
        desktopView: true,
        configuration: DEFAULT_CONFIGURATION,
      });
      expect(loadUser).toHaveBeenCalled();
    });

    it("does not load user when it is already present in store", () => {
      renderMainView({
        user: nonEmptyUser,
        sidebarExpanded: true,
        desktopView: true,
        configuration: DEFAULT_CONFIGURATION,
      });
      expect(loadUser).not.toHaveBeenCalled();
    });

    it("renders placeholder UI when user is being loaded", () => {
      const { container } = renderMainView({
        user: EMPTY_USER,
        sidebarExpanded: true,
        desktopView: true,
        configuration: DEFAULT_CONFIGURATION,
      });
      expect(container.querySelector("#loading-placeholder")).toBeTruthy();
    });
  });

  it("does not render breadcrumb on dashboard", () => {
    const { container } = renderMainView({
      user: nonEmptyUser,
      sidebarExpanded: true,
      desktopView: true,
      configuration: DEFAULT_CONFIGURATION,
    });
    expect(container.querySelector(".breadcrumb-bar")).toBeFalsy();
  });

  it("renders breadcrumb on route different to dashboard", async () => {
    const locationVocabularies = {
      pathname: "/vocabularies",
      search: "",
      hash: "",
      state: {},
    };

    const { container } = renderMainView(
      {
        user: nonEmptyUser,
        sidebarExpanded: true,
        desktopView: true,
        configuration,
        history: createMemoryHistory(),
        location: locationVocabularies,
        match: match(),
      },
      "/vocabularies"
    );
    await screen.findByTestId("vocabulary-management-route");
    expect(container.querySelector(".breadcrumb-bar")).toBeTruthy();
  });

  it("renders navbar on >= 768px", () => {
    const { container } = renderMainView({
      user: nonEmptyUser,
      sidebarExpanded: true,
      desktopView: true,
      configuration,
    });
    expect(container.querySelector("#navbar")).toBeTruthy();
  });

  it("does not render navbar on > 768px", () => {
    const { container } = renderMainView({
      user: nonEmptyUser,
      sidebarExpanded: true,
      desktopView: false,
      configuration,
    });
    expect(container.querySelector("#navbar")).toBeFalsy();
  });
});
