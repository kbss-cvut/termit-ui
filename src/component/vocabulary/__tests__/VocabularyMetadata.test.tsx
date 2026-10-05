import Vocabulary from "../../../model/Vocabulary";
import Document from "../../../model/Document";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { VocabularyMetadata } from "../VocabularyMetadata";
import { shallow } from "enzyme";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import {
  flushPromises,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import { act } from "react-dom/test-utils";
import { Location } from "history";
import { match as Match } from "react-router";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import * as redux from "react-redux";
import * as SyncActions from "../../../action/SyncActions";
import { ThunkDispatch } from "../../../util/Types";
import type { Mock } from "vitest";
import Tabs from "../../misc/Tabs";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useDispatch: vi.fn(),
  };
});
vi.mock("../../misc/Tabs", () => ({
  default: () => <div className="tabs" />,
}));

describe("VocabularyMetadata", () => {
  const normalizedVocabularyName = "test-vocabulary";

  let onChange: () => void;
  let fakeDispatch: ThunkDispatch;

  let vocabulary: Vocabulary;

  let location: Location;
  let match: Match<any>;

  beforeEach(() => {
    mockUseI18n();
    onChange = vi.fn();
    fakeDispatch = vi.fn().mockResolvedValue({});
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);
    vocabulary = new Vocabulary({
      iri: Generator.generateUri(),
      label: langString("Test vocabulary"),
      types: [VocabularyUtils.VOCABULARY],
    });

    location = {
      pathname: "/vocabularies/" + normalizedVocabularyName,
      search: "?namespace=" + normalizedVocabularyName,
      hash: "",
      state: {},
    };
    match = {
      params: {
        name: normalizedVocabularyName,
      },
      path: location.pathname,
      isExact: true,
      url: "http://localhost:3000/" + location.pathname,
    };
  });

  it("sets selected tab to terms tab on mount", () => {
    vocabulary.document = new Document({
      iri: Generator.generateUri(),
      label: "Test document",
      files: [],
      types: [VocabularyUtils.RESOURCE, VocabularyUtils.DOCUMENT],
    });
    const wrapper = shallow(
      <VocabularyMetadata
        vocabulary={vocabulary}
        location={location}
        match={match}
        language={Constants.DEFAULT_LANGUAGE}
        selectLanguage={vi.fn()}
        onChange={onChange}
      />
    );
    expect(wrapper.find(Tabs).prop("activeTabLabelKey")).toEqual(
      "glossary.title"
    );
  });

  it("resets selected term on mount", async () => {
    vi.spyOn(SyncActions, "selectVocabularyTerm");
    vocabulary.document = new Document({
      iri: Generator.generateUri(),
      label: "Test document",
      files: [],
      types: [VocabularyUtils.RESOURCE, VocabularyUtils.DOCUMENT],
    });
    mountWithIntl(
      <VocabularyMetadata
        vocabulary={vocabulary}
        location={location}
        match={match}
        language={Constants.DEFAULT_LANGUAGE}
        selectLanguage={vi.fn()}
        onChange={onChange}
      />
    );
    await act(async () => {
      await flushPromises();
    });
    expect(SyncActions.selectVocabularyTerm).toHaveBeenCalledWith(null);
    expect(fakeDispatch).toHaveBeenCalled();
  });
});
