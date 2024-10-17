import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import SearchResults from "../SearchResults";
import { mockUseI18n } from "../../../../__tests__/environment/IntlUtil";
import { Label } from "reactstrap";
import en from "../../../../i18n/en";
import SearchResult from "../../../../model/search/SearchResult";
import Generator from "../../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import TermBadge from "../../../badge/TermBadge";
import VocabularyBadge from "../../../badge/VocabularyBadge";
import { Link, MemoryRouter } from "react-router-dom";
import VocabularyLink from "../../../vocabulary/VocabularyLink";
import AssetLink from "../../../misc/AssetLink";
import Ajax from "../../../../util/Ajax";
import RdfsResource from "../../../../model/RdfsResource";
import { langString } from "../../../../model/MultilingualString";
import Constants from "../../../../util/Constants";
import * as Redux from "react-redux";

jest.mock("../../../misc/AssetLabel", () => () => <span>AssetLabel</span>);
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("SearchResults", () => {
  beforeEach(() => {
    Ajax.get = jest.fn().mockResolvedValue({});
    mockUseI18n();
    jest
      .spyOn(Redux, "useSelector")
      .mockReturnValueOnce(true)
      .mockReturnValue([]);
  });

  it("render no results info when no results are found", () => {
    const wrapper = renderWithResults([]);
    const label = wrapper.find(Label);
    expect(label.exists()).toBeTruthy();
    expect(label.text()).toContain(en.messages["search.no-results"]);
  });

  function generateTermResult(score?: number) {
    return new SearchResult({
      iri: Generator.generateUri(),
      label: "Test",
      snippetText: "<em>Match</em>",
      snippetField: "label",
      score,
      vocabulary: { iri: Generator.generateUri() },
      types: [VocabularyUtils.TERM],
    });
  }

  it("renders term results", () => {
    const result = generateTermResult();
    const wrapper = renderWithResults([result]);
    const rows = wrapper.find("tr");
    // result row
    expect(rows.length).toEqual(1);
    expect(rows.find(TermBadge).exists()).toBeTruthy();
    const label = wrapper.find(AssetLink);
    expect(label.text().startsWith(result.label)).toBeTruthy();
  });

  function renderWithResults(results: SearchResult[]) {
    return mountWithIntl(
      <MemoryRouter>
        <SearchResults results={results} />
      </MemoryRouter>
    );
  }

  function generateVocabularyResult(score?: number) {
    return new SearchResult({
      iri: Generator.generateUri(),
      label: "Test",
      snippetText: "<em>Match</em>",
      snippetField: "label",
      score,
      types: [VocabularyUtils.VOCABULARY],
    });
  }

  it("renders vocabulary results", () => {
    const result = generateVocabularyResult();
    const wrapper = renderWithResults([result]);
    const rows = wrapper.find("tr");
    // Result row
    expect(rows.length).toEqual(1);
    expect(rows.find(VocabularyBadge).exists()).toBeTruthy();
    const label = wrapper.find(Link);
    expect(label.text()).toEqual(result.label);
  });

  it("renders both vocabulary and term results", () => {
    const results = [generateTermResult(), generateVocabularyResult()];
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <SearchResults results={results} />
      </MemoryRouter>
    );
    const rows = wrapper.find("tr");
    // Header + result row
    expect(rows.length).toEqual(2);
    expect(rows.find(TermBadge).length).toEqual(1);
    expect(rows.find(VocabularyBadge).length).toEqual(1);
  });

  it("renders VocabularyLink for vocabulary result", () => {
    const result = generateVocabularyResult();
    const wrapper = renderWithResults([result]);
    expect(wrapper.find(VocabularyLink).exists()).toBeTruthy();
  });

  it("renders TermLink for term result", () => {
    const result = generateTermResult();
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <SearchResults results={[result]} />
      </MemoryRouter>
    );
    expect(wrapper.find(AssetLink).exists()).toBeTruthy();
  });

  it("merges multiple matches of one field of one asset into one result row", () => {
    const iri = Generator.generateUri();
    const vocabularyIri = Generator.generateUri();
    const results = [
      new SearchResult({
        iri,
        label: "Test",
        snippetText: "<em>Match</em> and another <em>match</em>",
        snippetField: "description",
        vocabulary: { iri: vocabularyIri },
        types: [VocabularyUtils.VOCABULARY],
      }),
      new SearchResult({
        iri,
        label: "Test",
        snippetText: "<em>Match</em> and another <em>match</em>",
        snippetField: "description",
        vocabulary: { iri: vocabularyIri },
        types: [VocabularyUtils.VOCABULARY],
      }),
    ];
    const wrapper = renderWithResults(results);
    const rows = wrapper.find("tr");
    // result row
    expect(rows.length).toEqual(1);
    const label = wrapper.find(VocabularyLink);
    expect(label.text().startsWith(results[0].label)).toBeTruthy();
    expect(wrapper.find(".search-result-snippet").text()).toContain(
      removeMarkup(results[0].snippetText)
    );
  });

  function removeMarkup(text: string) {
    const tmp = text.replace(/<em>/g, "");
    return tmp.replace(/<\/em>/g, "");
  }

  it("merges matches of multiple fields of one asset into one result row", () => {
    const iri = Generator.generateUri();
    const results = [
      new SearchResult({
        iri,
        label: "Test",
        snippetText: "<em>Match</em> in label",
        description: "Vocabulary description",
        snippetField: "title",
        types: [VocabularyUtils.VOCABULARY],
      }),
      new SearchResult({
        iri,
        label: "Test",
        description: "Vocabulary description",
        snippetText: "<em>Match</em> in description",
        snippetField: "description",
        types: [VocabularyUtils.VOCABULARY],
      }),
    ];
    const wrapper = renderWithResults(results);
    const rows = wrapper.find("tr");
    // result row
    expect(rows.length).toEqual(1);
    const label = wrapper.find(AssetLink);
    expect(label.text().startsWith(results[0].label)).toBeTruthy();
    const matchTextContent = wrapper.find(".search-result-snippet").text();
    expect(matchTextContent).toContain(removeMarkup(results[1].snippetText));
  });

  it("ensures results are sorted by score descending", () => {
    const results = [generateTermResult(1.1), generateVocabularyResult(2.5)];
    const wrapper = renderWithResults(results);
    const rows = wrapper.find(AssetLink);
    expect(rows.at(0).text().startsWith(results[1].label)).toBeTruthy();
  });

  it("renders link to faceted search when no results are found and link display is enabled", () => {
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <SearchResults results={[]} withFacetedSearchLink={true} />
      </MemoryRouter>
    );
    expect(wrapper.exists("#search-results-faceted-link")).toBeTruthy();
  });

  it("filters out results representing terms in terminal state", () => {
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
        Object.assign({}, generateTermResult(1), {
          state: { iri: states[1].iri },
        })
      ),
    ];
    (Redux.useSelector as jest.Mock).mockReset();
    jest
      .spyOn(Redux, "useSelector")
      .mockReturnValueOnce(true)
      .mockReturnValue([states[1].iri]);
    const wrapper = renderWithResults(results);
    const label = wrapper.find(Label);
    expect(label.exists()).toBeTruthy();
    expect(label.text()).toContain(en.messages["search.no-results"]);
  });
});
