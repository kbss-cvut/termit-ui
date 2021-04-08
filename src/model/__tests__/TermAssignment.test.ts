import TermAssignment, {CONTEXT} from "../TermAssignment";
import Generator from "../../__tests__/environment/Generator";
import VocabularyUtils from "../../util/VocabularyUtils";

describe("TermAssignment", () => {
    describe("toJsonLd", () => {
        it("adds context to the object", () => {
            const sut = new TermAssignment({
                term: Generator.generateTerm(),
                target: {
                    source: {iri: Generator.generateUri()},
                    types: [VocabularyUtils.ASSIGNMENT_TARGET]
                },
                types: [VocabularyUtils.TERM_ASSIGNMENT]
            });

            const result = sut.toJsonLd();
            expect(result["@context"]).toEqual(CONTEXT);
        });

        it("transforms term to term data suitable for JSON-LD as well", () => {
            const sut = new TermAssignment({
                term: Generator.generateTerm(),
                target: {
                    source: {iri: Generator.generateUri()},
                    types: [VocabularyUtils.ASSIGNMENT_TARGET]
                },
                types: [VocabularyUtils.TERM_ASSIGNMENT]
            });
            jest.spyOn(sut.term, "toTermData");

            const result = sut.toJsonLd();
            expect(result.term).toEqual(sut.term.toTermData());
            expect(sut.term.toTermData).toHaveBeenCalled();
        });
    });
});
