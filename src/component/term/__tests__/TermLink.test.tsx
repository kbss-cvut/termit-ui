import { MemoryRouter } from "react-router-dom";
import Term from "../../../model/Term";
import { TermLink } from "../TermLink";
import {
  mockStore,
  renderWithIntl,
} from "../../../__tests__/environment/Environment";
import Vocabulary from "../../../model/Vocabulary";
import Generator from "../../../__tests__/environment/Generator";
import { EMPTY_USER } from "../../../model/User";
import MultilingualString, {
  langString,
} from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import TermItState from "../../../model/TermItState";
import cs from "../../../i18n/cs";
import * as redux from "react-redux";
import TermItStore from "../../../store/TermItStore";
import type { Mock } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
  };
});

describe("TermLink", () => {
  const vocFragment = "localVocabularyFragment";
  const vocNamespace = "http://test.org/";
  let testVocabulary: Vocabulary;

  function renderLink(term: Term, language?: string, intl?: any) {
    return renderWithIntl(
      <MemoryRouter>
        <TermLink term={term} language={language} />
      </MemoryRouter>,
      undefined,
      intl
    );
  }

  function internalLink(container: HTMLElement) {
    return container.querySelector('a[href^="/"]') as HTMLAnchorElement;
  }

  beforeEach(() => {
    testVocabulary = new Vocabulary({
      label: langString("Test vocabulary"),
      iri: vocNamespace + vocFragment,
    });
    (redux.useSelector as Mock).mockReturnValue(Generator.generateUser());
  });

  afterEach(() => {
    TermItStore.getState().user = new TermItState().user;
  });

  it("links to correct internal asset", () => {
    TermItStore.getState().user = Generator.generateUser();
    const termFragment = "localTermFragment";
    const term = new Term({
      label: langString("Test term"),
      iri: `${testVocabulary.iri}/pojem/${termFragment}`,
      vocabulary: testVocabulary,
    });

    const { container } = renderLink(term);
    expect(internalLink(container).getAttribute("href")).toEqual(
      `/vocabularies/${vocFragment}/terms/${termFragment}?namespace=${encodeURIComponent(
        vocNamespace
      )}`
    );
  });

  it("render outgoing link when term is missing vocabulary", () => {
    const term = new Term({
      iri: Generator.generateUri(),
      label: langString("Term without vocabulary"),
    });
    const { container } = renderLink(term);
    expect(internalLink(container)).toBeNull();
    expect(
      container.querySelector("a i.fas.fa-external-link-alt")
    ).toBeInTheDocument();
  });

  it("links to public term view when user is not logged in", () => {
    const termFragment = "localTermFragment";
    const term = new Term({
      label: langString("Test term"),
      iri: `${testVocabulary.iri}/pojem/${termFragment}`,
      vocabulary: testVocabulary,
    });
    vi.spyOn(redux, "useSelector").mockReturnValue(EMPTY_USER);

    const { container } = renderLink(term);
    expect(internalLink(container).getAttribute("href")).toEqual(
      `/public/vocabularies/${vocFragment}/terms/${termFragment}?namespace=${encodeURIComponent(
        vocNamespace
      )}`
    );
  });

  it("does not change term in props when dealing with multilingual labels", () => {
    const originalLabel: MultilingualString = {
      en: "Test term",
      cs: "Testovaci pojem",
    };
    const term = new Term({
      label: originalLabel,
      iri: `${testVocabulary.iri}/pojem/localTestFragment`,
      vocabulary: testVocabulary,
    });

    renderLink(term);
    expect(term.label).toEqual(originalLabel);
  });

  it("renders link with label in language corresponding to current locale", () => {
    const term = new Term({
      label: {
        en: "Test term",
        cs: "Testovaci pojem",
      },
      iri: `${testVocabulary.iri}/pojem/localTestFragment`,
      vocabulary: testVocabulary,
    });

    (mockStore.getState() as TermItState).intl.locale =
      Constants.LANG.CS.locale;
    (mockStore.getState() as TermItState).intl.messages = cs.messages;
    const { container } = renderLink(term, undefined, cs);
    expect(internalLink(container).textContent).toEqual(term.label.cs);
  });

  it("uses provided language to render link label instead of current locale", () => {
    const term = new Term({
      label: {
        en: "Test term",
        cs: "Testovaci pojem",
      },
      iri: `${testVocabulary.iri}/pojem/localTestFragment`,
      vocabulary: testVocabulary,
    });

    const { container } = renderLink(term, "cs");
    expect(internalLink(container).textContent).toEqual(term.label.cs);
  });
});
