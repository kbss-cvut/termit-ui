import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import FacetedSearch from "../FacetedSearch";
import * as Redux from "react-redux";
import SimplePagination from "../../../dashboard/widget/lastcommented/SimplePagination";
import SearchParam, { MatchType } from "../../../../model/search/SearchParam";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import TextFacet from "../TextFacet";
import * as SearchActions from "../../../../action/SearchActions";
import Generator from "../../../../__tests__/environment/Generator";
import { langString } from "../../../../model/MultilingualString";
import { ThunkDispatch } from "../../../../util/Types";
import { act } from "react-dom/test-utils";
import Constants from "../../../../util/Constants";
import TermTypeFacet from "../TermTypeFacet";
import FacetedSearchResults from "../FacetedSearchResults";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: jest.fn(),
}));

jest.mock("../FacetedSearchResultItem", () => () => (
  <tr>
    <td>Result item</td>
  </tr>
));
jest.mock("../TermTypeFacet", () => () => <div>Term type selector</div>);
jest.mock("../VocabularyFacet", () => () => <div>Vocabulary selector</div>);
jest.mock("../TextFacet", () => () => <div>Text facet</div>);

describe("FacetedSearch", () => {
  let fakeDispatch: ThunkDispatch;

  beforeEach(() => {
    fakeDispatch = jest.fn();
    jest.spyOn(Redux, "useDispatch").mockReturnValue(fakeDispatch);
  });

  it("resets paging when search params change", async () => {
    jest.spyOn(SearchActions, "executeFacetedTermSearch");
    mockResults();
    const wrapper = mountWithIntl(<FacetedSearch />);
    const firstNotationValue: SearchParam = {
      property: VocabularyUtils.SKOS_NOTATION,
      value: ["a"],
      matchType: MatchType.SUBSTRING,
    };
    await act(async () => {
      wrapper.find(TextFacet).at(0).prop("onChange")(firstNotationValue);
    });
    wrapper.update();
    act(() => {
      wrapper.find(SimplePagination).prop("setPage")(2);
    });
    const secondNotationValue: SearchParam = {
      property: VocabularyUtils.SKOS_NOTATION,
      value: ["ab"],
      matchType: MatchType.SUBSTRING,
    };
    await act(async () => {
      wrapper.find(TextFacet).at(0).prop("onChange")(secondNotationValue);
    });
    wrapper.update();
    expect(wrapper.find(SimplePagination).prop("page")).toEqual(0);
  });

  function mockResults() {
    (fakeDispatch as jest.Mock).mockResolvedValue([
      {
        iri: Generator.generateUri(),
        label: langString("Match ab"),
        types: [VocabularyUtils.TERM],
      },
    ]);
  }

  it("runs search on page change", async () => {
    jest.spyOn(SearchActions, "executeFacetedTermSearch");
    mockResults();
    const wrapper = mountWithIntl(<FacetedSearch />);
    const firstNotationValue: SearchParam = {
      property: VocabularyUtils.SKOS_NOTATION,
      value: ["a"],
      matchType: MatchType.SUBSTRING,
    };
    await act(async () => {
      wrapper.find(TextFacet).at(0).prop("onChange")(firstNotationValue);
    });
    wrapper.update();
    (SearchActions.executeFacetedTermSearch as jest.Mock).mockReset();
    await act(async () => {
      wrapper.find(SimplePagination).prop("setPage")(2);
    });
    expect(SearchActions.executeFacetedTermSearch).toHaveBeenCalledWith(
      expect.anything(),
      {
        page: 2,
        size: Constants.DEFAULT_PAGE_SIZE,
      }
    );
  });

  it("invokes search with non-empty search params", async () => {
    const type = Generator.generateUri();
    jest.spyOn(SearchActions, "executeFacetedTermSearch");
    (fakeDispatch as jest.Mock).mockResolvedValue([
      {
        iri: Generator.generateUri(),
        label: langString("Match ab"),
        types: [VocabularyUtils.TERM, type],
      },
    ]);
    const wrapper = mountWithIntl(<FacetedSearch />);
    const typeParamValue: SearchParam = {
      property: VocabularyUtils.RDF_TYPE,
      value: [type],
      matchType: MatchType.IRI,
    };
    await act(async () => {
      wrapper.find(TermTypeFacet).prop("onChange")(typeParamValue);
    });
    expect(SearchActions.executeFacetedTermSearch).toHaveBeenCalledWith(
      [typeParamValue],
      {
        page: 0,
        size: Constants.DEFAULT_PAGE_SIZE,
      }
    );
  });

  it("clears results when search params are cleared", async () => {
    jest.spyOn(SearchActions, "executeFacetedTermSearch");
    mockResults();
    const wrapper = mountWithIntl(<FacetedSearch />);
    const firstNotationValue: SearchParam = {
      property: VocabularyUtils.SKOS_NOTATION,
      value: ["a"],
      matchType: MatchType.SUBSTRING,
    };
    expect(wrapper.exists(FacetedSearchResults)).toBeFalsy();
    expect(wrapper.exists(SimplePagination)).toBeFalsy();
    await act(async () => {
      wrapper.find(TextFacet).at(0).prop("onChange")(firstNotationValue);
    });
    wrapper.update();
    act(() => {
      wrapper.find(SimplePagination).prop("setPage")(2);
    });
    expect(wrapper.exists(FacetedSearchResults)).toBeTruthy();
    expect(wrapper.exists(SimplePagination)).toBeTruthy();
    (SearchActions.executeFacetedTermSearch as jest.Mock).mockReset();
    const secondNotationValue: SearchParam = {
      property: VocabularyUtils.SKOS_NOTATION,
      value: [""],
      matchType: MatchType.SUBSTRING,
    };
    act(() => {
      wrapper.find(TextFacet).at(0).prop("onChange")(secondNotationValue);
    });
    await act(async () => {
      wrapper.update();
    });
    expect(SearchActions.executeFacetedTermSearch).not.toHaveBeenCalled();
    expect(wrapper.exists(FacetedSearchResults)).toBeFalsy();
    expect(wrapper.exists(SimplePagination)).toBeFalsy();
  });
});
