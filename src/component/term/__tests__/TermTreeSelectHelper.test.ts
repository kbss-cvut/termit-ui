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

    it("adds top level ancestor of a selected term into the results", () => {
      const vocUri = Generator.generateUri();
      const terms = [Generator.generateTerm(vocUri), Generator.generateTerm(vocUri)];
      const included = Generator.generateTerm(vocUri);
      const parent = Generator.generateTerm(vocUri);
      included.parentTerms = [parent];
      const grandParent = Generator.generateTerm();
      parent.parentTerms = [grandParent];
      terms.push(included);
      const result = processTermsForTreeSelect(terms, [vocUri], {selectedIris: [included.iri]});
      expect(result).toContain(grandParent);
    });
  });
});
