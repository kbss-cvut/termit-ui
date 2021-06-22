import FormValidationResult, { Severity } from "../ValidationResult";
import Generator from "../../../__tests__/environment/Generator";
import Validation from "../../../util/Validation";

describe("ValidationResult", () => {
  describe("fromOntoValidationResult", () => {
    it("constructs instance even when message in specified locale is not available", () => {
      const ontoResult = Generator.generateValidationResult();
      const formResult = FormValidationResult.fromOntoValidationResult(
        ontoResult,
        "en"
      );
      expect(formResult.severity).toBeDefined();
      expect(formResult.message).not.toBeDefined();
    });

    it("constructs instance with correct severity", () => {
      const errorResult = Generator.generateValidationResult();
      errorResult.sourceShape.iri = Validation.QUALITY_AFFECTING_RULES[0];
      const errorFormResult = FormValidationResult.fromOntoValidationResult(
        errorResult,
        "cs"
      );
      expect(errorFormResult.severity).toEqual(Severity.ERROR);

      const warningResult = Generator.generateValidationResult();
      warningResult.sourceShape.iri = Generator.generateUri();
      const warningFormResult = FormValidationResult.fromOntoValidationResult(
        warningResult,
        "cs"
      );
      expect(warningFormResult.severity).toEqual(Severity.WARNING);
    });
  });
});
