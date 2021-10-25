import Term, { TermInfo } from "../../../model/Term";
import FetchOptionsFunction from "../../../model/Functions";
import { DefinitionRelatedChanges } from "../DefinitionRelatedTermsEdit";
import Generator from "../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
import { RelatedTermsSelector } from "../RelatedTermsSelector";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { DefinitionallyRelatedTerms } from "../../../model/TermItState";
import { langString } from "../../../model/MultilingualString";
import Constants from "../../../util/Constants";
import { IRI } from "../../../util/VocabularyUtils";
import Workspace from "../../../model/Workspace";

describe("RelatedTermsSelector", () => {
  const VOCABULARY_IRI = Generator.generateUri();

  let term: Term;
  let workspace: Workspace;
  let onChange: (value: Term[]) => void;
  let loadTermsFromVocabulary: (
    fetchOptions: FetchOptionsFunction,
    vocabularyIri: IRI
  ) => Promise<Term[]>;
  let loadTermsFromCurrentWorkspace: (
    fetchOptions: FetchOptionsFunction,
    excludeVocabulary: string
  ) => Promise<Term[]>;
  let loadTermsFromCanonical: (
    fetchOptions: FetchOptionsFunction
  ) => Promise<Term[]>;

  let selected: TermInfo[];

  let definitionRelated: DefinitionallyRelatedTerms;
  let definitionRelatedChanges: DefinitionRelatedChanges;
  let onDefinitionRelatedChange: (change: DefinitionRelatedChanges) => void;

  beforeEach(() => {
    term = Generator.generateTerm(VOCABULARY_IRI);
    workspace = new Workspace({ label: "Test", vocabularies: [] });
    onChange = jest.fn();
    loadTermsFromVocabulary = jest.fn().mockResolvedValue([]);
    loadTermsFromCurrentWorkspace = jest.fn().mockResolvedValue([]);
    loadTermsFromCanonical = jest.fn().mockResolvedValue([]);
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
        loadTermsFromVocabulary={loadTermsFromVocabulary}
        loadTermsFromCanonical={loadTermsFromCanonical}
        loadTermsFromCurrentWorkspace={loadTermsFromCurrentWorkspace}
        definitionRelated={definitionRelated}
        definitionRelatedChanges={definitionRelatedChanges}
        onDefinitionRelatedChange={onDefinitionRelatedChange}
        workspace={workspace}
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
      expect(loadTermsFromVocabulary).toHaveBeenCalled();
    });
  });
});
