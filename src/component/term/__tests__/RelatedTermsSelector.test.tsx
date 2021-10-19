import Term, { TermInfo } from "../../../model/Term";
import FetchOptionsFunction from "../../../model/Functions";
import { DefinitionRelatedChanges } from "../DefinitionRelatedTermsEdit";
import Generator from "../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
import { RelatedTermsSelector } from "../RelatedTermsSelector";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { DefinitionallyRelatedTerms } from "../../../model/TermItState";
import { langString } from "../../../model/MultilingualString";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import VocabularyUtils from "../../../util/VocabularyUtils";

describe("RelatedTermsSelector", () => {
  const VOCABULARY_IRI = Generator.generateUri();

  let term: Term;
  let onChange: (value: Term[]) => void;
  let loadTerms: (
    fetchOptions: FetchOptionsFunction,
    namespace?: string
  ) => Promise<Term[]>;
  let selected: TermInfo[];

  let definitionRelated: DefinitionallyRelatedTerms;
  let definitionRelatedChanges: DefinitionRelatedChanges;
  let onDefinitionRelatedChange: (change: DefinitionRelatedChanges) => void;

  beforeEach(() => {
    term = Generator.generateTerm(VOCABULARY_IRI);
    onChange = jest.fn();
    loadTerms = jest.fn().mockResolvedValue([]);
    selected = [];
    definitionRelated = {
      targeting: [],
      of: [],
    };
    definitionRelatedChanges = {
      pendingApproval: [],
      pendingRemoval: [],
    };
    onDefinitionRelatedChange = jest.fn();
  });

  it("adds existing approved definitionally related terms targeting current term to state on mount", () => {
    const defRelated = Generator.generateTerm(VOCABULARY_IRI);
    definitionRelated.targeting = [Generator.generateOccurrenceOf(defRelated)];
    definitionRelated.targeting[0].target.source.iri = term.iri;
    // Don't care about this one, just want to make sure occurrences of the current term are ignored
    definitionRelated.of = [
      Generator.generateOccurrenceOf(Generator.generateTerm(VOCABULARY_IRI)),
    ];
    const wrapper = render();

    expect(wrapper.state().definitionRelated).toEqual([defRelated.iri]);
  });

  it("does not add suggested definitionally related terms targetting current term to state on mount", () => {
    const defRelated = Generator.generateTerm(VOCABULARY_IRI);
    definitionRelated.targeting = [Generator.generateOccurrenceOf(defRelated)];
    definitionRelated.targeting[0].target.source.iri = term.iri;
    definitionRelated.targeting[0].types.push(
      VocabularyUtils.SUGGESTED_TERM_OCCURRENCE
    );
    const wrapper = render();

    expect(wrapper.state().definitionRelated.length).toEqual(0);
  });

  function render() {
    return shallow<RelatedTermsSelector>(
      <RelatedTermsSelector
        id="test"
        term={term}
        vocabularyIri={VOCABULARY_IRI}
        selected={selected}
        onChange={onChange}
        loadTerms={loadTerms}
        definitionRelated={definitionRelated}
        definitionRelatedChanges={definitionRelatedChanges}
        onDefinitionRelatedChange={onDefinitionRelatedChange}
        {...intlFunctions()}
      />
    );
  }

  it("passes existing approved definitionally related terms together with provided related terms to selector as value", () => {
    const defRelated = Generator.generateTerm(VOCABULARY_IRI);
    definitionRelated.targeting = [Generator.generateOccurrenceOf(defRelated)];
    definitionRelated.targeting[0].target.source.iri = term.iri;
    definitionRelated.of = [];
    const relatedIri = Generator.generateUri();
    selected.push({
      iri: relatedIri,
      label: langString("Related term"),
      vocabulary: { iri: VOCABULARY_IRI },
    });

    const wrapper = render();
    const value: string[] = (wrapper.find(IntelligentTreeSelect).props() as any)
      .value;
    expect(value).toContain(relatedIri);
    expect(value).toContain(defRelated.iri);
  });

  describe("onDefinitionRelatedChange", () => {
    it("adds specified term to state", () => {
      const wrapper = render();
      const defRelated = Generator.generateTerm(VOCABULARY_IRI);
      const change: DefinitionRelatedChanges = {
        pendingApproval: [Generator.generateOccurrenceOf(defRelated)],
        pendingRemoval: [],
      };
      wrapper.instance().onDefinitionRelatedChange(change);

      expect(wrapper.state().definitionRelated).toContain(defRelated.iri);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("loadTerms", () => {
    it("includes definition related terms from state in includeTerms", () => {
      const wrapper = render();
      const defRelatedToInclude = [
        Generator.generateUri(),
        Generator.generateUri(),
      ];
      wrapper.setState({ definitionRelated: defRelatedToInclude });
      wrapper.instance().fetchOptions({ offset: 0 });
      expect(loadTerms).toHaveBeenCalledWith(
        { includeTerms: defRelatedToInclude, offset: 0 },
        undefined
      );
    });

    it("merges definition related terms to include with existing selected related terms", () => {
      const relatedIri = Generator.generateUri();
      selected.push({
        iri: relatedIri,
        label: langString("Related term"),
        vocabulary: { iri: VOCABULARY_IRI },
      });
      const defRelatedToInclude = [Generator.generateUri(), relatedIri];
      const wrapper = render();

      wrapper.setState({ definitionRelated: defRelatedToInclude });
      wrapper.instance().fetchOptions({ offset: 0 });
      expect(loadTerms).toHaveBeenCalledWith(
        {
          includeTerms: [
            relatedIri,
            ...defRelatedToInclude.filter((i: string) => i !== relatedIri),
          ],
          offset: 0,
        },
        undefined
      );
    });
  });

  describe("onChange", () => {
    it("filters out definition related before calling props.onChange to prevent them from getting into related", () => {
      const defRelated = Generator.generateTerm(VOCABULARY_IRI);
      definitionRelated.targeting = [
        Generator.generateOccurrenceOf(defRelated),
      ];
      definitionRelated.targeting[0].target.source.iri = term.iri;
      const newRelated = Generator.generateTerm(VOCABULARY_IRI);

      const wrapper = render();
      wrapper.instance().onChange([defRelated, newRelated]);
      expect(onChange).toHaveBeenCalledWith([newRelated]);
    });

    it("removes unselected values from definitionRelated values in state", () => {
      const defRelated = Generator.generateTerm(VOCABULARY_IRI);
      definitionRelated.targeting = [
        Generator.generateOccurrenceOf(defRelated),
      ];
      definitionRelated.targeting[0].target.source.iri = term.iri;
      definitionRelated.of = [];
      const related = Generator.generateTerm(VOCABULARY_IRI);
      selected.push({
        iri: related.iri,
        label: related.label,
        vocabulary: { iri: VOCABULARY_IRI },
      });

      const wrapper = render();
      expect(wrapper.state().definitionRelated).toContain(defRelated.iri);
      wrapper.instance().onChange([related]);
      wrapper.update();
      expect(wrapper.state().definitionRelated).not.toContain(defRelated.iri);
    });

    it("removes all definitionRelated values from state when onChange value is null", () => {
      const defRelated = Generator.generateTerm(VOCABULARY_IRI);
      definitionRelated.targeting = [
        Generator.generateOccurrenceOf(defRelated),
      ];
      definitionRelated.targeting[0].target.source.iri = term.iri;
      definitionRelated.of = [];

      const wrapper = render();
      expect(wrapper.state().definitionRelated).toContain(defRelated.iri);
      wrapper.instance().onChange(null);
      wrapper.update();
      expect(wrapper.state().definitionRelated).toEqual([]);
    });

    it("removes unselected values from definitional term occurrences pending approval", () => {
      const defRelated = Generator.generateTerm(VOCABULARY_IRI);
      definitionRelatedChanges.pendingApproval = [
        Generator.generateOccurrenceOf(defRelated),
      ];

      const wrapper = render();
      wrapper.setState({ definitionRelated: [defRelated.iri] });
      wrapper.instance().onChange(null);
      expect(onDefinitionRelatedChange).toHaveBeenCalledWith({
        pendingApproval: [],
        pendingRemoval: [],
      });
    });

    it("moves unselected values from confirmed definitionally related terms to pending removals", () => {
      const defRelated = Generator.generateTerm(VOCABULARY_IRI);
      definitionRelated.targeting = [
        Generator.generateOccurrenceOf(defRelated),
      ];

      const wrapper = render();
      wrapper.instance().onChange(null);
      expect(onDefinitionRelatedChange).toHaveBeenCalledWith({
        pendingApproval: [],
        pendingRemoval: definitionRelated.targeting,
      });
    });
  });
});
