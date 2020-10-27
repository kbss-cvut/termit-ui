import * as React from "react";
import Vocabulary from "../../../../model/Vocabulary";
import {shallow} from "enzyme";
import {intlFunctions} from "../../../../__tests__/environment/IntlUtil";
import {ValidationResults} from "../ValidationResults";
import Generator from "../../../../__tests__/environment/Generator";
import VocabularyUtils from "../../../../util/VocabularyUtils";
import ValidationResult from "../../../../model/ValidationResult";
import SeverityText from "../SeverityText";

export function constructValidationResult(termIri : string) : ValidationResult {
    return new ValidationResult(
        "",
        {iri: termIri, label: {"cs": termIri}},
        {iri: VocabularyUtils.SH_VIOLATION},
        [{language: "cs", value: "Chyba"}],
        {iri: "https://example.org/sourceShape"});
};

describe("Validation Results", () => {

    let vocabulary: Vocabulary;

    beforeEach(() => {
        vocabulary = new Vocabulary({
            iri: Generator.generateUri(),
            label: "Test vocabulary"
        });
    });

    it("groups results by term and orders them most problematic first", () => {
        const validationResults = {
            [vocabulary.iri]: [
                constructValidationResult("https://example.org/term1"),
                constructValidationResult("https://example.org/term2"),
                constructValidationResult("https://example.org/term3"),
                constructValidationResult("https://example.org/term1"),
                constructValidationResult("https://example.org/term3"),
                constructValidationResult("https://example.org/term3"),
                constructValidationResult("https://example.org/term3")
            ]
        }
        const component = shallow<ValidationResults>(<ValidationResults
            vocabulary={vocabulary}
            validationResults={validationResults} {...intlFunctions()}/>);

        const rows = component.find("tbody").find("tr");
        expect(rows.length).toEqual(3);
        expect(rows.at(0).find(SeverityText).length).toEqual(4);
        expect(rows.at(1).find(SeverityText).length).toEqual(2);
        expect(rows.at(2).find(SeverityText).length).toEqual(1);
    });
});
