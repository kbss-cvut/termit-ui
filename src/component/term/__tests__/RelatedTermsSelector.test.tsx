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
    const value:string[] = (wrapper.find(IntelligentTreeSelect).props() as any).value;
    expect(value).toContain(relatedIri);
    expect(value).toContain(defRelated.iri);
  });

  describe("onAddDefinitional", () => {
    it("adds specified term to state", () => {
      const wrapper = render();
      const defRelated = Generator.generateTerm(VOCABULARY_IRI);
      wrapper.instance().onAddDefinitional([defRelated]);

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
          ...(defRelatedToInclude.filter((i: string) => i !== relatedIri)),
          ],
          offset: 0,
        },
        undefined
      );
    });
  });
});
