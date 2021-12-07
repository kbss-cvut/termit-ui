import Generator from "../../../__tests__/environment/Generator";
import {
  loadAndPrepareTerms,
  processTermsForTreeSelect,
} from "../TermTreeSelectHelper";
import { TermFetchParams } from "../../../util/Types";
import Term, { TermData } from "../../../model/Term";

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
      const terms = [
        Generator.generateTerm(vocUri),
        Generator.generateTerm(vocUri),
      ];
      const included = Generator.generateTerm(vocUri);
      const parent = Generator.generateTerm(vocUri);
      included.parentTerms = [parent];
      const grandParent = Generator.generateTerm();
      parent.parentTerms = [grandParent];
      terms.push(included);
      const result = processTermsForTreeSelect(terms, [vocUri], {
        selectedIris: [included.iri],
      });
      expect(result).toContain(grandParent);
    });
  });

  describe("loadAndPrepareTerms", () => {
    const vocabularyIri = Generator.generateUri();
    let loadTerms: (
      fetchOptions: TermFetchParams<Term | TermData>
    ) => Promise<Term[]>;

    it("adds selected terms for inclusion when loading the first page (offset 0)", () => {
      loadTerms = jest.fn().mockResolvedValue([]);
      const selected = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
      ];
      return loadAndPrepareTerms({}, loadTerms, {
        selectedTerms: selected,
      }).then(() => {
        expect((loadTerms as jest.Mock).mock.calls[0][0].includeTerms).toEqual(
          selected.map((t) => t.iri)
        );
      });
    });

    it("does not add selected terms for inclusion when loading non-first page (offset > 0)", () => {
      loadTerms = jest.fn().mockResolvedValue([]);
      const selected = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
      ];
      return loadAndPrepareTerms({ offset: 100 }, loadTerms, {
        selectedTerms: selected,
      }).then(() => {
        expect((loadTerms as jest.Mock).mock.calls[0][0].includeTerms).toEqual(
          []
        );
      });
    });

    it("does not add selected terms for inclusion when loading parent subterms (optionID is specified)", () => {
      loadTerms = jest.fn().mockResolvedValue([]);
      const selected = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
      ];
      return loadAndPrepareTerms(
        { optionID: Generator.generateUri() },
        loadTerms,
        {
          selectedTerms: selected,
        }
      ).then(() => {
        expect((loadTerms as jest.Mock).mock.calls[0][0].includeTerms).toEqual(
          []
        );
      });
    });

    it("loads subterms of ancestors of selected terms", () => {
      const selected = Generator.generateTerm(vocabularyIri);
      const parent = Generator.generateTerm(vocabularyIri);
      selected.parentTerms = [parent];
      parent.subTerms = [
        {
          iri: selected.iri,
          label: selected.label,
          vocabulary: { iri: vocabularyIri },
        },
      ];
      const grandParent = Generator.generateTerm(vocabularyIri);
      parent.parentTerms = [grandParent];
      grandParent.subTerms = [
        {
          iri: parent.iri,
          label: parent.label,
          vocabulary: { iri: vocabularyIri },
        },
      ];
      loadTerms = jest
        .fn()
        .mockResolvedValueOnce([
          Generator.generateTerm(vocabularyIri),
          grandParent,
          selected,
        ])
        .mockResolvedValueOnce([parent])
        .mockResolvedValueOnce([selected]);
      return loadAndPrepareTerms({}, loadTerms, {
        selectedTerms: [selected],
      }).then(() => {
        expect(loadTerms).toHaveBeenCalledTimes(3);
        expect(loadTerms).toHaveBeenCalledWith({ optionID: grandParent.iri });
        expect(loadTerms).toHaveBeenCalledWith({ optionID: parent.iri });
      });
    });

    it("returns loaded terms including loaded subterms of selected terms ancestors", () => {
      const selected = Generator.generateTerm(vocabularyIri);
      const parent = Generator.generateTerm(vocabularyIri);
      selected.parentTerms = [parent];
      parent.subTerms = [
        {
          iri: selected.iri,
          label: selected.label,
          vocabulary: { iri: vocabularyIri },
        },
      ];
      const grandParent = Generator.generateTerm(vocabularyIri);
      parent.parentTerms = [grandParent];
      grandParent.subTerms = [
        {
          iri: parent.iri,
          label: parent.label,
          vocabulary: { iri: vocabularyIri },
        },
      ];
      const regularOptions = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
      ];
      loadTerms = jest
        .fn()
        .mockResolvedValueOnce([...regularOptions, grandParent, selected])
        .mockResolvedValueOnce([parent])
        .mockResolvedValueOnce([selected]);
      return loadAndPrepareTerms({}, loadTerms, {
        selectedTerms: [selected],
      }).then((result: Term[]) => {
        expect(result).toContain(grandParent);
        expect(result).toContain(parent);
        expect(result).toContain(selected);
        regularOptions.forEach((t) => expect(result).toContain(t));
      });
    });

    it("uses processTermsForTreeSelect to filter out terms in non-matching vocabularies", () => {
      const terms = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(Generator.generateUri()),
        Generator.generateTerm(Generator.generateUri()),
      ];
      loadTerms = jest.fn().mockResolvedValue(terms);

      return loadAndPrepareTerms({}, loadTerms, {
        matchingVocabularies: [vocabularyIri],
      }).then((result) => {
        expect(result.length).toBeLessThan(terms.length);
        result.forEach((t) => expect(t.vocabulary!.iri).toEqual(vocabularyIri));
      });
    });
  });
});
