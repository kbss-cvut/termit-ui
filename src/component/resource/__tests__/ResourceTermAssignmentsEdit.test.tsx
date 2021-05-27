import { ResourceTermAssignmentsEdit } from "../ResourceTermAssignmentsEdit";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { AssetData } from "../../../model/Asset";
import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import FetchOptionsFunction from "../../../model/Functions";
import { IRI } from "../../../util/VocabularyUtils";

describe("ResourceTermAssignmentsEdit", () => {
  let onChange: (subTerms: AssetData[]) => void;
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
  let loadFunctions: any;

  beforeEach(() => {
    onChange = jest.fn();
    loadTermsFromVocabulary = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));
    loadTermsFromCurrentWorkspace = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));
    loadTermsFromCanonical = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));
    loadFunctions = {
      loadTermsFromVocabulary,
      loadTermsFromCurrentWorkspace,
      loadTermsFromCanonical,
    };
  });

  it("passes term label retrieval function to tree select", () => {
    const existingTerms = [Generator.generateTerm(), Generator.generateTerm()];
    const fetchedTerms = [Generator.generateTerm(), Generator.generateTerm()];
    loadFunctions.loadTermsFromCurrentWorkspace = jest
      .fn()
      .mockResolvedValue(fetchedTerms);
    const wrapper = shallow<ResourceTermAssignmentsEdit>(
      <ResourceTermAssignmentsEdit
        terms={existingTerms}
        onChange={onChange}
        {...loadFunctions}
        {...intlFunctions()}
      />
    );
    expect(
      wrapper.find(IntelligentTreeSelect).prop("getOptionLabel")
    ).toBeDefined();
  });

  describe("fetchOptions", () => {
    // Bug #1304
    it("creates a shallow copy of props terms to prevent their modification", () => {
      const existingTerms = [
        Generator.generateTerm(),
        Generator.generateTerm(),
      ];
      const origLength = existingTerms.length;
      const fetchedTerms = [Generator.generateTerm(), Generator.generateTerm()];
      loadFunctions.loadTermsFromCurrentWorkspace = jest
        .fn()
        .mockResolvedValue([...existingTerms, ...fetchedTerms]);
      const wrapper = shallow<ResourceTermAssignmentsEdit>(
        <ResourceTermAssignmentsEdit
          terms={existingTerms}
          onChange={onChange}
          {...loadFunctions}
          {...intlFunctions()}
        />
      );
      return wrapper
        .instance()
        .fetchOptions({})
        .then((terms) => {
          expect(existingTerms.length).toEqual(origLength);
          expect(terms.length).toEqual(origLength + fetchedTerms.length);
          expect(terms).toEqual([...existingTerms, ...fetchedTerms]);
        });
    });
  });
});
