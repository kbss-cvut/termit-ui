import Generator from "../../__tests__/environment/Generator";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermOccurrence, {CONTEXT} from "../TermOccurrence";

describe("TermOccurrence", () => {

    describe("toJsonLd", () => {
        it("adds context to the object", () => {
            const sut = new TermOccurrence({
                term: Generator.generateTerm(),
                target: {
                    source: {iri: Generator.generateUri()},
                    selectors: [{exactMatch: "test", types: [VocabularyUtils.TEXT_QUOTE_SELECTOR]}],
                    types: [VocabularyUtils.FILE_OCCURRENCE_TARGET]
                },
                types: [VocabularyUtils.TERM_OCCURRENCE]
            });

            const result = sut.toJsonLd();
            expect(result["@context"]).toEqual(CONTEXT);
        });

        it("transforms term to term data suitable for JSON-LD as well", () => {
            const sut = new TermOccurrence({
                term: Generator.generateTerm(),
                target: {
                    source: {iri: Generator.generateUri()},
                    selectors: [{exactMatch: "test", types: [VocabularyUtils.TEXT_QUOTE_SELECTOR]}],
                    types: [VocabularyUtils.FILE_OCCURRENCE_TARGET]
                },
                types: [VocabularyUtils.TERM_DEFINITION_SOURCE]
            });
            jest.spyOn(sut.term, "toTermData");

            const result = sut.toJsonLd();
            expect(result.term).toEqual(sut.term.toTermData());
            expect(sut.term.toTermData).toHaveBeenCalled();
        });
    });
});
