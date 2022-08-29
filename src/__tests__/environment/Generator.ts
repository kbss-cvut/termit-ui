import User from "../../model/User";
import VocabularyUtils from "../../util/VocabularyUtils";
import Term, { TermData } from "../../model/Term";
import Vocabulary, { VocabularyData } from "../../model/Vocabulary";
import Resource from "../../model/Resource";
import { langString } from "../../model/MultilingualString";
import Comment from "../../model/Comment";
import ValidationResult from "../../model/ValidationResult";
import TermOccurrence from "../../model/TermOccurrence";

export default class Generator {
  public static readonly URI_BASE =
    "http://onto.fel.cvut.cz/ontologies/application/termit";

  public static randomInt(
    min: number = 0,
    max: number = Number.MAX_SAFE_INTEGER
  ) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  public static randomBoolean() {
    return Math.random() < 0.5;
  }

  public static generateUri() {
    return Generator.URI_BASE + "/instance-" + Generator.randomInt();
  }

  public static generateUser(iri?: string) {
    return new User({
      iri: iri ? iri : Generator.generateUri(),
      firstName: "FirstName" + Generator.randomInt(0, 10000),
      lastName: "LastName" + Generator.randomInt(0, 10000),
      username: "username" + Generator.randomInt() + "@kbss.felk.cvut.cz",
      types: [VocabularyUtils.USER],
    });
  }

  /**
   * Randomly shuffles the specified array, using the Knuth shuffle algorithm.
   * @param arr The array to shuffle
   * @return {*} The shuffled array (it is the same instance as the parameter)
   */
  public static shuffleArray(arr: object[]) {
    let currentIndex = arr.length;
    while (currentIndex !== 0) {
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      const tmp = arr[currentIndex];
      arr[currentIndex] = arr[randomIndex];
      arr[randomIndex] = tmp;
    }
    return arr;
  }

  public static randomItem<T>(arr: T[]): T {
    return arr[Generator.randomInt(0, arr.length)];
  }

  public static generateTerm(vocabularyIri?: string) {
    return new Term({
      iri: Generator.generateUri(),
      label: langString("Term " + Generator.randomInt(0, 10000)),
      vocabulary: vocabularyIri ? { iri: vocabularyIri } : undefined,
    });
  }

  public static generateVocabulary(seed: Partial<VocabularyData> = {}) {
    return new Vocabulary(
      Object.assign(
        this.generateAssetData("Vocabulary " + this.randomInt(0, 10000)),
        seed
      )
    );
  }

  public static generateResource() {
    return new Resource(
      this.generateAssetData("Resource " + this.randomInt(0, 10000))
    );
  }

  public static generateAssetData(label?: string): {
    iri: string;
    label: string;
  } {
    return {
      iri: Generator.generateUri(),
      label: label ? label : "Asset " + Generator.randomInt(0, 100),
    };
  }

  public static generateComment() {
    return new Comment({
      iri: Generator.generateUri(),
      content: "Comment " + Generator.randomInt(0, 100),
      asset: Generator.generateTerm(),
      author: Generator.generateUser(),
    });
  }

  public static generateValidationResult(
    termIri: string = Generator.generateUri()
  ) {
    return new ValidationResult(
      Generator.generateUri(),
      { iri: termIri, label: { cs: "Test term" } },
      { iri: VocabularyUtils.SH_VIOLATION },
      [{ language: "cs", value: "Chyba" }],
      { iri: "https://example.org/sourceShape" },
      { iri: VocabularyUtils.SKOS_PREF_LABEL }
    );
  }

  public static generateOccurrenceOf(term: TermData) {
    return new TermOccurrence({
      term,
      iri: Generator.generateUri(),
      types: [VocabularyUtils.TERM_OCCURRENCE],
      target: {
        selectors: [],
        source: {
          iri: Generator.generateUri(),
        },
        types: [],
      },
    });
  }
}
