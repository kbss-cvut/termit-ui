import Generator from "../../../__tests__/environment/Generator";
import Term, { TermInfo } from "../../../model/Term";
import { langString } from "../../../model/MultilingualString";
import * as redux from "react-redux";
import { DefinitionallyRelatedTerms } from "../../../model/TermItState";
import {
  flushPromises,
  mountWithIntl,
} from "../../../__tests__/environment/Environment";
import RelatedTermsList from "../RelatedTermsList";
import Constants from "../../../util/Constants";
import TermLink from "../TermLink";
import { MemoryRouter } from "react-router";
import { Badge } from "reactstrap";
import { ReactWrapper } from "enzyme";
import { i18n } from "../../../__tests__/environment/IntlUtil";
import { act } from "react-dom/test-utils";
import VocabularyUtils from "../../../util/VocabularyUtils";

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useSelector: jest.fn(),
  useDispatch: jest.fn(),
}));

describe("RelatedTermsList", () => {
  let term: Term;

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
    (redux.useSelector as jest.Mock).mockReturnValue(defRelatedTerms);
    const fakeDispatch = jest.fn().mockResolvedValue(relatedTerm);
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);

    const wrapper = mountWithIntl(
      <MemoryRouter>
        <RelatedTermsList term={term} language={Constants.DEFAULT_LANGUAGE} />
      </MemoryRouter>
    );
    const links = wrapper.find(TermLink);
    expect(links.length).toEqual(2);
    const badges = wrapper.find(Badge);
    expect(
      badges.filterWhere(
        (b: ReactWrapper) =>
          b.text().indexOf(i18n("term.metadata.definition")) !== -1
      ).length
    ).toEqual(1);
  });

  it("renders only definition related terms targeting current term", async () => {
    const defRelatedTerm = Generator.generateTerm();
    const defRelatedTerms: DefinitionallyRelatedTerms = {
      targeting: [Generator.generateOccurrenceOf(defRelatedTerm)],
      of: [],
    };
    defRelatedTerms.targeting[0].target.source.iri = term.iri;
    (redux.useSelector as jest.Mock).mockReturnValue(defRelatedTerms);
    const fakeDispatch = jest.fn().mockResolvedValue(defRelatedTerm);
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);

    const wrapper = mountWithIntl(
      <MemoryRouter>
        <RelatedTermsList term={term} language={Constants.DEFAULT_LANGUAGE} />
      </MemoryRouter>
    );
    await act(async () => flushPromises());
    wrapper.update();
    const links = wrapper.find(TermLink);
    expect(links.length).toEqual(1);
    const badges = wrapper.find(Badge);
    expect(
      badges.filterWhere(
        (b: ReactWrapper) =>
          b.text().indexOf(i18n("term.metadata.definition")) !== -1
      ).length
    ).toEqual(1);
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
    (redux.useSelector as jest.Mock).mockReturnValue(defRelatedTerms);
    const fakeDispatch = jest.fn().mockResolvedValue(defRelatedTerm);
    (redux.useDispatch as jest.Mock).mockReturnValue(fakeDispatch);

    const wrapper = mountWithIntl(
      <MemoryRouter>
        <RelatedTermsList term={term} language={Constants.DEFAULT_LANGUAGE} />
      </MemoryRouter>
    );
    await act(async () => flushPromises());
    wrapper.update();
    expect(wrapper.exists(TermLink)).toBeFalsy();
  });
});
