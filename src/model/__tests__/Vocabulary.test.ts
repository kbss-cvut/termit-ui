import Vocabulary, { VocabularyData } from "../Vocabulary";
import Document from "../Document";
import VocabularyUtils from "../../util/VocabularyUtils";
import Generator from "../../__tests__/environment/Generator";
import AccessLevel from "../acl/AccessLevel";
import { langString } from "../MultilingualString";

describe("Vocabulary", () => {
  let data: VocabularyData;

  beforeEach(() => {
    data = {
      iri: "http://data.iprpraha.cz/zdroj/slovnik/test-vocabulary/vocabularies/metropolitan-plan",
      label: langString("Metropolitan plan"),
    };
  });

  describe("constructor", () => {
    it("adds vocabulary type when it is missing", () => {
      const testVocabulary = new Vocabulary(data);
      expect(testVocabulary.types).toBeDefined();
      expect(
        testVocabulary.types!.indexOf(VocabularyUtils.VOCABULARY)
      ).not.toEqual(-1);
    });

    it("does not add vocabulary type when it is already present", () => {
      data.types = [VocabularyUtils.VOCABULARY];
      const testVocabulary = new Vocabulary(data);
      expect(testVocabulary.types).toBeDefined();
      expect(
        testVocabulary.types!.indexOf(VocabularyUtils.VOCABULARY)
      ).not.toEqual(-1);
      expect(
        testVocabulary.types!.lastIndexOf(VocabularyUtils.VOCABULARY)
      ).toEqual(testVocabulary.types!.indexOf(VocabularyUtils.VOCABULARY));
    });

    it("initializes document when document data are available", () => {
      const vocData: VocabularyData = {
        iri: Generator.generateUri(),
        label: langString("Test vocabulary"),
        types: [VocabularyUtils.VOCABULARY],
        document: {
          iri: Generator.generateUri(),
          label: "Test document",
          types: [VocabularyUtils.DOCUMENT],
          files: [
            {
              iri: Generator.generateUri(),
              label: "Test file",
              types: [VocabularyUtils.FILE],
            },
          ],
        },
      };
      const result = new Vocabulary(vocData);
      expect(result.document).toBeInstanceOf(Document);
    });
  });

  describe("get unmappedProperties", () => {
    it("returns map of unmapped properties with values in vocabulary", () => {
      const extraProperty =
        "http://onto.fel.cvut.cz/ontologies/termit/extra-one";
      const value = "value]";
      data[extraProperty] = value;
      const testVocabulary = new Vocabulary(data);
      const result = testVocabulary.unmappedProperties;
      expect(result.has(extraProperty)).toBeTruthy();
      expect(result.get(extraProperty)).toEqual([value]);
      expect(result.size).toEqual(1);
    });

    it("returns map of unmapped properties with values containing multiple values per property", () => {
      const extraProperty =
        "http://onto.fel.cvut.cz/ontologies/termit/extra-one";
      const values = ["v1", "v2", "v3"];
      data[extraProperty] = values;
      const testVocabulary = new Vocabulary(data);
      const result = testVocabulary.unmappedProperties;
      expect(result.has(extraProperty)).toBeTruthy();
      expect(result.get(extraProperty)).toEqual(values);
    });
  });

  describe("set unmappedProperties", () => {
    it("merges specified properties into the object state", () => {
      const testVocabulary = new Vocabulary(data);
      const unmappedProps = new Map<string, string[]>();
      const extraProperty =
        "http://onto.fel.cvut.cz/ontologies/termit/extra-one";
      const value = ["1", "2"];
      unmappedProps.set(extraProperty, value);
      testVocabulary.unmappedProperties = unmappedProps;
      expect(testVocabulary[extraProperty]).toBeDefined();
      expect(testVocabulary[extraProperty]).toEqual(value);
    });

    it("is symmetric to getter", () => {
      const testVocabulary = new Vocabulary(data);
      const unmappedProps = new Map<string, string[]>();
      const extraProperty =
        "http://onto.fel.cvut.cz/ontologies/termit/extra-one";
      const value = ["1", "2"];
      unmappedProps.set(extraProperty, value);
      testVocabulary.unmappedProperties = unmappedProps;
      expect(testVocabulary.unmappedProperties).toEqual(unmappedProps);
    });

    it("deletes unmapped property if it is not present in updated map", () => {
      const extraProperty = Generator.generateUri();
      data[extraProperty] = "test";
      const testVocabulary = new Vocabulary(data);
      const newProperty = Generator.generateUri();
      testVocabulary.unmappedProperties = new Map([[newProperty, ["test1"]]]);
      expect(testVocabulary[newProperty]).toEqual(["test1"]);
      expect(testVocabulary[extraProperty]).not.toBeDefined();
    });
  });

  describe("toJsonLd", () => {
    it("removes allImportedVocabularies attribute", () => {
      const sut = new Vocabulary(data);
      sut.allImportedVocabularies = [Generator.generateUri()];
      const jsonLd: any = sut.toJsonLd();
      expect(jsonLd.allImportedVocabularies).not.toBeDefined();
    });

    it("breaks reference between vocabulary and document", () => {
      const sut = new Vocabulary(data);
      sut.document = new Document({
        iri: Generator.generateUri(),
        label: "test",
        types: [VocabularyUtils.DOCUMENT],
        vocabulary: sut,
        files: [],
      });
      const result = sut.toJsonLd();
      const json = JSON.stringify(result);
      expect(json).toBeDefined();
      expect(result.document!.vocabulary).not.toEqual(sut);
    });

    it("removes accessLevel attribute", () => {
      const sut = new Vocabulary(
        Object.assign({}, data, { accessLevel: AccessLevel.WRITE })
      );
      const result = sut.toJsonLd();
      expect(result.accessLevel).not.toBeDefined();
    });
  });

  describe("isSnapshot", () => {
    it("returns true when vocabulary has snapshot type", () => {
      const regular = Generator.generateVocabulary();
      const snapshot = Generator.generateVocabulary();
      snapshot.types = [VocabularyUtils.VOCABULARY_SNAPSHOT];
      expect(regular.isSnapshot()).toBeFalsy();
      expect(snapshot.isSnapshot()).toBeTruthy();
    });
  });

  describe("snapshotOf", () => {
    it("returns undefined when instance is not a snapshot", () => {
      const sut = Generator.generateVocabulary();
      expect(sut.isSnapshot()).toBeFalsy();
      expect(sut.snapshotOf()).not.toBeDefined();
    });

    it("returns IRI of vocabulary whose snapshot this instance is", () => {
      const currentIri = Generator.generateUri();
      const snapshotOf = {};
      snapshotOf[VocabularyUtils.IS_SNAPSHOT_OF_VOCABULARY] = currentIri;
      const sut = Generator.generateVocabulary(snapshotOf);
      sut.types = [VocabularyUtils.VOCABULARY_SNAPSHOT];

      expect(sut.snapshotOf()).toEqual(currentIri);
    });
  });

  describe("isEditable", () => {
    it("returns false when vocabulary is a snapshot", () => {
      const sut = Generator.generateVocabulary();
      sut.types = [VocabularyUtils.VOCABULARY_SNAPSHOT];
      expect(sut.isEditable()).toBeFalsy();
    });

    it("returns false when vocabulary has read only type", () => {
      const sut = Generator.generateVocabulary();
      sut.types = [VocabularyUtils.IS_READ_ONLY];
      expect(sut.isEditable()).toBeFalsy();
    });

    it("returns true for regular vocabulary", () => {
      expect(Generator.generateVocabulary().isEditable()).toBeTruthy();
    });
  });
});
