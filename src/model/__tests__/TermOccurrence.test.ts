import Generator from "../../__tests__/environment/Generator";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermOccurrence, { CONTEXT } from "../TermOccurrence";

describe("TermOccurrence", () => {
  describe("toJsonLd", () => {
    it("adds context to the object", () => {
      const sut = new TermOccurrence({
        term: Generator.generateTerm(),
        target: {
          source: { iri: Generator.generateUri() },
          selectors: [
            {
              exactMatch: "test",
              types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
            },
          ],
          types: [VocabularyUtils.FILE_OCCURRENCE_TARGET],
        },
        types: [VocabularyUtils.TERM_OCCURRENCE],
      });

      const result = sut.toJsonLd();
      expect(result["@context"]).toEqual(CONTEXT);
    });

    it("prevents circular reference issue by simplifying term data to just term IRI", () => {
      const term = Generator.generateTerm();
      const sut = new TermOccurrence({
        term,
        target: {
          source: { iri: Generator.generateUri() },
          selectors: [
            {
              exactMatch: "test",
              types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
            },
          ],
          types: [VocabularyUtils.FILE_OCCURRENCE_TARGET],
        },
        types: [VocabularyUtils.TERM_DEFINITION_SOURCE],
      });
      sut.term.definitionSource = sut;

      const result = sut.toJsonLd();
      expect(result.term).toEqual({ iri: term.iri });
    });
  });
});
