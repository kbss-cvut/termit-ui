import Vocabulary from "../../../model/Vocabulary";
import Document from "../../../model/Document";
import Generator from "../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { VocabularyMetadata } from "../VocabularyMetadata";
import { mockUseI18n } from "../../../__tests__/environment/IntlUtil";
import {
  flushPromises,
  renderWithIntl,
} from "../../../__tests__/environment/Environment";
import { act } from "react";
import { Location } from "history";
import { match as Match, MemoryRouter } from "react-router";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import * as redux from "react-redux";
import * as SyncActions from "../../../action/SyncActions";
import { ThunkDispatch, useAppSelector } from "../../../util/Types";
import type { Mock } from "vitest";
import { selectVocabularyLanguages } from "../../../store/StateSelectors";

vi.mock("../../../util/Types", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../util/Types")>()),
  useAppSelector: vi.fn(),
}));
vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useDispatch: vi.fn(),
  };
});
vi.mock("../../misc/Tabs", () => ({
  default: (props: { activeTabLabelKey?: string }) => (
    <div className="tabs" data-active-tab={props.activeTabLabelKey} />
  ),
}));
vi.mock("../../../store/StateSelectors", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../store/StateSelectors")>()),
  selectVocabularyLanguages: vi.fn(),
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
    (useAppSelector as Mock).mockImplementation((selector) =>
      selector({ customAttributes: [] })
    );
    (selectVocabularyLanguages as Mock).mockReturnValue([
      Constants.DEFAULT_LANGUAGE,
    ]);
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

  function renderMetadata() {
    return renderWithIntl(
      <MemoryRouter>
        <VocabularyMetadata
          vocabulary={vocabulary}
          location={location}
          match={match}
          language={Constants.DEFAULT_LANGUAGE}
          selectLanguage={vi.fn()}
          onChange={onChange}
        />
      </MemoryRouter>
    );
  }

  it("sets selected tab to terms tab on mount", () => {
    vocabulary.document = new Document({
      iri: Generator.generateUri(),
      label: "Test document",
      files: [],
      types: [VocabularyUtils.RESOURCE, VocabularyUtils.DOCUMENT],
    });
    const { container } = renderMetadata();
    expect(
      container.querySelector(".tabs")!.getAttribute("data-active-tab")
    ).toEqual("glossary.title");
  });

  it("resets selected term on mount", async () => {
    vi.spyOn(SyncActions, "selectVocabularyTerm");
    vocabulary.document = new Document({
      iri: Generator.generateUri(),
      label: "Test document",
      files: [],
      types: [VocabularyUtils.RESOURCE, VocabularyUtils.DOCUMENT],
    });
    renderMetadata();
    await act(async () => {
      await flushPromises();
    });
    expect(SyncActions.selectVocabularyTerm).toHaveBeenCalledWith(null);
    expect(fakeDispatch).toHaveBeenCalled();
  });
});
