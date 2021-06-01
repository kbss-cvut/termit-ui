import { ResourceTermAssignmentsEdit } from "../ResourceTermAssignmentsEdit";
import { intlFunctions } from "../../../__tests__/environment/IntlUtil";
import { AssetData } from "../../../model/Asset";
import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import { shallow } from "enzyme";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import FetchOptionsFunction from "../../../model/Functions";

describe("ResourceTermAssignmentsEdit", () => {
  let onChange: (subTerms: AssetData[]) => void;
  let loadTerms: (
    fetchOptions: FetchOptionsFunction,
    namespace: string
  ) => Promise<Term[]>;

  beforeEach(() => {
    onChange = jest.fn();
  });

  it("passes term label retrieval function to tree select", () => {
    const existingTerms = [Generator.generateTerm(), Generator.generateTerm()];
    const fetchedTerms = [Generator.generateTerm(), Generator.generateTerm()];
    loadTerms = jest.fn().mockResolvedValue(fetchedTerms);
    const wrapper = shallow<ResourceTermAssignmentsEdit>(
      <ResourceTermAssignmentsEdit
        terms={existingTerms}
        onChange={onChange}
        loadTerms={loadTerms}
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
      loadTerms = jest
        .fn()
        .mockResolvedValue([...existingTerms, ...fetchedTerms]);
      const wrapper = shallow<ResourceTermAssignmentsEdit>(
        <ResourceTermAssignmentsEdit
          terms={existingTerms}
          onChange={onChange}
          loadTerms={loadTerms}
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
