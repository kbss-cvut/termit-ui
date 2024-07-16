import VocabularyUtils from "../VocabularyUtils";
import JsonLdUtils from "../JsonLdUtils";
import { CONTEXT as VOCABULARY_CONTEXT } from "../../model/Vocabulary";
import { CONTEXT as TERM_CONTEXT, TermData } from "../../model/Term";

describe("JsonLdUtils", () => {
  describe("resolveReferences", () => {
    it("replaces reference node with a known instance in a singular property", () => {
      const data = {
        iri: "http://data",
        author: {
          iri: "http://user",
          firstName: "First name",
          lastName: "lastName",
          types: [VocabularyUtils.USER],
        },
        created: Date.now() - 10000,
        lastEditor: {
          iri: "http://user",
        },
        lastModified: Date.now(),
      };
      const result: any = JsonLdUtils.resolveReferences(
        data,
        new Map<string, object>()
      );
      expect(result.lastEditor).toEqual(data.author);
    });

    it("replaces reference node with a known instance in an array", () => {
      const data = {
        iri: "http://data",
        author: {
          iri: "http://user",
          firstName: "First name",
          lastName: "lastName",
          types: [VocabularyUtils.USER],
        },
        created: Date.now() - 10000,
        editors: [
          {
            iri: "http://user",
          },
          {
            iri: "http://anotherUser",
            firstName: "Another first name",
            lastName: "Another last name",
            types: [VocabularyUtils.USER],
          },
        ],
        lastModified: Date.now(),
      };
      const result: any = JsonLdUtils.resolveReferences(
        data,
        new Map<string, object>()
      );
      expect(result.editors[0]).toEqual(data.author);
    });
  });

  describe("compactAndResolveReferences", () => {
    it("compacts input JSON-LD using the context and resolves references", () => {
      const input = require("../../rest-mock/vocabulary");
      input[VocabularyUtils.PREFIX + "popisuje-dokument"][
        VocabularyUtils.PREFIX + "má-dokumentový-slovník"
      ] = {
        "@id": input["@id"],
      };
      return JsonLdUtils.compactAndResolveReferences(
        input,
        VOCABULARY_CONTEXT
      ).then((result: any) => {
        expect(result.document.vocabulary).toBeDefined();
        expect(result.document.vocabulary).toEqual(result);
      });
    });

    it("does not add empty arrays for plural language containers", () => {
      const input = {
        "@context": {
          types: "@type",
          sources: "http://purl.org/dc/terms/source",
          notations: "http://www.w3.org/2004/02/skos/core#notation",
          label: {
            "@id": "http://www.w3.org/2004/02/skos/core#prefLabel",
            "@container": "@language",
          },
          uri: "@id",
          subTerms: "http://www.w3.org/2004/02/skos/core#narrower",
          glossary: "http://www.w3.org/2004/02/skos/core#inScheme",
          vocabulary:
            "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/je-pojmem-ze-slovníku",
          hiddenLabels: "http://www.w3.org/2004/02/skos/core#hiddenLabel",
          examples: "http://www.w3.org/2004/02/skos/core#example",
          related: "http://www.w3.org/2004/02/skos/core#related",
          relatedMatch: "http://www.w3.org/2004/02/skos/core#relatedMatch",
          definition: {
            "@id": "http://www.w3.org/2004/02/skos/core#definition",
            "@container": "@language",
          },
          state:
            "http://onto.fel.cvut.cz/ontologies/slovník/agendový/popis-dat/pojem/má-stav-pojmu",
          parentTerms: "http://www.w3.org/2004/02/skos/core#broader",
          altLabels: {
            "@id": "http://www.w3.org/2004/02/skos/core#altLabel",
            "@container": "@language",
          },
          exactMatchTerms: "http://www.w3.org/2004/02/skos/core#exactMatch",
        },
        uri: "http://onto.fel.cvut.cz/ontologies/slovnik/ml-test/pojem/lokalita",
        types: [
          "http://onto.fel.cvut.cz/ontologies/ufo/object",
          "http://www.w3.org/2004/02/skos/core#Concept",
        ],
        label: {
          cs: "Lokalita",
          en: "Locality",
        },
        subTerms: [],
        notations: [],
        definition: {
          cs: "Plocha nebo soubor ploch, popřípadě část plochy, vymezená na základě převažujícího charakteru. Upraveno. Ještě přidána explicitně zmíněná testovací plocha, aby se nám přidala do definičně souvisejících pojmů.\n\nDefinice znovu upravena, abychom spustili textovou analýzu. A znovu.",
          en: "English definition of the term Locality is just a placeholder proving that multilingual definition works.",
        },
        sources: [],
        altLabels: [],
        hiddenLabels: [],
        examples: [],
        vocabulary: {
          uri: "http://onto.fel.cvut.cz/ontologies/slovnik/ml-test",
        },
        glossary: {
          uri: "http://onto.fel.cvut.cz/ontologies/slovnik/ml-test/glosář",
        },
        state: {
          uri: "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/publikovaný-pojem",
        },
      };
      return JsonLdUtils.compactAndResolveReferences(input, TERM_CONTEXT).then(
        (result: TermData) => {
          expect(result[VocabularyUtils.SKOS_ALT_LABEL]).not.toBeDefined();
          expect(result[VocabularyUtils.SKOS_HIDDEN_LABEL]).not.toBeDefined();
          expect(result[VocabularyUtils.SKOS_EXAMPLE]).not.toBeDefined();
        }
      );
    });
  });

  describe("compactAndResolveReferencesAsArray", () => {
    it("returns array with items compacted from the specified JSON-LD", () => {
      const input = [
        require("../../rest-mock/vocabulary"),
        require("../../rest-mock/vocabulary"),
      ];
      input[0][VocabularyUtils.PREFIX + "popisuje-dokument"][
        VocabularyUtils.PREFIX + "má-dokumentový-slovník"
      ] = {
        "@id": input[0]["@id"],
      };
      return JsonLdUtils.compactAndResolveReferencesAsArray(
        input,
        VOCABULARY_CONTEXT
      ).then((result: any[]) => {
        expect(Array.isArray(result)).toBeTruthy();
        expect(result[0].document.vocabulary).toBeDefined();
        expect(result[0].document.vocabulary).toEqual(result[0]);
      });
    });

    it("returns array with single item compacted from specified JSON-LD", () => {
      const input = require("../../rest-mock/vocabulary");
      input[VocabularyUtils.PREFIX + "popisuje-dokument"][
        VocabularyUtils.PREFIX + "má-dokumentový-slovník"
      ] = {
        "@id": input["@id"],
      };
      return JsonLdUtils.compactAndResolveReferencesAsArray(
        input,
        VOCABULARY_CONTEXT
      ).then((result: any[]) => {
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toEqual(1);
        expect(result[0].document.vocabulary).toBeDefined();
        expect(result[0].document.vocabulary).toEqual(result[0]);
      });
    });

    it("returns an empty array when input JSON-LD is an empty array", () => {
      const input: object = [];
      return JsonLdUtils.compactAndResolveReferencesAsArray(
        input,
        VOCABULARY_CONTEXT
      ).then((result: any[]) => {
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toEqual(0);
      });
    });

    it("returns and empty array when input JSON-LD contains context and empty graph", () => {
      const input: object = { "@context": {}, "@graph": [] };
      return JsonLdUtils.compactAndResolveReferencesAsArray(
        input,
        VOCABULARY_CONTEXT
      ).then((result: any[]) => {
        expect(Array.isArray(result)).toBeTruthy();
        expect(result.length).toEqual(0);
      });
    });
  });
});
