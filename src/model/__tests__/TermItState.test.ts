import TermItState from "../TermItState";
import Vocabulary from "../Vocabulary";
import Generator from "../../__tests__/environment/Generator";
import Document from "../Document";
import VocabularyUtils from "../../util/VocabularyUtils";
import File from "../File";

describe("TermItState", () => {
  describe("toLoggable", () => {
    it("breaks circular references to make the state object loggable by JSON.stringify", () => {
      const sut = new TermItState();
      const vocabulary = new Vocabulary({
        iri: Generator.generateUri(),
        label: "Test vocabulary",
      });
      const document = new Document({
        iri: Generator.generateUri(),
        label: "test",
        types: [VocabularyUtils.DOCUMENT],
        vocabulary,
        files: [],
      });
      vocabulary.document = document;
      sut.vocabulary = vocabulary;
      for (let i = 0; i < 5; i++) {
        document.files.push(
          new File({
            iri: Generator.generateUri(),
            label: "File " + i,
            owner: document,
          })
        );
      }

      const result = TermItState.toLoggable(sut);
      const json = JSON.stringify(result);
      expect(json).toBeDefined();
      expect(result.vocabulary.document.vocabulary).not.toEqual(
        result.vocabulary.vocabulary
      );
    });
  });
});
