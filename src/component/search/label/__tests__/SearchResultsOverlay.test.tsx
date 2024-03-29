import SearchResult, {
  SearchResultData,
} from "../../../../model/search/SearchResult";
import Generator from "../../../../__tests__/environment/Generator";
import Vocabulary from "../../../../util/VocabularyUtils";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import SearchResultsOverlay, {
  MAX_RENDERED_RESULTS,
} from "../SearchResultsOverlay";
import { Simulate } from "react-dom/test-utils";
import { ReactWrapper } from "enzyme";
import { MemoryRouter } from "react-router";
import RdfsResource from "../../../../model/RdfsResource";
import { langString } from "../../../../model/MultilingualString";
import Constants from "../../../../util/Constants";
import * as Redux from "react-redux";

jest.mock("popper.js");
jest.mock("../../../misc/AssetLabel", () => () => <span>Asset</span>);
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

function generateResults(type: string, count: number = 5): SearchResult[] {
  const results: SearchResult[] = [];
  for (let i = 0; i < count; i++) {
    const resData: SearchResultData = {
      iri: Generator.generateUri(),
      label: "Result " + i,
      score: Generator.randomInt(0, 1),
      types: [type],
      snippetText: "<em>Match</em>",
      snippetField: "label",
    };
    if (type === VocabularyUtils.TERM) {
      resData.vocabulary = {
        iri:
          "http://onto.fel.cvut.cz/ontologies/termit/vocabularies/vocabulary-" +
          i,
      };
    }
    results.push(new SearchResult(resData));
  }
  return results;
}

