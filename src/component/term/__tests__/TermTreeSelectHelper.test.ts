import Generator from "../../../__tests__/environment/Generator";
import {
  createTermNonTerminalStateMatcher,
  createVocabularyMatcher,
  loadAndPrepareTerms,
  processTermsForTreeSelect,
} from "../TermTreeSelectHelper";
import { TermFetchParams } from "../../../util/Types";
import Term, { TermData } from "../../../model/Term";
import VocabularyUtils from "../../../util/VocabularyUtils";
import RdfsResource from "../../../model/RdfsResource";
import { langString } from "../../../model/MultilingualString";

describe("TermTreeSelectHelper", () => {
  describe("processTermsForTreeSelect", () => {
    const vocUri = Generator.generateUri();

    it("returns all terms when no filter functions are provided", () => {
      const terms = [
        Generator.generateTerm(vocUri),
        Generator.generateTerm(vocUri),
      ];
      const result = processTermsForTreeSelect(terms, [], {});
      expect(result).toEqual(terms);
    });

    it("removes parent terms from non-matching vocabularies for search string", () => {
      const terms = [Generator.generateTerm(vocUri)];
      const parent = Generator.generateTerm(Generator.generateUri());
      terms[0].parentTerms = [parent];
      const result = processTermsForTreeSelect(
        terms,
        [createVocabularyMatcher([vocUri])],
        {
          searchString: "test",
        }
      );
      expect(result).toEqual(terms);
    });

    it("applies specified filter function on terms", () => {
      const normalState = Generator.generateUri();
      const terminalState = `${VocabularyUtils.NS_TERMIT}/cancelled-term`;
      const terms: Term[] = [];
      const matchingTerms: Term[] = [];
      for (let i = 0; i < 10; i++) {
        const t: Term = Generator.generateTerm(vocUri);
        t.state = {
          iri: Generator.randomBoolean() ? terminalState : normalState,
        };
        terms.push(t);
        if (t.state.iri === normalState) {
          matchingTerms.push(t);
        }
      }
      const result = processTermsForTreeSelect(terms, [
        (t) => t.state!.iri !== terminalState,
      ]);
      expect(result).toEqual(matchingTerms);
    });

    it("adds top level ancestor of a selected term into the results", () => {
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
      const result = processTermsForTreeSelect(
        terms,
        [createVocabularyMatcher([vocUri])],
        {
          selectedIris: [included.iri],
        }
      );
      expect(result).toContain(grandParent);
    });

    it("prioritizes included term over term loaded normally when adding top level ancestors", () => {
      const terms = [
        Generator.generateTerm(vocUri),
        Generator.generateTerm(vocUri),
      ];
      // Hollow parent does not reference its children
      const hollowParent = Generator.generateTerm(vocUri);
      // Full parent references its children, because it was loaded with a complete skos hierarchy in both ways
      const fullParent = Generator.generateTerm(vocUri);
      fullParent.iri = hollowParent.iri;
      fullParent.label = hollowParent.label;
      terms[0].parentTerms = [hollowParent];
      const included = Generator.generateTerm(vocUri);
      included.iri = terms[0].iri;
      included.label = terms[0].label;
      included.parentTerms = [fullParent];
      fullParent.subTerms = [
        {
          iri: included.iri,
          label: included.label,
          vocabulary: { iri: vocUri },
        },
      ];
      terms.push(included);
      const result = processTermsForTreeSelect(
        terms,
        [createVocabularyMatcher([vocUri])],
        {
          selectedIris: [included.iri],
        }
      );
      const parent = result.find((t) => t.iri === fullParent.iri);
      expect(parent).toBeDefined();
      expect(parent!.subTerms).toBeDefined();
      expect(parent!.subTerms!.length).toBeGreaterThan(0);
    });

    it("does not add top level ancestor of a selected term into the results when subterms of a term are being loaded", () => {
      const terms = [Generator.generateTerm(vocUri)];
      const included = Generator.generateTerm(vocUri);
      const parent = Generator.generateTerm(vocUri);
      included.parentTerms = [parent];
      const grandParent = Generator.generateTerm();
      parent.parentTerms = [grandParent];
      terms.push(included);
      const result = processTermsForTreeSelect(
        terms,
        [createVocabularyMatcher([vocUri])],
        {
          selectedIris: [included.iri],
          loadingSubTerms: true,
        }
      );
      expect(result).not.toContain(grandParent);
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
        terminalStates: [],
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
        terminalStates: [],
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
          terminalStates: [],
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
        terminalStates: [],
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
        terminalStates: [],
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
        terminalStates: [],
      }).then((result) => {
        expect(result.length).toBeLessThan(terms.length);
        result.forEach((t) => expect(t.vocabulary!.iri).toEqual(vocabularyIri));
      });
    });
  });

  describe("createVocabularyMatcher", () => {
    it("returns a function that returns true for terms that match specified any of specified vocabularies", () => {
      const vocabularyIri = Generator.generateUri();
      const terms = [
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(vocabularyIri),
        Generator.generateTerm(Generator.generateUri()),
        Generator.generateTerm(Generator.generateUri()),
      ];
      const matcher = createVocabularyMatcher([vocabularyIri]);
      const result = terms.filter(matcher);
      result.forEach((t) => expect(t.vocabulary!.iri).toEqual(vocabularyIri));
    });

    it("returns a function that matches all terms if no vocabulary identifiers are provided", () => {
      const terms = [
        Generator.generateTerm(Generator.generateUri()),
        Generator.generateTerm(Generator.generateUri()),
        Generator.generateTerm(Generator.generateUri()),
        Generator.generateTerm(Generator.generateUri()),
      ];
      const matcher = createVocabularyMatcher();
      const result = terms.filter(matcher);
      expect(result).toEqual(terms);
    });
  });

  describe("createTermNonTerminalStateMatcher", () => {
    const terminalState = new RdfsResource({
      iri: Generator.generateUri(),
      label: langString("Terminal state", "en"),
      types: [VocabularyUtils.TERM_STATE_TERMINAL],
    });
    const states = [
      new RdfsResource({
        iri: Generator.generateUri(),
        label: langString("Normal state", "en"),
      }),
      terminalState,
    ];

    it("returns a function that matches terms whose state is not one of specified terminal states", () => {
      const terms = [
        Generator.generateTerm(Generator.generateUri()),
        Generator.generateTerm(Generator.generateUri()),
        Generator.generateTerm(Generator.generateUri()),
        Generator.generateTerm(Generator.generateUri()),
      ];
      terms.forEach(
        (t) =>
          (t.state = {
            iri: Generator.randomBoolean() ? states[0].iri : terminalState.iri,
          })
      );
      const matcher = createTermNonTerminalStateMatcher([terminalState.iri]);
      const result = terms.filter(matcher);
      result.forEach((t) =>
        expect(t.state!.iri).not.toEqual(terminalState.iri)
      );
    });

    it("returns a function that matches terms without state", () => {
      const terms = [
        Generator.generateTerm(Generator.generateUri()),
        Generator.generateTerm(Generator.generateUri()),
      ];
      const matcher = createTermNonTerminalStateMatcher([terminalState.iri]);
      const result = terms.filter(matcher);
      expect(result).toEqual(terms);
    });
  });
});
