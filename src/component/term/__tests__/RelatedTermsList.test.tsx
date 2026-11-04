import Generator from "../../../__tests__/environment/Generator";
import Term, { TermInfo } from "../../../model/Term";
import { langString } from "../../../model/MultilingualString";
import * as redux from "react-redux";
import { DefinitionallyRelatedTerms } from "../../../model/TermItState";
import {
  flushPromises,
  renderWithIntl,
} from "../../../__tests__/environment/Environment";
import RelatedTermsList from "../RelatedTermsList";
import Constants from "../../../util/Constants";
import { MemoryRouter } from "react-router";
import { i18n } from "../../../__tests__/environment/IntlUtil";
import { act } from "react-dom/test-utils";
import VocabularyUtils from "../../../util/VocabularyUtils";
import type { Mock } from "vitest";

vi.mock("react-redux", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useSelector: vi.fn(),
    useDispatch: vi.fn(),
  };
});
vi.mock("../../vocabulary/VocabularyNameBadgeButton", () => ({
  default: () => <span>vocabulary-name</span>,
}));
vi.mock("../relationship-annotation/RelationshipAnnotationButton", () => ({
  RelationshipAnnotationButton: () => null,
}));

describe("RelatedTermsList", () => {
  let term: Term;

  function definitionBadges(container: HTMLElement) {
    return Array.from(container.querySelectorAll(".badge")).filter(
      (b) => b.textContent!.indexOf(i18n("term.metadata.definition")) !== -1
    );
  }

  beforeEach(() => {
    term = Generator.generateTerm(Generator.generateUri());
  });

  it("renders term related and related via definition twice, once without badge and once with definition badge", () => {
    const relatedTerm: TermInfo = {
      iri: Generator.generateUri(),
      label: langString("Related term"),
      vocabulary: { iri: Generator.generateUri() },
    };
    term.relatedTerms = [relatedTerm];
    const defRelatedTerms: DefinitionallyRelatedTerms = {
      targeting: [Generator.generateOccurrenceOf(relatedTerm)],
      of: [],
    };
    defRelatedTerms.targeting[0].target.source.iri = term.iri;
    (redux.useSelector as Mock).mockReturnValue(defRelatedTerms);
    const fakeDispatch = vi.fn().mockResolvedValue(relatedTerm);
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);

    const { container } = renderWithIntl(
      <MemoryRouter>
        <RelatedTermsList term={term} language={Constants.DEFAULT_LANGUAGE} />
      </MemoryRouter>
    );
    const links = container.querySelectorAll("#term-metadata-related li");
    expect(links.length).toEqual(2);
    expect(definitionBadges(container).length).toEqual(1);
  });

  it("renders only definition related terms targeting current term", async () => {
    const defRelatedTerm = Generator.generateTerm();
    const defRelatedTerms: DefinitionallyRelatedTerms = {
      targeting: [Generator.generateOccurrenceOf(defRelatedTerm)],
      of: [],
    };
    defRelatedTerms.targeting[0].target.source.iri = term.iri;
    (redux.useSelector as Mock).mockReturnValue(defRelatedTerms);
    const fakeDispatch = vi.fn().mockResolvedValue(defRelatedTerm);
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);

    const { container } = renderWithIntl(
      <MemoryRouter>
        <RelatedTermsList term={term} language={Constants.DEFAULT_LANGUAGE} />
      </MemoryRouter>
    );
    await act(async () => flushPromises());
    const links = container.querySelectorAll("#term-metadata-related li");
    expect(links.length).toEqual(1);
    expect(definitionBadges(container).length).toEqual(1);
  });

  it("renders only confirmed definition related terms targeting current term", async () => {
    const defRelatedTerm = Generator.generateTerm();
    const defRelatedTerms: DefinitionallyRelatedTerms = {
      targeting: [Generator.generateOccurrenceOf(defRelatedTerm)],
      of: [],
    };
    defRelatedTerms.targeting[0].target.source.iri = term.iri;
    defRelatedTerms.targeting[0].types = [
      VocabularyUtils.SUGGESTED_TERM_OCCURRENCE,
    ];
    (redux.useSelector as Mock).mockReturnValue(defRelatedTerms);
    const fakeDispatch = vi.fn().mockResolvedValue(defRelatedTerm);
    (redux.useDispatch as Mock).mockReturnValue(fakeDispatch);

    const { container } = renderWithIntl(
      <MemoryRouter>
        <RelatedTermsList term={term} language={Constants.DEFAULT_LANGUAGE} />
      </MemoryRouter>
    );
    await act(async () => flushPromises());
    expect(
      container.querySelectorAll("#term-metadata-related li").length
    ).toEqual(0);
  });
});