describe("SearchResultsOverlay", () => {
  let onClose: () => void;
  let onOpenSearch: () => void;
  let onOpenFacetedSearch: () => void;

  let element: HTMLDivElement;
  let wrapper: ReactWrapper;

  beforeEach(() => {
    onClose = jest.fn();
    onOpenSearch = jest.fn();
    onOpenFacetedSearch = jest.fn();
    element = document.createElement("div");
    element.id = "root";
    document.body.appendChild(element);
    jest.useFakeTimers();
    mockUseI18n();
    jest.spyOn(Redux, "useSelector").mockReturnValue([]);
  });

  afterEach(() => {
    wrapper.unmount();
    jest.clearAllTimers();
    document.body.removeChild(element);
  });

  it("shows only first x search results, others can be viewed on dedicated search page", () => {
    const results = generateResults(Vocabulary.TERM, MAX_RENDERED_RESULTS + 5);
    renderWithResults(results);
    const items = document.getElementsByClassName("search-result-link");
    expect(items.length).toEqual(MAX_RENDERED_RESULTS);
  });

  function renderWithResults(results: SearchResult[]) {
    wrapper = mountWithIntl(
      <MemoryRouter>
        <SearchResultsOverlay
          targetId="root"
          show={true}
          searchResults={results}
          onClose={onClose}
          onOpenSearch={onOpenSearch}
          onOpenFacetedSearch={onOpenFacetedSearch}
        />
      </MemoryRouter>,
      { attachTo: element }
    );
  }

  it("renders info message about no results when empty results are provided", () => {
    renderWithResults([]);
    const items = document.getElementsByClassName("search-result-link");
    expect(items.length).toEqual(0);
    expect(
      document.getElementsByClassName("search-result-no-results").length
    ).toEqual(1);
  });

  it("renders count info when more results than displayable count are provided", () => {
    const results = generateResults(Vocabulary.TERM, MAX_RENDERED_RESULTS + 5);
    renderWithResults(results);
    expect(
      document.getElementsByClassName("search-result-link").length
    ).toEqual(MAX_RENDERED_RESULTS);
    expect(
      document.getElementsByClassName("search-result-info").length
    ).toEqual(1);
  });

  it("renders results as links leading to result details", () => {
    const results = generateResults(Vocabulary.TERM, MAX_RENDERED_RESULTS);
    renderWithResults(results);
    const links = document.getElementsByClassName("m-asset-link");
    expect(links.length).toEqual(MAX_RENDERED_RESULTS);
  });

  it("invokes search open when no results info link is clicked", () => {
    renderWithResults([]);
    const noResultsInfo = document.getElementsByClassName(
      "search-result-no-results"
    )[0];
    Simulate.click(noResultsInfo);
    expect(onOpenFacetedSearch).toHaveBeenCalled();
  });

  it("invokes search open when count info link is clicked", () => {
    const results = generateResults(Vocabulary.TERM, MAX_RENDERED_RESULTS + 5);
    renderWithResults(results);
    const infoLink = document.getElementsByClassName("search-result-info")[0];
    Simulate.click(infoLink);
    expect(onOpenSearch).toHaveBeenCalled();
  });

  it("merges duplicate results to prevent rendering issues", () => {
    const iri = Generator.generateUri();
    const vocabularyIri = Generator.generateUri();
    const results = [
      new SearchResult({
        iri,
        label: "Result",
        snippetText: "<em>Match</em> multiple times. <em>Match</em> again",
        snippetField: "comment",
        vocabulary: { iri: vocabularyIri },
        types: [Vocabulary.TERM],
      }),
      new SearchResult({
        iri,
        label: "Result",
        snippetText: "<em>Match</em> multiple times. <em>Match</em> again",
        snippetField: "comment",
        vocabulary: { iri: vocabularyIri },
        types: [Vocabulary.TERM],
      }),
    ];
    renderWithResults(results);
    const items = document.getElementsByClassName("search-result-link");
    expect(items.length).toEqual(1);
  });

  it("reports correct result count after merging duplicates", () => {
    const results = generateResults(Vocabulary.TERM, MAX_RENDERED_RESULTS + 5);
    results.push(results[0].copy());
    renderWithResults(results);
    const infoLink = document.getElementsByClassName("search-result-info")[0];
    const expCount = results.length - 1;
    expect(infoLink.textContent).toContain(expCount.toString());
  });

  it("sorts results correctly after merging duplicates", () => {
    const results = generateResults(VocabularyUtils.TERM);
    const newItem = new SearchResult({
      iri: results[results.length - 1].iri,
      score: 1,
      snippetText: "test <em>match</em> aaa",
      snippetField: "comment",
      label: results[0].label,
      vocabulary: { iri: results[0].vocabulary!.iri },
      types: [VocabularyUtils.TERM],
    });
    results.push(newItem);
    renderWithResults(results);
    const items = document.getElementsByClassName("search-result-link");
    expect(items.length).toEqual(results.length - 1);
    expect(items[0].id).toContain(newItem.iri);
  });

  it("shows correct number of results when there are fewer than threshold and some are merged", () => {
    const results = generateResults(Vocabulary.TERM, 1);
    results.push(results[0].copy());
    renderWithResults(results);
    const infoLink = document.getElementById("search-results-link");
    expect(infoLink).toBeNull();
    const items = document.getElementsByClassName("search-result-link");
    expect(items.length).toEqual(1);
  });

  it("filters out results in terminal state", () => {
    const states = [
      new RdfsResource({
        iri: Generator.generateUri(),
        label: langString("Normal state", Constants.DEFAULT_LANGUAGE),
        types: [VocabularyUtils.TERM_STATE],
      }),
      new RdfsResource({
        iri: Generator.generateUri(),
        label: langString("Terminal state", Constants.DEFAULT_LANGUAGE),
        types: [
          VocabularyUtils.TERM_STATE,
          VocabularyUtils.TERM_STATE_TERMINAL,
        ],
      }),
    ];
    const results = [
      new SearchResult(
        Object.assign({}, generateResults(Vocabulary.TERM, 1)[0], {
          state: { iri: states[1].iri },
        })
      ),
    ];
    (Redux.useSelector as jest.Mock).mockReset();
    jest.spyOn(Redux, "useSelector").mockReturnValue([states[1].iri]);
    renderWithResults(results);
    const items = document.getElementsByClassName("search-result-link");
    expect(items.length).toEqual(0);
    expect(
      document.getElementsByClassName("search-result-no-results").length
    ).toEqual(1);
  });
});
