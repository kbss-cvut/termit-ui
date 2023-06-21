import SearchTerms from "../../SearchTerms";
import Generator from "../../../../__tests__/environment/Generator";
import SearchResults from "../SearchResults";
import SearchResult from "../../../../model/search/SearchResult";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import TermResultVocabularyFilter from "../TermResultVocabularyFilter";
import * as Redux from "react-redux";
import { act } from "react-dom/test-utils";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));
jest.mock("../TermResultVocabularyFilter", () => () => (
  <div>Vocabulary filter</div>
));
jest.mock("../SearchResults", () => () => <div>Results</div>);

describe("SearchTerms", () => {
  beforeEach(() => {
    const fakeDispatch = jest.fn();
    (Redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
  });

  it("renders only term results", () => {
    const results = generateSearchResults([]);
    jest
      .spyOn(Redux, "useSelector")
      .mockReturnValueOnce(results)
      .mockReturnValueOnce(false);
    const wrapper = mountWithIntl(<SearchTerms />);

    const renderedResults = wrapper.find(SearchResults).props().results;
    expect(renderedResults).not.toBeNull();
    expect(renderedResults!.length).toBeGreaterThan(0);
    renderedResults!.forEach((rr) => {
      expect(rr.types).toEqual([VocabularyUtils.TERM]);
    });
  });

  it("renders only results matching selected vocabularies", () => {
    const selectedVocabularies = [
      Generator.generateUri(),
      Generator.generateUri(),
    ];
    const results = generateSearchResults(selectedVocabularies);
    jest
      .spyOn(Redux, "useSelector")
      .mockReturnValueOnce(results)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(results)
      .mockReturnValueOnce(false);
    const wrapper = mountWithIntl(<SearchTerms />);
    act(() => {
      (wrapper.find(TermResultVocabularyFilter).prop("onChange") as any)(
        selectedVocabularies
      );
    });
    wrapper.update();

    const renderedResults = wrapper.find(SearchResults).props().results;
    expect(renderedResults).not.toBeNull();
    expect(renderedResults!.length).toBeGreaterThan(0);
    renderedResults!.forEach((rr) => {
      expect(rr.vocabulary).toBeDefined();
      expect(selectedVocabularies.indexOf(rr.vocabulary!.iri)).not.toEqual(-1);
    });
  });

  function generateSearchResults(vocabularies: string[]) {
    const results: SearchResult[] = [];
    const count = Generator.randomInt(10, 20);
    let hasTermResult = false;
    let hasVocabularyResult = false;
    let vocabularyUsed = vocabularies.length === 0;
    for (let i = 0; i < count; i++) {
      if (
        hasVocabularyResult &&
        (!hasTermResult || Generator.randomBoolean())
      ) {
        // This ensures that at least one of the vocabularies (if specified) is used in the results
        const vocabularyIri =
          !vocabularyUsed || Generator.randomBoolean()
            ? vocabularies[i % vocabularies.length]
            : Generator.generateUri();
        vocabularyUsed =
          vocabularyUsed || vocabularies.indexOf(vocabularyIri) !== -1;
        results.push(
          new SearchResult({
            iri: Generator.generateUri(),
            label: `Test ${i}`,
            snippetText: "Matching result",
            snippetField: "label",
            vocabulary: {
              iri: vocabularyIri,
            },
            types: [VocabularyUtils.TERM],
          })
        );
        hasTermResult = true;
      } else {
        results.push(
          new SearchResult({
            iri: Generator.generateUri(),
            label: `Test ${i}`,
            snippetText: "Matching result",
            snippetField: "label",
            types: [VocabularyUtils.VOCABULARY],
          })
        );
        hasVocabularyResult = true;
      }
    }
    return results;
  }
});
