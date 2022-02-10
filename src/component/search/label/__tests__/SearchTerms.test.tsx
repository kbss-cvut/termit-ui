import { SearchTerms } from "../../SearchTerms";
import { intlFunctions } from "../../../../__tests__/environment/IntlUtil";
import SearchQuery from "../../../../model/SearchQuery";
import Generator from "../../../../__tests__/environment/Generator";
import SearchResults from "../SearchResults";
import SearchResult from "../../../../model/SearchResult";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import TermResultVocabularyFilter from "../TermResultVocabularyFilter";

jest.mock("../TermResultVocabularyFilter", () => () => (
  <div>Vocabulary filter</div>
));
jest.mock("../SearchResults", () => () => <div>Results</div>);

describe("SearchTerms", () => {
  let dispatchFunctions: {
    addSearchListener: () => void;
    removeSearchListener: () => void;
    updateSearchFilter: (searchString: string) => any;
  };

  beforeEach(() => {
    dispatchFunctions = {
      addSearchListener: jest.fn(),
      removeSearchListener: jest.fn(),
      updateSearchFilter: jest.fn(),
    };
  });

  it("renders only term results", () => {
    const results = generateSearchResults([]);
    const wrapper = mountWithIntl(
      <SearchTerms
        {...dispatchFunctions}
        searchQuery={new SearchQuery()}
        searchResults={results}
        searchInProgress={false}
        {...intlFunctions()}
      />
    );

    const renderedResults = wrapper.find(SearchResults).props().results;
    expect(renderedResults.length).toBeGreaterThan(0);
    renderedResults.forEach((rr) => {
      expect(rr.types).toEqual([VocabularyUtils.TERM]);
    });
  });

  it("renders only results matching selected vocabularies", () => {
    const selectedVocabularies = [
      Generator.generateUri(),
      Generator.generateUri(),
    ];
    const results = generateSearchResults(selectedVocabularies);
    const wrapper = mountWithIntl(
      <SearchTerms
        {...dispatchFunctions}
        searchQuery={new SearchQuery()}
        searchResults={results}
        searchInProgress={false}
        {...intlFunctions()}
      />
    );
    (wrapper.find(TermResultVocabularyFilter).prop("onChange") as any)(
      selectedVocabularies
    );
    wrapper.update();

    const renderedResults = wrapper.find(SearchResults).props().results;
    expect(renderedResults.length).toBeGreaterThan(0);
    renderedResults.forEach((rr) => {
      expect(rr.vocabulary).toBeDefined();
      expect(selectedVocabularies.indexOf(rr.vocabulary!.iri)).not.toEqual(-1);
    });
  });

  function generateSearchResults(vocabularies: string[]) {
    const results: SearchResult[] = [];
    const count = Generator.randomInt(10, 20);
    let hasTermResult = false;
    let hasVocabularyResult = false;
    for (let i = 0; i < count; i++) {
      if (
        hasVocabularyResult &&
        (!hasTermResult || Generator.randomBoolean())
      ) {
        results.push(
          new SearchResult({
            iri: Generator.generateUri(),
            label: `Test ${i}`,
            snippetText: "Matching result",
            snippetField: "label",
            vocabulary: {
              iri:
                vocabularies.length > 0 && Generator.randomBoolean()
                  ? vocabularies[i % vocabularies.length]
                  : Generator.generateUri(),
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
