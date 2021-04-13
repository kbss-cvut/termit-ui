import Term from "../../../model/Term";
import Generator from "../../../__tests__/environment/Generator";
import Ajax from "../../../util/Ajax";
import { langString } from "../../../model/MultilingualString";
import { checkLabelUniqueness, isTermValid } from "../TermValidationUtils";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Constants from "../../../util/Constants";

describe("TermValidationUtils", () => {
  let term: Term;

  beforeEach(() => {
    term = new Term({
      iri: Generator.generateUri(),
      label: Object.assign(langString("Test", "cs"), langString("Test", "en")),
      scopeNote: langString("test"),
      vocabulary: { iri: Generator.generateUri() },
    });
    Ajax.head = jest.fn().mockResolvedValue({});
  });

  describe("checkLabelUniqueness", () => {
    it("handles unique label when no callback is provided", async () => {
      Ajax.head = jest.fn().mockRejectedValue({ status: 404, data: "" });
      await checkLabelUniqueness(
        VocabularyUtils.create(Generator.generateUri()),
        "test",
        Constants.DEFAULT_LANGUAGE,
        () => null
      );
    });
  });

  it("isTermValid returns true if all labels in languages are unique", () => {
    const valid = isTermValid(term, {
      cs: false,
      en: false,
    });
    expect(valid).toBeTruthy();
  });
});
