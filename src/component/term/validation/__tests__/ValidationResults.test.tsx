import { intlFunctions } from "../../../../__tests__/environment/IntlUtil";
import ValidationResults from "../ValidationResults";
import Generator from "../../../../__tests__/environment/Generator";
import ValidationMessage from "../ValidationMessage";
import Term from "../../../../model/Term";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import * as redux from "react-redux";

describe("Validation Results", () => {
  let term: Term;

  beforeEach(() => {
    term = Generator.generateTerm();
  });

  it("groups results by term and orders them most problematic first", () => {
    const anotherTermIri = "https://example.org/term2";
    const validationResults = {
      [term.iri]: [
        Generator.generateValidationResult(term.iri),
        Generator.generateValidationResult(term.iri),
      ],
      [anotherTermIri]: [Generator.generateValidationResult(anotherTermIri)],
    };
    jest.spyOn(redux, "useSelector").mockReturnValue(validationResults);
    const component = mountWithIntl(
      <ValidationResults term={term} {...intlFunctions()} />
    );

    const rows = component.find("div").find(ValidationMessage);
    expect(rows.length).toEqual(2);
  });
});
