import { ReactWrapper } from "enzyme";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import TermResultVocabularyFilter from "../TermResultVocabularyFilter";
import Generator from "../../../../__tests__/environment/Generator";
import SearchResult from "../../../../model/SearchResult";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import * as redux from "react-redux";
import { ThunkDispatch } from "../../../../util/Types";
import { act } from "react-dom/test-utils";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import * as AsyncActions from "../../../../action/AsyncActions";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

describe("TermResultVocabularyFilter", () => {
  let onChange: (selectedVocabularies: string[]) => void;

  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    onChange = jest.fn();
    fakeDispatch = jest.fn().mockResolvedValue("Test");
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);
  });

  it("renders selector containing unique vocabularies discovered in search results", async () => {
    const vocabularies = [
      Generator.generateUri(),
      Generator.generateUri(),
      Generator.generateUri(),
    ];
    const results = generateResults(vocabularies);
    let wrapper: ReactWrapper;
    await act(async () => {
      wrapper = mountWithIntl(
        <TermResultVocabularyFilter
          searchResults={results}
          selectedVocabularies={[]}
          onChange={onChange}
        />
      );
    });
    wrapper!.update();
    const treeSelect = wrapper!.find(IntelligentTreeSelect);
    const options = (treeSelect.props() as any).options;
    expect(options.map((o: any) => o.value)).toEqual(vocabularies);
  });

  function generateResults(vocabularies: string[]) {
    const results: SearchResult[] = [];
    for (let i = 0; i < 3 * vocabularies.length; i++) {
      results.push(
        new SearchResult({
          iri: Generator.generateUri(),
          label: `Test ${i}`,
          snippetField: "label",
          snippetText: "Snippet text containing <em>matching</em> string",
          vocabulary: { iri: vocabularies[i % vocabularies.length] },
          types: [VocabularyUtils.TERM],
        })
      );
    }
    return results;
  }

  it("handles vocabulary search results when extracting vocabulary IRIs from results", async () => {
    const vocUri = Generator.generateUri();
    const results: SearchResult[] = generateResults([vocUri]);
    results.push(
      new SearchResult({
        iri: Generator.generateUri(),
        label: "Test vocabulary",
        snippetField: "label",
        snippetText: "Matching text",
        types: [VocabularyUtils.VOCABULARY],
      })
    );

    let wrapper: ReactWrapper;
    await act(async () => {
      wrapper = mountWithIntl(
        <TermResultVocabularyFilter
          searchResults={results}
          selectedVocabularies={[]}
          onChange={onChange}
        />
      );
    });
    wrapper!.update();
    const treeSelect = wrapper!.find(IntelligentTreeSelect);
    const options = (treeSelect.props() as any).options;
    expect(options.map((o: any) => o.value)).toEqual([vocUri]);
  });

  it("fetches labels of vocabularies discovered in results", async () => {
    jest.spyOn(AsyncActions, "getLabel");
    const vocabularies = [
      Generator.generateUri(),
      Generator.generateUri(),
      Generator.generateUri(),
    ];
    const results = generateResults(vocabularies);
    await act(async () => {
      mountWithIntl(
        <TermResultVocabularyFilter
          searchResults={results}
          selectedVocabularies={[]}
          onChange={onChange}
        />
      );
    });
    vocabularies.forEach((v) =>
      expect(AsyncActions.getLabel).toHaveBeenCalledWith(v)
    );
  });
});
