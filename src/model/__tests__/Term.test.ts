import OntologicalVocabulary from "../../util/VocabularyUtils";
import VocabularyUtils from "../../util/VocabularyUtils";
import Term, { TermData } from "../Term";
import Generator from "../../__tests__/environment/Generator";
import { TermOccurrenceData } from "../TermOccurrence";
import { langString } from "../MultilingualString";

describe("Term tests", () => {
  let termData: TermData;
  let term: {};

  beforeEach(() => {
    termData = {
      iri: "http://example.org/term1",
      label: langString("test term 1"),
      types: ["http://example.org/type1", OntologicalVocabulary.TERM],
      draft: true,
      vocabulary: { iri: Generator.generateUri() },
    };

    term = {
      iri: "http://example.org/term1",
      label: langString("test term 1"),
      types: ["http://example.org/type1", OntologicalVocabulary.TERM],
      draft: true,
      vocabulary: { iri: termData.vocabulary!.iri },
    };
  });

  it("load a term", () => {
    expect(term).toEqual(new Term(termData));
  });

  describe("constructor", () => {
    it("is symmetric to toJSONLD", () => {
      expect(termData).toEqual(new Term(termData).toTermData());
    });

    it("does not set parent when no parentTerms are available", () => {
      const result = new Term(termData);
      expect(result.parent).not.toBeDefined();
    });

    it("sets parent based on parentTerms", () => {
      termData.vocabulary = { iri: Generator.generateUri() };
      termData.parentTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("Parent"),
          vocabulary: termData.vocabulary,
        },
      ];
      const result = new Term(termData);
      expect(result.parent).toEqual(termData.parentTerms[0].iri);
    });

    it("sets parent to first parent with same vocabulary", () => {
      termData.vocabulary = { iri: Generator.generateUri() };
      termData.parentTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("Parent"),
          vocabulary: { iri: Generator.generateUri() },
        },
        {
          iri: Generator.generateUri(),
          label: langString("Parent Two"),
          vocabulary: { iri: termData.vocabulary.iri },
        },
      ];
      const result = new Term(termData);
      expect(result.parent).toEqual(termData.parentTerms[1].iri);
    });

    it("sanitizes subTerms to an array in case it is a singular object", () => {
      const subTerm = {
        iri: Generator.generateUri(),
        label: "test",
        vocabulary: { iri: Generator.generateUri() },
      };
      Object.assign(termData, { subTerms: subTerm });
      const result = new Term(termData);
      expect(result.subTerms).toEqual([subTerm]);
    });

    it("handles parent term cycles", () => {
      const parentData: TermData = {
        iri: Generator.generateUri(),
        label: langString("Parent"),
        vocabulary: { iri: Generator.generateUri() },
      };
      const grandParentData: TermData = {
        iri: Generator.generateUri(),
        label: langString("Grandparent"),
        vocabulary: { iri: Generator.generateUri() },
        parentTerms: [termData],
      };
      parentData.parentTerms = [grandParentData];
      termData.parentTerms = [parentData];
      const result = new Term(termData);
      expect(result.parentTerms![0].iri).toEqual(parentData.iri);
      expect(result.parentTerms![0].parentTerms![0].iri).toEqual(
        grandParentData.iri
      );
      // Here the cycle closes
      expect(result.parentTerms![0].parentTerms![0].parentTerms![0]).toEqual(
        result
      );
    });
  });

  it("adds term type in constructor when it is missing in specified data", () => {
    const data = {
      iri: Generator.generateUri(),
      label: langString("New term"),
    };
    const result = new Term(data);
    expect(result.types).toBeDefined();
    expect(result.types!.indexOf(OntologicalVocabulary.TERM)).not.toEqual(-1);
  });

  describe("get unmappedProperties", () => {
    it("returns map of unmapped properties with values in term", () => {
      const extraProperty =
        "http://onto.fel.cvut.cz/ontologies/termit/extra-one";
      const data: TermData = {
        iri: "http://data.iprpraha.cz/zdroj/slovnik/test-vocabulary/term/pojem-5",
        label: langString("pojem 5"),
        sources: [
          "https://kbss.felk.cvut.cz/web/kbss/dataset-descriptor-ontology",
        ],
      };
      const value = "value]";
      data[extraProperty] = value;
      const testTerm = new Term(data);
      const result = testTerm.unmappedProperties;
      expect(result.has(extraProperty)).toBeTruthy();
      expect(result.get(extraProperty)).toEqual([value]);
      expect(result.size).toEqual(1);
    });

    it("returns map of unmapped properties with values containing multiple values per property", () => {
      const extraProperty =
        "http://onto.fel.cvut.cz/ontologies/termit/extra-one";
      const data: TermData = {
        iri: "http://data.iprpraha.cz/zdroj/slovnik/test-vocabulary/term/pojem-5",
        label: langString("pojem 5"),
        sources: [
          "https://kbss.felk.cvut.cz/web/kbss/dataset-descriptor-ontology",
        ],
      };
      const values = ["v1", "v2", "v3"];
      data[extraProperty] = values;
      const testTerm = new Term(data);
      const result = testTerm.unmappedProperties;
      expect(result.has(extraProperty)).toBeTruthy();
      expect(result.get(extraProperty)).toEqual(values);
    });
  });

  describe("set unmappedProperties", () => {
    it("merges specified properties into the object state", () => {
      const testTerm = new Term(termData);
      const unmappedProps = new Map<string, string[]>();
      const extraProperty =
        "http://onto.fel.cvut.cz/ontologies/termit/extra-one";
      const value = ["1", "2"];
      unmappedProps.set(extraProperty, value);
      testTerm.unmappedProperties = unmappedProps;
      expect(testTerm[extraProperty]).toBeDefined();
      expect(testTerm[extraProperty]).toEqual(value);
    });

    it("is symmetric to getter", () => {
      const testTerm = new Term(termData);
      const unmappedProps = new Map<string, string[]>();
      const extraProperty =
        "http://onto.fel.cvut.cz/ontologies/termit/extra-one";
      const value = ["1", "2"];
      unmappedProps.set(extraProperty, value);
      testTerm.unmappedProperties = unmappedProps;
      expect(testTerm.unmappedProperties).toEqual(unmappedProps);
    });
  });

  describe("syncPlainSubTerms", () => {
    it("synchronizes plainSubTerms with current subTerms value", () => {
      const origSubTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("test one"),
          vocabulary: { iri: Generator.generateUri() },
        },
        {
          iri: Generator.generateUri(),
          label: langString("test two"),
          vocabulary: { iri: Generator.generateUri() },
        },
      ];
      termData.subTerms = origSubTerms;
      const sut = new Term(termData);
      expect(sut.plainSubTerms).toEqual(origSubTerms.map((ti) => ti.iri));
      const newSubTerms = origSubTerms.slice();
      newSubTerms.splice(newSubTerms.length - 1, 1);
      newSubTerms.push({
        iri: Generator.generateUri(),
        label: langString("test three"),
        vocabulary: { iri: Generator.generateUri() },
      });
      sut.subTerms = newSubTerms;
      sut.syncPlainSubTerms();
      expect(sut.plainSubTerms).toEqual(newSubTerms.map((ti) => ti.iri));
    });

    it("is invoked by constructor", () => {
      const origSubTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("test one"),
          vocabulary: { iri: Generator.generateUri() },
        },
      ];
      termData.subTerms = origSubTerms;
      const sut = new Term(termData);
      expect(sut.plainSubTerms).toEqual(origSubTerms.map((ti) => ti.iri));
    });
  });

  describe("toTermData", () => {
    it("breaks reference cycle over term definition source", () => {
      const defSource: TermOccurrenceData = {
        iri: Generator.generateUri(),
        term: Generator.generateTerm(),
        target: {
          selectors: [
            {
              iri: Generator.generateUri(),
              exactMatch: "Test",
              types: [VocabularyUtils.TEXT_QUOTE_SELECTOR],
            },
          ],
          source: { iri: Generator.generateUri() },
          types: [VocabularyUtils.DEFINITION_OCCURRENCE_TARGET],
        },
        types: [VocabularyUtils.TERM_DEFINITION_SOURCE],
      };
      const sut: Term = new Term({
        iri: Generator.generateUri(),
        label: langString("Test term"),
        definitionSource: defSource,
        types: [VocabularyUtils.TERM],
      });
      sut.definitionSource!.term = sut; // Here comes the cycle

      const result = sut.toTermData();
      expect(result.definitionSource!.term).not.toEqual(result);
      expect(result.definitionSource!.term).toEqual({ iri: sut.iri });
    });
  });

  describe("removeTranslation", () => {
    it("deletes values in specified language from multilingual attributes", () => {
      const data: TermData = {
        iri: Generator.generateUri(),
        label: { en: "test term", cs: "testovaci pojem" },
        definition: { en: "Term definition.", cs: "Definice pojmu" },
        types: [VocabularyUtils.TERM],
      };

      Term.removeTranslation(data, "cs");
      expect(data.label.cs).not.toBeDefined();
      expect(data.definition!.cs).not.toBeDefined();
    });

    it("handles plural attribute translation removal as well", () => {
      const data: TermData = {
        iri: Generator.generateUri(),
        label: { en: "test term", cs: "testovaci pojem" },
        altLabels: {
          en: ["test term", "test"],
          cs: ["testovaci pojem", "testovaci term"],
        },
        types: [VocabularyUtils.TERM],
      };

      Term.removeTranslation(data, "cs");
      expect(data.altLabels!.cs).not.toBeDefined();
    });
  });

  describe("consolidateRelatedAndRelatedMatch", () => {
    it("returns consolidated related and relatedMatch values", () => {
      const t = new Term(termData);
      t.relatedTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("test related"),
          vocabulary: { iri: t.vocabulary!.iri },
        },
      ];
      t.relatedMatchTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("test related"),
          vocabulary: { iri: Generator.generateUri() },
        },
      ];
      expect(Term.consolidateRelatedAndRelatedMatch(t)).toEqual([
        ...t.relatedTerms,
        ...t.relatedMatchTerms,
      ]);
    });

    it("handles related match being undefined", () => {
      const t = new Term(termData);
      t.relatedTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("test related"),
          vocabulary: { iri: t.vocabulary!.iri },
        },
      ];
      expect(Term.consolidateRelatedAndRelatedMatch(t)).toEqual(t.relatedTerms);
    });

    it("handles related being undefined", () => {
      const t = new Term(termData);
      t.relatedMatchTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("test related"),
          vocabulary: { iri: Generator.generateUri() },
        },
      ];
      expect(Term.consolidateRelatedAndRelatedMatch(t)).toEqual(
        t.relatedMatchTerms
      );
    });

    it("removes duplicates", () => {
      const related = {
        iri: Generator.generateUri(),
        label: langString("test related/relatedMatch"),
        vocabulary: { iri: Generator.generateUri() },
      };
      const t = new Term(termData);
      t.relatedTerms = [related];
      t.relatedMatchTerms = [related];
      expect(Term.consolidateRelatedAndRelatedMatch(t)).toEqual([related]);
    });

    it("returns results ordered by label", () => {
      const t = new Term(termData);
      t.relatedTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("second"),
          vocabulary: { iri: t.vocabulary!.iri },
        },
      ];
      t.relatedMatchTerms = [
        {
          iri: Generator.generateUri(),
          label: langString("first"),
          vocabulary: { iri: Generator.generateUri() },
        },
      ];
      expect(Term.consolidateRelatedAndRelatedMatch(t)).toEqual([
        ...t.relatedMatchTerms,
        ...t.relatedTerms,
      ]);
    });
  });

  describe("isDraft", () => {
    it("returns true when term.draft is true", () => {
      termData.draft = true;
      expect(Term.isDraft(termData)).toBeTruthy();
    });

    it("returns true when term.draft is undefined", () => {
      termData.draft = undefined;
      expect(Term.isDraft(termData)).toBeTruthy();
    });

    it("returns false when term.draft is false", () => {
      termData.draft = false;
      expect(Term.isDraft(termData)).toBeFalsy();
    });
  });

  describe("isSnapshot", () => {
    it("returns true when term has snapshot type", () => {
      const regular = Generator.generateTerm();
      const snapshot = Generator.generateTerm();
      snapshot.types = [VocabularyUtils.TERM_SNAPSHOT];
      expect(regular.isSnapshot()).toBeFalsy();
      expect(snapshot.isSnapshot()).toBeTruthy();
    });
  });

  describe("snapshotOf", () => {
    it("returns undefined when instance is not a snapshot", () => {
      const sut = Generator.generateTerm();
      expect(sut.isSnapshot()).toBeFalsy();
      expect(sut.snapshotOf()).not.toBeDefined();
    });

    it("returns IRI of term whose snapshot this instance is", () => {
      const currentIri = Generator.generateUri();
      const sut = Generator.generateTerm();
      sut[VocabularyUtils.IS_SNAPSHOT_OF_TERM] = currentIri;
      sut.types = [VocabularyUtils.TERM_SNAPSHOT];

      expect(sut.snapshotOf()).toEqual(currentIri);
    });
  });
});
