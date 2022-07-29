import { Link, MemoryRouter } from "react-router-dom";
import Term from "../../../model/Term";
import { TermLink } from "../TermLink";
import {
  mockStore,
  mountWithIntl,
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

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
}));

describe("TermLink", () => {
  const vocFragment = "localVocabularyFragment";
  const vocNamespace = "http://test.org/";
  let testVocabulary: Vocabulary;

  beforeEach(() => {
    testVocabulary = new Vocabulary({
      label: "Test vocabulary",
      iri: vocNamespace + vocFragment,
    });
    (redux.useSelector as jest.Mock).mockReturnValue(Generator.generateUser());
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

    const link = mountWithIntl(
      <MemoryRouter>
        <TermLink term={term} />
      </MemoryRouter>
    ).find(Link);
    expect((link.props() as any).to).toEqual(
      `/vocabularies/${vocFragment}/terms/${termFragment}?namespace=${vocNamespace}`
    );
  });

  it("render outgoing link when term is missing vocabulary", () => {
    const term = new Term({
      iri: Generator.generateUri(),
      label: langString("Term without vocabulary"),
    });
    const wrapper = mountWithIntl(
      <MemoryRouter>
        <TermLink term={term} />
      </MemoryRouter>
    );
    expect(wrapper.find(Link).exists()).toBeFalsy();
    expect(
      wrapper.find("a").contains(
        <small>
          <i className="fas fa-external-link-alt text-primary" />
        </small>
      )
    ).toBeTruthy();
  });

  it("links to public term view when user is not logged in", () => {
    const termFragment = "localTermFragment";
    const term = new Term({
      label: langString("Test term"),
      iri: `${testVocabulary.iri}/pojem/${termFragment}`,
      vocabulary: testVocabulary,
    });
    jest.spyOn(redux, "useSelector").mockReturnValue(EMPTY_USER);

    const link = mountWithIntl(
      <MemoryRouter>
        <TermLink term={term} />
      </MemoryRouter>
    ).find(Link);
    expect((link.props() as any).to).toEqual(
      `/public/vocabularies/${vocFragment}/terms/${termFragment}?namespace=${vocNamespace}`
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

    mountWithIntl(
      <MemoryRouter>
        <TermLink term={term} />
      </MemoryRouter>
    ).find(Link);
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
    const link = mountWithIntl(
      <MemoryRouter>
        <TermLink term={term} />
      </MemoryRouter>,
      undefined,
      cs
    ).find(Link);
    expect(link.text()).toEqual(term.label.cs);
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

    const link = mountWithIntl(
      <MemoryRouter>
        <TermLink term={term} language="cs" />
      </MemoryRouter>
    ).find(Link);
    expect(link.text()).toEqual(term.label.cs);
  });
});
