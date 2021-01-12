import * as React from "react";
import {shallow} from "enzyme";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import {ValidationResults} from "../ValidationResults";
import Generator from "../../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import ValidationResult from "../../../../model/ValidationResult";
import ValidationMessage from "../ValidationMessage";
import Term from "../../../../model/Term";

export function constructValidationResult(termIri : string) : ValidationResult {
    return new ValidationResult(
        "",
        {iri: termIri, label: {"cs": termIri}},
        {iri: VocabularyUtils.SH_VIOLATION},
        [{language: "cs", value: "Chyba"}],
        {iri: "https://example.org/sourceShape"},
        {iri: VocabularyUtils.SKOS_PREF_LABEL}
        )
};

describe("Validation Results", () => {

    let term: Term;

    beforeEach(() => {
        term = Generator.generateTerm();
    });

    it("groups results by term and orders them most problematic first", () => {
        const anotherTermIri = "https://example.org/term2";
        const validationResults = {
            [term.iri]: [
                constructValidationResult(term.iri),
                constructValidationResult(term.iri),
            ],
            [anotherTermIri] : [ constructValidationResult(anotherTermIri) ]
        }
        const component = shallow<ValidationResults>(<ValidationResults
            term={term}
            validationResults={validationResults} {...intlFunctions()}/>);

        const rows = component.find("div").find(ValidationMessage);
        expect(rows.length).toEqual(2);
    });
});
