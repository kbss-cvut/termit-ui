import { NavbarSearch } from "../NavbarSearch";
import {
  intlFunctions,
  i18n,
} from "../../../../__tests__/environment/IntlUtil";
import Routes, { Route } from "../../../../util/Routes";
import SearchResult from "../../../../model/search/SearchResult";
import Generator from "../../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import Routing from "../../../../util/Routing";
import { EMPTY_USER } from "../../../../model/User";
import {
  location,
  match,
  routingProps,
} from "../../../../__tests__/environment/TestUtil";
import SearchQuery from "../../../../model/search/SearchQuery";
import { langString, getLocalized } from "../../../../model/MultilingualString";
import { renderWithIntl } from "../../../../__tests__/environment/Environment";
import { act, fireEvent, screen } from "@testing-library/react";
import type { ComponentProps } from "react";

vi.mock("../../../../util/Routing");
vi.mock("../SearchResultsOverlay", () => ({
  default: ({
    show,
    searchResults,
  }: {
    show: boolean;
    searchResults: SearchResult[];
  }) =>
    show ? (
      <div data-testid="search-results">
        {searchResults.map((result) => (
          <div key={result.iri}>{getLocalized(result.label)}</div>
        ))}
      </div>
    ) : null,
}));

describe("NavbarSearch", () => {
  let props: ComponentProps<typeof NavbarSearch>;
  const user = Generator.generateUser();
  const searchResults = [
    new SearchResult({
      iri: Generator.generateUri(),
      label: langString("test"),
      snippetField: "label",
      snippetText: "<em>label</em>",
      types: [VocabularyUtils.VOCABULARY],
    }),
  ];

  beforeEach(() => {
    props = {
      updateSearchFilter: vi.fn().mockResolvedValue([]),
      resetSearchFilter: vi.fn(),
      ...routingProps(),
      indexedLanguages: [],
      searchQuery: new SearchQuery(),
      navbar: false,
      user,
      searchResults: null,
      ...intlFunctions(),
    };
  });

  function renderSearch(overrides: Partial<typeof props> = {}) {
    props = { ...props, ...overrides };
    return renderWithIntl(<NavbarSearch {...props} />);
  }

  async function search() {
    await act(async () => {
      fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), {
        target: { value: "test" },
      });
    });
  }

  it("does not render results component for initial state", () => {
    renderSearch();
    expect(screen.queryByTestId("search-results")).not.toBeInTheDocument();
  });

  it("invokes search on change", async () => {
    renderSearch();
    await search();
    expect(props.updateSearchFilter).toHaveBeenCalledWith(
      "test",
      props.searchQuery.language
    );
  });

  async function verifyResultsNotDisplayed(route: Route) {
    renderSearch({
      searchResults,
      location: { ...location(), pathname: route.path },
      match: { ...match(), path: route.path },
    });
    await search();
    expect(props.updateSearchFilter).toHaveBeenCalled();
    expect(screen.queryByTestId("search-results")).not.toBeInTheDocument();
  }

  it("does not display search results when current route is search", async () => {
    await verifyResultsNotDisplayed(Routes.search);
  });

  it("renders results when they are available", async () => {
    renderSearch({ searchResults });
    await search();
    expect(screen.getByTestId("search-results")).toHaveTextContent("test");
  });

  it("hides results when route changes", async () => {
    const { rerender } = renderSearch({ searchResults });
    await search();
    expect(screen.getByTestId("search-results")).toBeInTheDocument();
    rerender(
      <NavbarSearch
        {...props}
        location={{ ...location(), pathname: Routes.vocabularies.path }}
        match={{ ...match(), path: Routes.vocabularies.path }}
      />
    );
    expect(screen.queryByTestId("search-results")).not.toBeInTheDocument();
  });

  it("transitions to search view on enter", () => {
    renderSearch();
    fireEvent.keyPress(screen.getByRole("searchbox"), {
      key: "Enter",
      charCode: 13,
    });
    expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.search);
  });

  it("renders icon before input if search is in navbar", () => {
    const { container } = renderSearch({
      navbar: true,
      searchQuery: new SearchQuery({ searchString: "test" }),
    });
    const group = container.querySelector(".input-group")!;
    expect(Array.from(group.children).map((child) => child.id)).toEqual([
      "search-icon",
      "main-search-input-navbar",
      "search-reset",
    ]);
  });

  it("renders icon after input if search is not in navbar", () => {
    const { container } = renderSearch({
      searchQuery: new SearchQuery({ searchString: "test" }),
    });
    const group = container.querySelector(".input-group")!;
    expect(Array.from(group.children).map((child) => child.id)).toEqual([
      "main-search-input",
      "search-icon",
      "search-reset",
    ]);
  });

  it("does not render clear icon if search string is empty", () => {
    renderSearch();
    expect(screen.queryByTitle(i18n("search.reset"))).not.toBeInTheDocument();
  });

  it("transitions to public search view on enter when user is not logged in", () => {
    renderSearch({ user: EMPTY_USER });
    fireEvent.keyPress(screen.getByRole("searchbox"), {
      key: "Enter",
      charCode: 13,
    });
    expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.publicSearch);
  });

  it("does not display search results when current route is public search results", async () => {
    await verifyResultsNotDisplayed(Routes.publicSearch);
  });

  it("transitions to search view on search icon click", () => {
    renderSearch();
    fireEvent.click(screen.getByTitle(i18n("main.search.tooltip")));
    expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.search);
  });

  it("transitions to search view on search icon click when user is not logged in", () => {
    renderSearch({ user: EMPTY_USER });
    fireEvent.click(screen.getByTitle(i18n("main.search.tooltip")));
    expect(Routing.transitionTo).toHaveBeenCalledWith(Routes.publicSearch);
  });
});
