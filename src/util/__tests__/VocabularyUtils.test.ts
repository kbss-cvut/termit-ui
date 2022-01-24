/**
 * Vocabulary used by the application ontological model.
 */
import VocabularyUtils, {
  getShortVocabularyLabel,
  IRI,
  IRIImpl,
} from "../VocabularyUtils";

describe("VocabularyUtils", () => {
  const namespace = VocabularyUtils.PREFIX;

  describe("getFragment", () => {
    it("extracts fragment from last path element", () => {
      expect(VocabularyUtils.getFragment(namespace + "y")).toEqual("y");
    });

    it("extracts fragment from hash", () => {
      expect(VocabularyUtils.getFragment("http://test.org/x#y")).toEqual("y");
    });
  });

  describe("create IRI", () => {
    it("creates IRI instance", () => {
      const iri: IRI = VocabularyUtils.create(namespace + "y");
      expect(iri.fragment).toEqual("y");
      expect(iri.namespace).toEqual(namespace);
    });

    it("creates IRI instance from IRI with hash fragment", () => {
      const iri: IRI = VocabularyUtils.create("http://test.org/x#y");
      expect(iri.fragment).toEqual("y");
      expect(iri.namespace).toEqual("http://test.org/x#");
    });
  });

  describe("IRIImpl", () => {
    describe("toString", () => {
      it("returns namespace concatenated with fragment", () => {
        const iri = new IRIImpl("y", namespace);
        expect(iri.toString()).toEqual(iri.namespace + iri.fragment);
      });

      it("returns fragment when namespace is not defined", () => {
        const iri = new IRIImpl("y");
        expect(iri.toString()).toEqual(iri.fragment);
      });
    });

    describe("equals", () => {
      it("returns true for two IRIs with same fragment and namespace", () => {
        const iri = new IRIImpl("y", namespace);
        expect(iri.equals({ fragment: "y", namespace })).toBeTruthy();
        expect(iri.equals(iri)).toBeTruthy();
      });

      it("returns false for two IRIs with different fragment or namespace", () => {
        const iri = new IRIImpl("y", namespace);
        expect(iri.equals({ fragment: "y" })).toBeFalsy();
        expect(iri.equals(new IRIImpl("x", namespace))).toBeFalsy();
      });

      it("returns false when specified IRI is null or undefined", () => {
        const iri = new IRIImpl("y", namespace);
        expect(iri.equals()).toBeFalsy();
        expect(iri.equals(null)).toBeFalsy();
      });
    });
  });

  describe("getShortVocabularyLabel", () => {
    it("returns SGoV-based label when the IRI pattern matches", () => {
      const input = "https://slovník.gov.cz/datový/dtm";
      expect(getShortVocabularyLabel(input)).toEqual("D-SGoV-dtm");
    });

    it("returns part of IRI after last slash", () => {
      const input = "http://data.europa.eu/cmisa/actor-types";
      expect(getShortVocabularyLabel(input)).toEqual("actor-types");
    });

    it("returns part of IRI after last slash with removed duplicate non-alphanumeric characters", () => {
      const input = "https://slovník.gov.cz/test---ukázka";
      expect(getShortVocabularyLabel(input)).toEqual("test-ukázka");
    });

    it("returns part of IRI after last slash with 'slovník' and everything before it removed", () => {
      const input = "https://slovník.gov.cz/testovací-slovník---ukázka";
      expect(getShortVocabularyLabel(input)).toEqual("ukázka");
    });

    it("uses only first two letters of each word if the part of IRI after last slash is too long", () => {
      const input =
        "https://slovník.gov.cz/testovací-slovník---ukázka-zpracování-pojmu-normy";
      expect(getShortVocabularyLabel(input)).toEqual("uk-zp-po-no");
    });

    it("returns part of IRI after last slash if processing would reduce its length to 0", () => {
      const input = "https://slovník.gov.cz/testovací-slovník";
      expect(getShortVocabularyLabel(input)).toEqual("testovací-slovník");
    });
  });
});
