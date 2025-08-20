import Term, { TermData, TermInfo } from "../../../model/Term";
import { DefinitionRelatedChanges } from "../DefinitionRelatedTermsEdit";
import Generator from "../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
import { RelatedTermsSelector } from "../RelatedTermsSelector";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { DefinitionallyRelatedTerms } from "../../../model/TermItState";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import { TermFetchParams } from "../../../util/Types";

describe("RelatedTermsSelector", () => {
  const VOCABULARY_IRI = Generator.generateUri();

  let term: Term;
  let onChange: (value: Term[]) => void;
  let loadTerms: (
    fetchOptions: TermFetchParams<TermData>,
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

  function render() {
    return shallow<RelatedTermsSelector>(
      <RelatedTermsSelector
        id="test"
        term={term}
        vocabularyIri={VOCABULARY_IRI}
        selected={selected}
        onChange={onChange}
        language={Constants.DEFAULT_LANGUAGE}
        loadTerms={loadTerms}
        definitionRelated={definitionRelated}
        definitionRelatedChanges={definitionRelatedChanges}
        onDefinitionRelatedChange={onDefinitionRelatedChange}
        states={{}}
        {...intlFunctions()}
      />
    );
  }

  describe("loadTerms", () => {
    it("includes existing selected terms in includeTerms", () => {
      selected = [
        {
          iri: Generator.generateUri(),
          label: langString("one"),
          vocabulary: { iri: VOCABULARY_IRI },
        },
        {
          iri: Generator.generateUri(),
          label: langString("two"),
          vocabulary: { iri: VOCABULARY_IRI },
        },
      ];
      const wrapper = render();
      wrapper.instance().fetchOptions({ offset: 0 });
      expect(loadTerms).toHaveBeenCalledWith(
        {
          includeTerms: selected.map((ti) => ti.iri),
          offset: 0,
          flatList: false,
        },
        undefined
      );
    });
  });
});
