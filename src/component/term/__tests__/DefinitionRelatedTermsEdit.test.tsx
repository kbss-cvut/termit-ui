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

describe("DefinitionRelatedTermsEdit", () => {
  let term: Term;
  let onAddRelated: (toAdd: Term[]) => void;
  let pending: DefinitionRelatedChanges;
  let onChange: (change: DefinitionRelatedChanges) => void;

  let loadTermByIri: (iri: IRI) => Promise<Term | null>;

  beforeEach(() => {
    term = Generator.generateTerm();
    onAddRelated = jest.fn();
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
    (loadTermByIri as jest.Mock).mockResolvedValue(t);
    const wrapper = shallow(
      <DefinitionRelatedTermsEdit
        term={term}
        onAddRelated={onAddRelated}
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
    expect(wrapper.find(DefinitionalTermOccurrence).length).toEqual(1);
  });

  it("renders approved occurrences before suggested ones", () => {
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
    const wrapper = shallow(
      <DefinitionRelatedTermsEdit
        term={term}
        onAddRelated={onAddRelated}
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
    return Promise.resolve().then(() => {
      const rows = wrapper.find(DefinitionalTermOccurrence);
      expect(rows.get(0).props.term).toEqual(t2);
      expect(rows.get(1).props.term).toEqual(t1);
    });
  });

  describe("onApprove", () => {
    it("adds all occurrences targeting the same term to pending approvals", () => {
      const occurrences = [
        Generator.generateOccurrenceOf(term),
        Generator.generateOccurrenceOf(term),
        Generator.generateOccurrenceOf(term),
      ];
      const t = Generator.generateTerm();
      occurrences.forEach((o) => (o.target.source = { iri: t.iri }));
      (loadTermByIri as jest.Mock).mockResolvedValue(t);
      const wrapper = shallow<DefinitionRelatedTermsEdit>(
        <DefinitionRelatedTermsEdit
          term={term}
          onAddRelated={onAddRelated}
          pending={pending}
          onChange={onChange}
          loadTermByIri={loadTermByIri}
          definitionRelatedTerms={{
            of: occurrences,
            targeting: [],
          }}
          {...intlFunctions()}
        />
      );
      wrapper.instance().onApprove(occurrences[0]);
      expect(onChange).toHaveBeenCalled();
      expect((onChange as jest.Mock).mock.calls[0][0].pendingApproval).toEqual(
        occurrences
      );
    });

    it("adds all occurrences of the same term to pending approvals", () => {
      const t = Generator.generateTerm();
      const occurrences = [
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
      ];
      (loadTermByIri as jest.Mock).mockResolvedValue(t);
      const wrapper = shallow<DefinitionRelatedTermsEdit>(
        <DefinitionRelatedTermsEdit
          term={term}
          onAddRelated={onAddRelated}
          pending={pending}
          onChange={onChange}
          loadTermByIri={loadTermByIri}
          definitionRelatedTerms={{
            of: [],
            targeting: occurrences,
          }}
          {...intlFunctions()}
        />
      );
      wrapper.instance().onApprove(occurrences[0]);
      expect(onChange).toHaveBeenCalled();
      expect((onChange as jest.Mock).mock.calls[0][0].pendingApproval).toEqual(
        occurrences
      );
    });

    it("adds term related via occurrence on approval", () => {
      const occurrences = [
        Generator.generateOccurrenceOf(term),
        Generator.generateOccurrenceOf(term),
        Generator.generateOccurrenceOf(term),
      ];
      const t = Generator.generateTerm();
      occurrences.forEach((o) => (o.target.source = { iri: t.iri }));
      (loadTermByIri as jest.Mock).mockResolvedValue(t);
      const wrapper = shallow<DefinitionRelatedTermsEdit>(
        <DefinitionRelatedTermsEdit
          term={term}
          onAddRelated={onAddRelated}
          pending={pending}
          onChange={onChange}
          loadTermByIri={loadTermByIri}
          definitionRelatedTerms={{
            of: occurrences,
            targeting: [],
          }}
          {...intlFunctions()}
        />
      );
      return Promise.resolve().then(() => {
        wrapper.instance().onApprove(occurrences[0]);
        expect(onAddRelated).toHaveBeenCalledWith([t]);
      });
    });
  });

  describe("onRemove", () => {
    it("adds all occurrences targeting the same term to pending removals", () => {
      const occurrences = [
        Generator.generateOccurrenceOf(term),
        Generator.generateOccurrenceOf(term),
        Generator.generateOccurrenceOf(term),
      ];
      const t = Generator.generateTerm();
      occurrences.forEach((o) => (o.target.source = { iri: t.iri }));
      (loadTermByIri as jest.Mock).mockResolvedValue(t);
      const wrapper = shallow<DefinitionRelatedTermsEdit>(
        <DefinitionRelatedTermsEdit
          term={term}
          onAddRelated={onAddRelated}
          pending={pending}
          onChange={onChange}
          loadTermByIri={loadTermByIri}
          definitionRelatedTerms={{
            of: occurrences,
            targeting: [],
          }}
          {...intlFunctions()}
        />
      );
      wrapper.instance().onRemove(occurrences[0]);
      expect(onChange).toHaveBeenCalled();
      expect((onChange as jest.Mock).mock.calls[0][0].pendingRemoval).toEqual(
        occurrences
      );
    });

    it("adds all occurrences of the same term to pending removals", () => {
      const t = Generator.generateTerm();
      const occurrences = [
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
        Generator.generateOccurrenceOf(t),
      ];
      (loadTermByIri as jest.Mock).mockResolvedValue(t);
      const wrapper = shallow<DefinitionRelatedTermsEdit>(
        <DefinitionRelatedTermsEdit
          term={term}
          onAddRelated={onAddRelated}
          pending={pending}
          onChange={onChange}
          loadTermByIri={loadTermByIri}
          definitionRelatedTerms={{
            of: [],
            targeting: occurrences,
          }}
          {...intlFunctions()}
        />
      );
      wrapper.instance().onRemove(occurrences[0]);
      expect(onChange).toHaveBeenCalled();
      expect((onChange as jest.Mock).mock.calls[0][0].pendingRemoval).toEqual(
        occurrences
      );
    });

    it("removes occurrences of the term from pending approvals", () => {
      const occurrences = [
        Generator.generateOccurrenceOf(term),
        Generator.generateOccurrenceOf(term),
        Generator.generateOccurrenceOf(term),
      ];
      const t = Generator.generateTerm();
      occurrences.forEach((o) => (o.target.source = { iri: t.iri }));
      (loadTermByIri as jest.Mock).mockResolvedValue(t);
      pending.pendingApproval = [...occurrences];
      const wrapper = shallow<DefinitionRelatedTermsEdit>(
        <DefinitionRelatedTermsEdit
          term={term}
          onAddRelated={onAddRelated}
          pending={pending}
          onChange={onChange}
          loadTermByIri={loadTermByIri}
          definitionRelatedTerms={{
            of: occurrences,
            targeting: [],
          }}
          {...intlFunctions()}
        />
      );
      wrapper.instance().onRemove(occurrences[0]);
      expect(onChange).toHaveBeenCalled();
      expect((onChange as jest.Mock).mock.calls[0][0].pendingRemoval).toEqual(
        occurrences
      );
      expect((onChange as jest.Mock).mock.calls[0][0].pendingApproval).toEqual(
        []
      );
    });
  });
});
