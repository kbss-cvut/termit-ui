import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import Ajax from "../../../util/Ajax";
import {langString} from "../../../model/MultilingualString";
import {isTermValid} from "../TermValidationUtils";


jest.mock("../TermAssignments");
jest.mock("../ParentTermSelector");
jest.mock("../TermTypesEdit");
jest.mock("../../misc/AssetLabel");

describe("Term edit", () => {

    let term: Term;

    beforeEach(() => {
        term = new Term({
            iri: Generator.generateUri(),
            label: Object.assign(langString("Test", "cs"),langString("Test", "en")),
            comment: "test",
            vocabulary: {iri: Generator.generateUri()}
        });
        Ajax.head = jest.fn().mockResolvedValue({});
    });


    it("isTermValid returns true if all labels in languages are unique", () => {
        const valid = isTermValid(
            term,
            {
                "cs" : false,
                "en" : false
            }
        )
        expect(valid).toBeTruthy();
    });
});
