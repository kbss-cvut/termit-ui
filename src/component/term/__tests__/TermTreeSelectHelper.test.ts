import Generator from "../../../__tests__/environment/Generator";
import { processTermsForTreeSelect } from "../TermTreeSelectHelper";

describe("TermTreeSelectHelper", () => {
  describe("processTermsForTreeSelect", () => {
    it("returns all terms when no vocabularies are provided", () => {
      const vocUri = Generator.generateUri();
      const terms = [
        Generator.generateTerm(vocUri),
        Generator.generateTerm(vocUri),
      ];
      const result = processTermsForTreeSelect(terms, undefined, {});
      expect(result).toEqual(terms);
    });

    it("removes parent terms from non-matching vocabularies for search string", () => {
      const vocUri = Generator.generateUri();
      const terms = [Generator.generateTerm(vocUri)];
      const parent = Generator.generateTerm(Generator.generateUri());
      terms[0].parentTerms = [parent];
      const result = processTermsForTreeSelect(terms, [vocUri], {
        searchString: "test",
      });
      expect(result).toEqual(terms);
    });

    it("handles terms with circular dependencies", () => {
      const t1 = Generator.generateTerm(Generator.generateUri());
      const t2 = Generator.generateTerm(Generator.generateUri());
      const t3 = Generator.generateTerm(Generator.generateUri());
      t1.parentTerms = [t2];
      t2.subTerms = [
        {
          iri: t1.iri,
          label: t1.label,
          vocabulary: t1.vocabulary!,
        },
      ];
      t2.parentTerms = [t3];
      t3.subTerms = [
        {
          iri: t2.iri,
          label: t2.label,
          vocabulary: t2.vocabulary!,
        },
      ];
      t3.parentTerms = [t1];
      t1.subTerms = [
        {
          iri: t3.iri,
          label: t3.label,
          vocabulary: t3.vocabulary!,
        },
      ];
      const result = processTermsForTreeSelect([t1], undefined, {
        searchString: "test",
      });
      expect(result).toContain(t1);
      expect(result).toContain(t2);
      expect(result).toContain(t3);
    });
  });
});
