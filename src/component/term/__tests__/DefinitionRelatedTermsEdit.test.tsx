import Term from "../../../model/Term";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import Generator from "../../../__tests__/environment/Generator";
import {
  DefinitionalTermOccurrence,
  DefinitionRelatedChanges,
  DefinitionRelatedTermsEdit,
} from "../DefinitionRelatedTermsEdit";
import { shallow } from "enzyme";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import TermOccurrence from "../../../model/TermOccurrence";
import Constants from "../../../util/Constants";

describe("DefinitionRelatedTermsEdit", () => {
  let term: Term;
  let pending: DefinitionRelatedChanges;
  let onChange: (change: DefinitionRelatedChanges) => void;

  let loadTermByIri: (iri: IRI) => Promise<Term | null>;

  beforeEach(() => {
    term = Generator.generateTerm();
    pending = { pendingApproval: [], pendingRemoval: [] };
    onChange = jest.fn();
    loadTermByIri = jest.fn();
  });

  it("renders only unique terms which occurred in the term's definition", () => {
    const t = Generator.generateTerm();
    const occurrences = [
      Generator.generateOccurrenceOf(t),
      Generator.generateOccurrenceOf(t),
      Generator.generateOccurrenceOf(t),
    ];
    occurrences.forEach((o) =>
      o.types.push(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE)
    );
    (loadTermByIri as jest.Mock).mockResolvedValue(t);
    const wrapper = render(occurrences);

    expect(wrapper.find(DefinitionalTermOccurrence).length).toEqual(1);
  });

  function render(occurrences: TermOccurrence[]) {
    return shallow<DefinitionRelatedTermsEdit>(
      <DefinitionRelatedTermsEdit
        term={term}
        language={Constants.DEFAULT_LANGUAGE}
        loadTermByIri={loadTermByIri}
        pending={pending}
        onChange={onChange}
        definitionRelatedTerms={{
          of: [],
          targeting: occurrences,
        }}
        {...intlFunctions()}
      />
    );
  }

  it("renders nothing when there are no definitional occurrences targeting current term", () => {
    const wrapper = render([]);
    expect(wrapper.type()).toEqual(null);
  });

  it("renders both suggested and approved occurrences", () => {
    const t1 = Generator.generateTerm();
    const t2 = Generator.generateTerm();
    const occurrences = [
      Generator.generateOccurrenceOf(t1),
      Generator.generateOccurrenceOf(t2),
    ];
    occurrences[0].types.push(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE);
    (loadTermByIri as jest.Mock)
      .mockResolvedValueOnce(t1)
      .mockResolvedValueOnce(t2);
    const wrapper = render(occurrences);

    return Promise.resolve().then(() => {
      const rows = wrapper.find(DefinitionalTermOccurrence);
      expect(rows.length).toEqual(occurrences.length);
    });
  });

  it("renders approved terms before suggested ones", () => {
    const t1 = Generator.generateTerm();
    const t2 = Generator.generateTerm();
    const occurrences = [
      Generator.generateOccurrenceOf(t1),
      Generator.generateOccurrenceOf(t2),
    ];
    occurrences[0].types.push(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE);
    (loadTermByIri as jest.Mock)
      .mockResolvedValueOnce(t1)
      .mockResolvedValueOnce(t2);
    const wrapper = render(occurrences);

    return Promise.resolve().then(() => {
      const rows = wrapper.find(DefinitionalTermOccurrence);
      expect(rows.length).toEqual(occurrences.length);
      expect(rows.get(0).props.occurrence.iri).toEqual(occurrences[1].iri);
      expect(rows.get(1).props.occurrence.iri).toEqual(occurrences[0].iri);
    });
  });

  it("does not render terms pending removal", () => {
    const t1 = Generator.generateTerm();
    const occurrences = [Generator.generateOccurrenceOf(t1)];
    occurrences[0].types.push(VocabularyUtils.SUGGESTED_TERM_OCCURRENCE);
    pending.pendingRemoval = [occurrences[0]];
    (loadTermByIri as jest.Mock).mockResolvedValueOnce(t1);
    const wrapper = render(occurrences);

    return Promise.resolve().then(() => {
      expect(wrapper.exists(DefinitionalTermOccurrence)).toBeFalsy();
    });
  });

  describe("onApprove", () => {
    it("adds all occurrences of the same term to pending approvals", () => {
      const t = Generator.generateTerm();
      const occurrences = [
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
      ];
      (loadTermByIri as jest.Mock).mockResolvedValue(t);
      const wrapper = render(occurrences);

      wrapper.instance().onApprove(occurrences[0]);
      expect(onChange).toHaveBeenCalled();
      expect((onChange as jest.Mock).mock.calls[0][0].pendingApproval).toEqual(
        occurrences
      );
    });
  });

  describe("onRemove", () => {
    it("adds all occurrences of the same term to pending removals", () => {
      const t = Generator.generateTerm();
      const occurrences = [
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
      ];
      (loadTermByIri as jest.Mock).mockResolvedValue(t);
      const wrapper = render(occurrences);

      wrapper.instance().onRemove(occurrences[0]);
      expect(onChange).toHaveBeenCalled();
      expect((onChange as jest.Mock).mock.calls[0][0].pendingRemoval).toEqual(
        occurrences
      );
    });
  });
});
