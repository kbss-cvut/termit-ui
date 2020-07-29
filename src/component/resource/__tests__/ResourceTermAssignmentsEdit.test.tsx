import * as React from "react";
import {ResourceTermAssignmentsEdit} from "../ResourceTermAssignmentsEdit";
import {intlFunctions} from "../../../__tests__/environment/IntlUtil";
import {AssetData} from "../../../model/Asset";
import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import {shallow} from "enzyme";

describe("ResourceTermAssignmentsEdit", () => {

    let onChange: (subTerms: AssetData[]) => void;
    let fetchTerms: (searchString: string) => Promise<Term[]>;

    beforeEach(() => {
        onChange = jest.fn();
    });

    describe("fetchOptions", () => {

        // Bug #1304
        it("creates a shallow copy of props terms to prevent their modification", () => {
            const existingTerms = [Generator.generateTerm(), Generator.generateTerm()];
            const origLength = existingTerms.length;
            const fetchedTerms = [Generator.generateTerm(), Generator.generateTerm()];
            fetchTerms = jest.fn().mockResolvedValue(fetchedTerms);
            const wrapper = shallow<ResourceTermAssignmentsEdit>(<ResourceTermAssignmentsEdit terms={existingTerms}
                                                                                              onChange={onChange}
                                                                                              fetchTerms={fetchTerms} {...intlFunctions()}/>);
            return wrapper.instance().fetchOptions({}).then((terms) => {
                expect(existingTerms.length).toEqual(origLength);
                expect(terms.length).toEqual(origLength + fetchedTerms.length);
                expect(terms).toEqual([...existingTerms, ...fetchedTerms]);
            });
        });
    });
});
